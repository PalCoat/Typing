import type { LayoutServerLoad } from "./$types";
import { prisma } from "$lib/scripts/Database";

export const load = (async ({ locals }) => {
    if (!locals.session) return {name: undefined}
    const user = await prisma.user.findFirst({
        where: { session: locals.session },
    });
    if (user) {
        return {name: user?.name};
    }
    
}) satisfies LayoutServerLoad;