import type { PageServerLoad } from './$types';
import { prisma } from "$lib/scripts/Database";

export const load = (async () => {
    try {
        const scores = await prisma.score.findMany({
            include: {
                user: true,
            }
        });
        return { scores };
    } catch (error) {
        console.log(error);
    }
}) satisfies PageServerLoad;