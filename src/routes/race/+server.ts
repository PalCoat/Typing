import { redirect, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { streams } from "$lib/scripts/Streams";
import { prisma } from "$lib/scripts/Database";
import { State, Command } from "$lib/scripts/States";
import { Sentence } from "$lib/scripts/Script";

const sentenceLength = 10;
let state: State = State.Waiting;
let timeToStart: number = 0;
let timeToEnd: number = 0;
let sentence: string = "";

let racers : {name: string, wpm: number, progress: number}[] = [];
let sessions: {session: string, name: string}[] = [];

setInterval(() => {
    TryStartingRace();
    TryEndingRace();
}, 5000);


export const GET: RequestHandler = async ({ locals }) => {
    const user = await prisma.user.findFirst({
        where: { session: locals.session },
    });

    if (!user) throw redirect(302, "/signin");

    const stream = new ReadableStream({
        start(controller) {
            streams[locals.session!] = controller;
            AddRacer(locals.session, user.name);
            sessions.push({session: locals.session, name: user.name});
            SendState(locals.session);
        },
        cancel() {
            delete streams[locals.session!];
            let index = sessions.findIndex((temp) => temp.session == locals.session);
            const name = sessions[index].name;
            index = racers.findIndex((temp) => temp.name == name);
            racers.splice(index, 1);
            RemoveRacer(locals.session, user.name);
        },
    });

    return new Response(stream, {
        headers: {
            "content-type": "text/event-stream",
        },
    });
};

export const POST = (async ({ request, locals }) => {
    const data = await request.json();
    if (data.command == Command.Performance) {
        SendToEverySessionExcept(locals.session, await request.json())
    }
    return json(undefined);
}) satisfies RequestHandler;

function SendState(session: string) {
    switch(state) {
        case State.Starting: {
            SendToSession(session, {
                state,
                timeUntilStart: timeToStart - Date.now(),
                racers: WithoutRacer(session)
            })
            break;
        }
        case State.Ending: {
            SendToSession(session, {
                state,
                timeUntilEnd: timeToEnd - Date.now(),
                racers: WithoutRacer(session)
            })
            break;
        }
        case State.Racing: {
            SendToSession(session, {
                state,
                sentence,
                racers: WithoutRacer(session)
            })
            break;
        }
        default: {
            break;
        }
    }
}

function TryStartingRace() {
    if (racers.length < 2) return;
    if (state != State.Waiting) return;

    state = State.Starting;
    sentence = Sentence(sentenceLength);
    timeToStart = Date.now() + 15000;
    SendToEverySessionExcept("", {
        state,
        timeUntilStart: 15000,
        sentence
    });
}

function TryEndingRace() {
    if (racers.length > 2) return;
    if (state != State.Racing) return;

    state = State.Waiting;
    timeToEnd = Date.now() + 15000;
    SendToEverySessionExcept("", {
        state,
        timeUntilEnd: 15000,
        racers,
    });
}

function AddRacer(session: string, name: string) {
    const racer = {
        command: Command.Add,
        name,
    };
    SendToEverySessionExcept(session, racer);
    racers.push({name: racer.name, wpm: 0, progress: 0});
}

function RemoveRacer(session: string, name: string) {
    const racer = {
        command: Command.Remove,
        name,
    };
    SendToEverySessionExcept(session, racer);
    const index = racers.findIndex((temp) => temp.name == name);
    racers.splice(index, 1);
}

function WithoutRacer(session: string): {name: string, wpm: number, progress: number}[] {
    let temp = racers;
    let index = sessions.findIndex((temp) => temp.session == session);
    const name = sessions[index].name;
    index = racers.findIndex((temp) => temp.name == name);
    temp.splice(index, 1);
    return temp;
}

// function SendRacers() {
//     for (const session in streams) {
//         const name = sessions.find((temp) => temp.session == session)?.name;
//         if (name == undefined) return;
//         SendToSession(session, {
//             racers: WithoutRacer(name)
//         })
//     }
// }

const encoder = new TextEncoder();
function SendToEverySessionExcept(session: string, message: any) {
    for (const session in streams) {
        if (session != session) {
            SendToSession(session, message);
        }
    }
}

function SendToSession(session: string, message: any) {
    const controller = streams[session];
    if (!controller) return;

    const encoded = encoder.encode(JSON.stringify(message));
    streams[session].enqueue(encoded);
}