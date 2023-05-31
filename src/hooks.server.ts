import type { Handle } from "@sveltejs/kit";
import { WebSocketServer } from "ws";

export const handle: Handle = async ({ event, resolve }) => {
    let session = event.cookies.get("session");
    event.locals.session = session ? session : "";

    return await resolve(event);
};
