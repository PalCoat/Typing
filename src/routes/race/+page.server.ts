import type { PageServerLoad } from "../$types";
import { prisma } from "$lib/scripts/Database";
import { redirect } from "@sveltejs/kit";
export const load = (async ({ locals }) => {
    const racer = await prisma.user.findFirst({
        where: { session: locals.session },
    });
    if (racer == null) throw redirect(303, "/signin");
}) satisfies PageServerLoad;