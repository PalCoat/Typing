import type { PageServerLoad } from "../$types";

export const load = (async ({ params }) => {
    const race = params.race;
    return { race };
}) satisfies PageServerLoad;
