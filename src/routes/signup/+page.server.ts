import type { Actions } from "./$types";
import { Authentication } from "../../lib/scripts/Authenication";
const autentication: Authentication = new Authentication();

export const actions: Actions = {
    Register: async ({ request, cookies }) => {
        try {
            return await autentication.Register(
                await request.formData(),
                cookies
            );
        } catch {
            return "Internal error";
        }
    },
} satisfies Actions;
