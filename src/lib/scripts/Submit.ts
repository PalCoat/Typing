import type { Actions } from "./$types";
import { prisma } from "$lib/scripts/Database";

export class Submit {
    async SubmitTest(WPS: number, locals : App.Locals) {
        const user = await prisma.user.findFirst({where: {session: locals.session}});
        if (!user) return;
        const previousTest = await prisma.test.findFirst({
            where: {
                userId: user.id,
            }
        });
        if (!previousTest) {
            await prisma.test.create({
                data: {
                    WPS,
                    date: new Date(),
                    userId: user.id,
                }
            })
            return
        }
        if (previousTest.WPS > WPS) return;
        const test = await prisma.test.update({
            where: {
                id: previousTest.id,
            },
            data: {
                date: new Date(),
                WPS,
            }
        });
    }
}