import { redirect, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { streams } from "$lib/scripts/Streams";
import { prisma } from "$lib/scripts/Database";
import { State, Command } from "$lib/scripts/States";
import { Sentence } from "$lib/scripts/Script";

const sentenceLength = 10;
let state: State = State.Waiting;
let timeToStart: number = Date.now() + 15000;
let timeToEnd: number = 0;
let sentence: string = "";

let racers : {name: string, wpm: number, progress: number}[] = [];
let completers : {name: string, wpm: number, timeForComplete: number}[] = [];

setInterval(() => {
    TryStarting();
}, 5000);

setInterval(() => {
    TryRacing();
    TryWaiting();
}, 500);


export const GET: RequestHandler = async ({ locals }) => {
    try {
        const user = await prisma.user.findUniqueOrThrow({
            where: { session: locals.session },
        });

        if (!user) throw redirect(302, "/signin");

        //Maybe check if that user is already playing

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
    } catch {
        return new Response();
    }
};

export const POST = (async ({ request, locals }) => {
    const data = await request.json();
    if (data.command == Command.Performance) {
        SendToEverySessionExcept(locals.session, {
            command: Command.Performance,
            name: streams[locals.session!].name,
            wpm: data.wpm,
            progress: data.progress
        });
    }
    if (data.timeForComplete) {
        SendToEverySessionExcept(locals.session, {
            name: streams[locals.session!].name,
            wpm: data.wpm,
            timeForComplete: data.timeForComplete
        });
        if (completers.length < 1 && state == State.Racing) {
            state = State.Ending;
            timeToEnd = Date.now() + 15000;
            
            for (const sessionIteration in streams) {
                SendToSession(sessionIteration, {
                    state,
                    timeUntilEnd: 15000,
                    sentence,
                });
            }
        }
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
                racers: WithoutRacer(session),
                completers : WithoutCompleter(session)
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

function TryStarting() {
    if (racers.length < 2) return;
    if (state != State.Waiting) return;

    state = State.Starting;
    timeToStart = Date.now() + 15000;
    for (const sessionIteration in streams) {
        if (sessionIteration) {
            SendToSession(sessionIteration, {
                state,
                timeUntilStart: 15000,
                racers: WithoutRacer(sessionIteration)
            });
        }
    }
}

function TryRacing() {
    if (state != State.Starting) return;
    if (Date.now() < timeToStart) return;

    state = State.Racing;
    sentence = Sentence(sentenceLength);
    SendToEverySessionExcept("", {
        state,
        sentence
    })
}

function TryWaiting() {
    if (state != State.Ending) return;
    if (Date.now() < timeToEnd) return;

    state = State.Waiting;
    SendToEverySessionExcept("", {
        state,
    })
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
    SendToEverySessionExcept(session, {
        command: Command.Remove,
        name: streams[session!].name,
    });
}

function WithoutRacer(session: string): {name: string, wpm: number, progress: number}[] {
    const index = racers.findIndex(({name}) => name == streams[session!].name);
    if (index == -1) return racers;
    const updatedRacers = racers.slice();
    updatedRacers.splice(index, 1);
    return updatedRacers;
}

    function WithoutCompleter(session: string): {name: string, wpm: number, timeForComplete: number}[] {
        const index = completers.findIndex(({name}) => name == streams[session!].name);
        if (index == -1) return completers;
        const updatedCompleters = completers.slice();
        updatedCompleters.splice(index, 1);
        return updatedCompleters;
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