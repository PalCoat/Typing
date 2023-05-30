import type { User } from "@prisma/client";
import type { PageServerLoad } from "../$types";
import { prisma } from "$lib/scripts/Database";
import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import WebSocket, { WebSocketServer } from 'ws';

let racers: User[] = [];

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
    if (racers.find(({ id }) => id === racer.id) != undefined) return {racers};
    racers.push(racer);
    return { racers };
  },
} satisfies Actions;

const server = new WebSocketServer({port:81});

server.on("connection", socket => {
  socket.on("message", message => {
    socket.send("surely " + message);
  });
});

function CheckStart() {
  if (racers.length < 2) return;

}

setInterval(CheckStart, 5000);

