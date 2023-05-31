/*
import type { User } from "@prisma/client";
import type { PageServerLoad } from "../$types";
import { prisma } from "$lib/scripts/Database";
import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { WebSocketServer } from "ws";

export const load = (async ({ locals }) => {
    const racer = await prisma.user.findFirst({
        where: { session: locals.session },
    });
    if (racer == null) throw redirect(303, "/signin");
}) satisfies PageServerLoad;

export const actions: Actions = {
    Join: async ({ locals }) => {
        const racer = await prisma.user.findFirst({
            where: { session: locals.session },
        });
        if (racer == null) throw redirect(303, "/signin");
        if (racers.find(({ id }) => id === racer.id) != undefined)
            return { racers };
        racers.push(racer);
        return { racers };
    },
} satisfies Actions;

Save all users connected
constantly set a progress and wpm to every user
constatly send progress and wpm of each user to every user

const server: WebSocketServer = new WebSocketServer({ port: 80 });

server.on("connection", function connection(ws, req) {
    const session = req.headers.cookie?.split("=")[1];

    if (!session) {
        return;
    }

    ws.on("error", console.error);

    ws.on("message", function message(data) {
        console.log(session + " sent " + data);
        ws.send("thanks " + session);
    });

    ws.send("You are connected");
});
*/
