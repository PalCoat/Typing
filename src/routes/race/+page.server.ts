import type { PageServerLoad, Actions } from "../$types";
import { prisma } from "$lib/scripts/Database";
import { streams, count } from "$lib/scripts/Streams";
import { State } from "$lib/scripts/States";
import { Sentence } from "$lib/scripts/Script";
import { redirect } from "@sveltejs/kit";

let countValue : number;
count.subscribe(value => {
    countValue = value;
});

const sentenceLength = 10;
let state: State = State.Waiting;
let timeToStart: number;
let timeToEnd: number;
let sentence: string;

setInterval(() => {
    TryStartingRace();
    TryEndingRace();
}, 5000);

export const load = (async ({ locals }) => {
    const user = await prisma.user.findFirst({
        where: { session: locals.session },
    });

    if (!user) throw redirect(302, "/");
    SendToEveryClientExcept(locals.session, {
        name: user.name,
        wpm: 0,
        progress: 0
    });    
    return { name: user?.name };
}) satisfies PageServerLoad;

export const actions: Actions = {
    //Clients progress data gets sent to every other client
    Performance: async ({ request, locals }) => {
        SendToEveryClientExcept(locals.session, await request.json())
    },
    State: async ({ locals }) => {
        switch(state) {
            case State.Starting: {
                SendTo(locals.session, {
                    timeUntilStart: timeToStart - Date.now(),
                    state
                })
                break;
            }
            case State.Ending: {
                SendTo(locals.session, {
                    timeUntilEnd: timeToEnd - Date.now(),
                    state
                })
                break;
            }
            case State.Racing: {
                SendTo(locals.session, {
                    sentence,
                    state
                })
                break;
            }
            default: {
                break;
            }
        }
    },
} satisfies Actions;

function TryStartingRace() {
    if (countValue < 2) return;
    if (state != State.Waiting) return;

    state = State.Starting;
    sentence = Sentence(sentenceLength);
    timeToStart = Date.now() + 15000;
    SendToEveryClientExcept("", {
        timeUntilStart: 15000,
        sentence
    });
}

function TryEndingRace() {
    if (countValue > 2) return;
    if (state != State.Racing) return;
    state = State.Waiting;
    timeToEnd = Date.now() + 15000;
    SendToEveryClientExcept("", {
        timeUntilEnd: 15000
    });
}

const encoder = new TextEncoder();
function SendToEveryClientExcept(client: string, message: any) {
    for (const session in streams) {

        const controller = streams[session];
        
        const encoded = encoder.encode(JSON.stringify(message));
        if (session != client) {
            controller.enqueue(encoded);
        }
    }
}

function SendTo(client: string, message: any) {
    const encoded = encoder.encode(JSON.stringify(message));
    streams[client].enqueue(encoded);
}