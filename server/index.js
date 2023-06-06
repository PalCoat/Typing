import WebSocket, { WebSocketServer } from "ws";
import { Sentence } from "../src/lib/scripts/Scripter.js";

function returnWithout(username) {
    let placeholder = racers.slice();
    const index = placeholder.findIndex(({ name }) => name == username);
    if (index == -1) return placeholder;
    placeholder.splice(index, 1);
    return placeholder;
}

let racers = [];
let completers = [];

let state = {
    startTime : 0,
    sentence : "",
    endTime : 0,
}

let started = false;
let timeUntilRestart = 0;

import { handler } from '../build/handler.js'
import { createServer } from 'http';
import express from 'express'

const app = express()
const server = createServer(app);

const wss = new WebSocketServer({ server });

wss.on("connection", async function connection(ws, req) {
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
                const index = racers.findIndex(({ name }) => name == user.name);
                if (index == -1) {
                    racers.push({
                        name: user.name,
                        wpm: 0,
                        progress: 0,
                    });   
                }
            
                wss.clients.forEach(function each(client) {
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
            wss.clients.forEach(function each(client) {
                const index = completers.findIndex(({ name }) => name == user.name);
                if (index == -1) {
                    completers.push({
                        name: user.name,
                        wpm: json.wpm,
                        completedTime: json.completedTime,
                    });   
                }
                client.send(JSON.stringify({name: user.name, wpm: json.wpm, completedTime: json.completedTime}));
            });
            if (state.endTime != 0) return;
            state.endTime = Date.now() + 15 * 1000;
            wss.clients.forEach(function each(client) {
                client.send(JSON.stringify(state));
            });
            return;
        }
        
        if (json.progress != undefined) {
            wss.clients.forEach(function each(client) {
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

app.use(handler);

server.listen()

function StartRace() {
    if (started) return;
    if (wss.clients.size < 2) return;
    if (racers.length < 2) return;
    if (Date.now() < timeUntilRestart) return;
    started = true;
    completers = [];
    state.sentence = Sentence(30);
    state.startTime = Date.now() + 15 * 1000;
    wss.clients.forEach(function each(client) {
        client.send(JSON.stringify(state));
    });
}

function EndRace() {
    if (!started) return;
    if (Date.now() < state.endTime || state.endTime == 0) return;
    if (Date.now() < timeUntilRestart) return;
    timeUntilRestart = Date.now() + 5 * 1000;
    started = false;
    state.endTime = 0;
    state.sentence = "";
    state.startTime = 0;
    let remove = [];
    racers.forEach((Racer) => {
        let exist = false;
        completers.forEach(({name}) => {
            if (Racer.name == name) exist = true;
        })
        if (!exist) remove.push(Racer.name);
    })
    remove.forEach((name) => {
        racers = returnWithout(name);
    });
    wss.clients.forEach(function each(client) {
        client.send(JSON.stringify(state));
    });
}

setInterval(StartRace, 5000);
setInterval(EndRace, 5000);