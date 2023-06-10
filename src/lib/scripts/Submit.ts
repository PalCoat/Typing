import { prisma } from "$lib/scripts/Database";

export class Submit {
    async SubmitTest(wpm: number, locals: App.Locals) {
        const user = await prisma.user.findFirst({
            where: { session: locals.session },
        });
        if (!user) return;
        const previousScore = await prisma.score.findFirst({
            where: {
                userId: user.id,
            },
        });
        if (!previousScore) {
            await prisma.score.create({
                data: {
                    wpm,
                    date: new Date(),
                    userId: user.id,
                },
            });
            return;
        }
        if (previousScore.wpm > wpm) return;
        await prisma.score.update({
            where: {
                id: previousScore.id,
            },
            data: {
                date: new Date(),
                wpm,
            },
        });
    }
}
