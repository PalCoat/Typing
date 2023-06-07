import type { Actions } from "./$types";
import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/scripts/Database";
import { Authentication } from "$lib/scripts/Authenication";
const authentication: Authentication = new Authentication();
import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
    if (!locals.session) throw redirect(302, "/");
    const user = await prisma.user.findFirst({
        where: { session: locals.session },
    });
    return { name: user?.name };
}) satisfies PageServerLoad;

export const actions: Actions = {
    Logout: async ({ cookies, locals }) => {
        if ((await authentication.Logout(locals.session)).success) {
            cookies.delete("session", {path: "/"});
            
            cookies.set("session", "", {
                path: "/",
                httpOnly: true,
                sameSite: "strict",
                secure: false,
                maxAge: 60 * 60,
            });
            throw redirect(303, "/");
        }
    },
    Delete: ({ cookies, locals }) => {
        const result = prisma.user.delete({
            where: { session: locals.session },
        });
        cookies.delete("session", {path: "/"});
        throw redirect(303, "/");
    },
};
