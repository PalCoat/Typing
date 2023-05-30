import type { Actions } from "./$types";
import { Authentication } from "$lib/scripts/Authenication";
import { redirect } from "@sveltejs/kit";
const autentication: Authentication = new Authentication();

export const actions: Actions = {
    Login: async ({ request, cookies }) => {
        const data = await autentication.Login(
            await request.formData(),
            cookies
        );
        if (data.success) throw redirect(303, "/");
        return data;
    },
} satisfies Actions;
