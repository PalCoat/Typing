import type {Actions} from "./$types";
import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/scripts/Database";
import { Authentication } from "$lib/scripts/Authenication";
const authentication : Authentication = new Authentication();
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
    if (!locals.session) throw redirect(302, "/");
    const user = await prisma.user.findFirst({
        where: { session: locals.session },
    });
    return {name : user?.name};
    
}) satisfies PageServerLoad;

export const actions : Actions = {
    Logout: ({cookies}) => {
        cookies.delete("session");
        throw redirect(303, "/");
    }
}
