import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { count, streams } from "$lib/scripts/Streams";
import { prisma } from "$lib/scripts/Database";

export const GET: RequestHandler = async ({ locals }) => {
    const user = await prisma.user.findFirst({
        where: { session: locals.session },
    });

    if (!user) throw error(404, "Couldn't create ReadableStream");

    const stream = new ReadableStream({
        start(controller) {
            streams[locals.session!] = controller;
            count.update(n => n + 1);
            controller.enqueue("Debug");
            console.log(streams);
        },
        cancel() {
            const stream = streams[locals.session];
            delete streams[locals.session!];
            count.update(n => n - 1);
        },
    });

    return new Response(stream, {
        headers: {
            "content-type": "text/event-stream",
        },
    });
};