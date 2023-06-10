import type { PageServerLoad } from "../$types";
import { prisma } from "$lib/scripts/Database";
import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
    try {
        const user = await prisma.user.findUniqueOrThrow({
            where: { session: locals.session },
        });
    
        if (!user) throw redirect(302, "/");    
        return { name: user?.name };
    } catch (error) {
        console.log(error);
    }

}) satisfies PageServerLoad;
