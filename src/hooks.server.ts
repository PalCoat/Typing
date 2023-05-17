import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
    let session = event.cookies.get("session");
    if (session) {
        event.locals.session = session;
    }

    return resolve(event);
};
