import type { Handle } from "@sveltejs/kit";
import { Initialize } from "$lib/scripts/Streams";

Initialize();

export const handle: Handle = async ({ event, resolve }) => {
    if (event.request.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
                "Access-Control-Allow-Origin": "*",
            },
        });
    }

    let session = event.cookies.get("session");
    event.locals.session = session ? session : "";

    const response = await resolve(event);
    response.headers.append("Access-Control-Allow-Origin", `*`);
    return response;
};