import type { Actions } from "./$types";
import { SubmitScore } from "$lib/scripts/Submit";

export const actions: Actions = {
    Submit: async ({ request, locals }) => {
        const data = await request.json();
        SubmitScore(data.wpm, locals);
    },
} satisfies Actions;
