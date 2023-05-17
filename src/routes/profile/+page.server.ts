import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/scripts/Database";

export const load = (async ({ locals }) => {
    console.log(locals.session);
    const user = await prisma.user.findUnique({
        where: { session: locals.session },
    });
    const name = user?.name;
    return { name };
}) satisfies PageServerLoad;
