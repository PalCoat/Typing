import type { PageServerLoad } from "../$types";
import { prisma } from "$lib/scripts/Database";
import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
    const user = await prisma.user.findFirst({
        where: { session: locals.session },
    });

    if (!user) throw redirect(302, "/");    
    return { name: user?.name };
}) satisfies PageServerLoad;
