import type { LayoutServerLoad } from "./$types";
import { prisma } from "$lib/scripts/Database";

export const load = (async ({ locals }) => {
    if (!locals.session) return {name: undefined}
    try {
        const user = await prisma.user.findUniqueOrThrow({
            where: { session: locals.session },
        });
        if (user) {
            return {name: user?.name};
        }
    } catch (error) {
        console.log(error);
    }
}) satisfies LayoutServerLoad;