import type { Actions } from "./$types";
import { Register } from "$lib/scripts/Authenication";
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
    Register: async ({ request, cookies }) => {
        const data = await Register(
            await request.formData(),
            cookies
        );
        if (data.success) throw redirect(303, "/");
        return data;
    },
} satisfies Actions;
