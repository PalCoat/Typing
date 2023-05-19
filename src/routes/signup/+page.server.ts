import type { Actions } from "./$types";
import { Authentication } from "$lib/scripts/Authenication";
const autentication: Authentication = new Authentication();
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
    Register: async ({ request, cookies }) => {
        const data = await autentication.Register(
            await request.formData(),
            cookies
        );
        if (data.success) throw redirect(303, "/");
        return data;
    },
} satisfies Actions;
