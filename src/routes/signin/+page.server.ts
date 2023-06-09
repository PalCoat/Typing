import type { Actions } from "./$types";
import { Login} from "$lib/scripts/Authenication";
import { redirect } from "@sveltejs/kit";

export const actions: Actions = {
    Login: async ({ request, cookies }) => {
        const data = await Login(
            await request.formData(),
            cookies
        );
        if (data.success) throw redirect(303, "/");
        return data;
    },
} satisfies Actions;
