import type { Actions } from "./$types";
import { Authentication } from "../../lib/scripts/Authenication";
const autentication: Authentication = new Authentication();

export const actions: Actions = {
    Login: async ({ request, cookies }) => {
        try {
            return await autentication.Login(
                await request.formData(),
                cookies
            );
        } catch {
            return "Internal error";
        }
    },
} satisfies Actions;
