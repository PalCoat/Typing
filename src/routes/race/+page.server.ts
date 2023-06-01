import type { User } from "@prisma/client";
import type { PageServerLoad } from "../$types";
import { prisma } from "$lib/scripts/Database";
import { redirect } from "@sveltejs/kit";
import WebSocket, { WebSocketServer } from "ws";
import { Test } from "$lib/scripts/Script";
const test: Test = new Test();
let sentence: string = test.Sentence(30);
let racing = false;
let racers: Racer[] = [];
let startTime: number = 0;
let endTime: number = 0;

export const load = (async ({ locals }) => {
    const racer = await prisma.user.findFirst({
        where: { session: locals.session },
    });
    if (racer == null) throw redirect(303, "/signin");
}) satisfies PageServerLoad;

type Racer = {
    name: string;
    wpm: number;
    progress: number;
};

const server: WebSocketServer = new WebSocketServer({ port: 80 });

server.on("connection", async function connection(ws, req) {
    const user = await prisma.user.findFirst({
        where: {
            session: req.headers.cookie?.split("=")[1],
        },
    });

    if (!user) return;
    ws.send(JSON.stringify(returnWithout(user.name)));

    if (racing)
        ws.send(JSON.stringify({ time: startTime, sentence: sentence }));

    racers.push({
        name: user.name,
        wpm: 0,
        progress: 0,
    });

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
    ws.on("error", console.error);

    ws.on("message", function message(data) {
        const json = JSON.parse(data.toString());
        if (json.completeTime != undefined) {
            endTime = Date.now() + 1000 * 15;
            server.clients.forEach(function each(ws) {
                ws.send(
                    JSON.stringify({
                        endTime: endTime,
                    })
                );
            });
            return;
        }

        server.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(
                    JSON.stringify({
                        name: user.name,
                        wpm: json.wpm,
                        progress: json.progress,
                    })
                );
            }
        });
    });
});

setInterval(StartRace, 5000);

setInterval(() => {
    if (endTime == 0) return;
    if (Date.now() < endTime) return;
    sentence = test.Sentence(30);
    racing = false;
    endTime = 0;
}, 1000);

function StartRace() {
    if (server.clients.size < 2) return;
    if (racing) return;
    racing = true;
    startTime = Date.now() + 1000 * 15;
    server.clients.forEach(function each(ws) {
        ws.send(
            JSON.stringify({
                time: startTime,
                sentence: sentence,
            })
        );
    });
}

function returnWithout(name: string): Racer[] {
    let placeholder: Racer[] = racers;
    const index: number = placeholder.findIndex(({ name }) => name == name);
    if (index == -1) return placeholder;
    placeholder.splice(index, 1);
    return placeholder;
}
