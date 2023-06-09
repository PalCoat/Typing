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
            streams[locals.session!] = {controller, name: user.name};
            AddRacer(locals.session);
            SendState(locals.session);
        },
        cancel() {
            const index = racers.findIndex((temp) => temp.name == streams[locals.session].name);
            racers.splice(index, 1);
            RemoveRacer(locals.session);
            delete streams[locals.session!];
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
        SendToEverySessionExcept(locals.session, {
            name: streams[locals.session!].name,
            wpm: data.wpm,
            progress: data.progress
        });
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

function AddRacer(session: string) {
    const racer = {
        command: Command.Add,
        name: streams[session!].name,
    };
    SendToEverySessionExcept(session, racer);
    racers.push({name: racer.name, wpm: 0, progress: 0});
}

function RemoveRacer(session: string) {
    const racer = {
        command: Command.Remove,
        name: streams[session!].name,
    };
    SendToEverySessionExcept(session, racer);
}

function WithoutRacer(session: string): {name: string, wpm: number, progress: number}[] {
    let temp = racers;
    const index = racers.findIndex((temp) => temp.name == streams[session!].name);
    temp.splice(index, 1);
    return temp;
}

function SendRacers() {
    for (const session in streams) {
        SendToSession(session, {
            racers: WithoutRacer(streams[session!].name)
        })
    }
}

const encoder = new TextEncoder();
function SendToEverySessionExcept(session: string, message: any) {
    for (const sessionIteration in streams) {
        if (sessionIteration != session) {
            SendToSession(sessionIteration, message);
        }
    }
}

function SendToSession(session: string, message: any) {
    const encoded = encoder.encode("data: " + JSON.stringify(message) + "\n\n");
    streams[session!].controller.enqueue(encoded);
}