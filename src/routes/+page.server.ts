import type { Actions } from "./$types";
import { Submit } from "$lib/scripts/Submit";
const submit: Submit = new Submit();

export const actions: Actions = {
    Submit: async ({ request, locals }) => {
        const data = JSON.parse(await request.text());
        submit.SubmitTest(data.WPS, locals);
    },
} satisfies Actions;
