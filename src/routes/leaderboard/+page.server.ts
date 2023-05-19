import type { PageServerLoad } from './$types';
import { prisma } from "$lib/scripts/Database";

export const load = (async () => {
    const tests = await prisma.test.findMany({
        include: {
            user: true,
        }
    });
    return { tests };
}) satisfies PageServerLoad;