import type { PageServerLoad } from './$types';
import { prisma } from "$lib/scripts/Database";

export const load = (async () => {
    const scores = await prisma.score.findMany({
        include: {
            user: true,
        }
    });
    return { scores };
}) satisfies PageServerLoad;