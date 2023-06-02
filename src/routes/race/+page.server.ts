import type { PageServerLoad } from "../$types";
import { prisma } from "$lib/scripts/Database";
import { redirect } from "@sveltejs/kit";
import WebSocket, { WebSocketServer } from "ws";
import { Sentence } from "$lib/scripts/Script";

function returnWithout(username: string): Racer[] {
    let placeholder: Racer[] = racers.slice();
    const index: number = placeholder.findIndex(({ name }) => name == username);
    if (index == -1) return placeholder;
    placeholder.splice(index, 1);
    return placeholder;
}

type Racer = {
    name: string,
    wpm: number,
    progress: number,
}

type State = {
    startTime: number,
    sentence: string,
    endTime: number,
}

export const load = (async ({ locals }) => {
    const racer = await prisma.user.findFirst({
        where: { session: locals.session },
    });
    if (racer == null) throw redirect(303, "/signin");
}) satisfies PageServerLoad;


let racers: Racer[] = [];

let state: State = {
    startTime : 0,
    sentence : "",
    endTime : 0,
}

let started : boolean = false;
let timeUntilRestart: number = 0;

const server: WebSocketServer = new WebSocketServer({ port: 81 });

server.on("connection", async function connection(ws, req) {
    const user = await prisma.user.findFirst({
        where: {
            session: req.headers.cookie?.split("=")[1],
        },
    });

    if (!user) return;

    ws.on("error", console.error);

    ws.on("message", function message(data) {
        const json = JSON.parse(data.toString());

        if (json.message != undefined) {
            if (json.message == "state") {
                ws.send(JSON.stringify(state));
            } else if (json.message == "racers") {
                ws.send(JSON.stringify(returnWithout(user.name)));
            } else if (json.message == "started") {
                const index: number = racers.findIndex(({ name }) => name == user.name);
                if (index == -1) {
                    racers.push({
                        name: user.name,
                        wpm: 0,
                        progress: 0,
                    });   
                }
            
                server.clients.forEach(function each(client) {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(
                            JSON.stringify({
                                name: user.name,
                                wpm: 0,
                                progress: 0,
                            })
                        );
                    }
                });
            }
            return;
        }

        if (json.completedTime != undefined) {
            server.clients.forEach(function each(ws) {
                ws.send(JSON.stringify({name: user.name, wpm: json.wpm, completedTime: json.completedTime}));
            });
            if (state.endTime != 0) return;
            state.endTime = Date.now() + 15 * 1000;
            server.clients.forEach(function each(ws) {
                ws.send(JSON.stringify(state));
            });
            return;
        }
        
        if (json.progress != undefined) {
            server.clients.forEach(function each(client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        name: user.name,
                        wpm: json.wpm,
                        progress: json.progress,
                    }));
                }
            });
        }
    });
});

function StartRace() {
    if (started) return;
    if (server.clients.size < 2) return;
    if (racers.length < 2) return;
    if (Date.now() < timeUntilRestart) return;
    started = true;
    state.sentence = Sentence(10);
    state.startTime = Date.now() + 15 * 1000;
    server.clients.forEach(function each(ws) {
        ws.send(JSON.stringify(state));
        ws.send(JSON.stringify(racers));
    });
}

function EndRace() {
    if (!started) return;
    if (Date.now() < state.endTime || state.endTime == 0) return;
    timeUntilRestart = Date.now() + 5 * 1000;
    started = false;
    state.endTime = 0;
    state.sentence = "";
    state.startTime = 0;
    server.clients.forEach(function each(ws) {
        ws.send(JSON.stringify(state));
    });
}
setInterval(StartRace, 5000);
setInterval(EndRace, 5000);