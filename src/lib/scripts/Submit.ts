import { prisma } from "$lib/scripts/Database";

export async function SubmitScore(wpm: number, locals: App.Locals) {
    try {
        const user = await prisma.user.findUnique({
            where: { session: locals.session },
        });
        if (!user) return;
        const previousScore = await prisma.score.findMany({
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
        if (previousScore[0].wpm > wpm) return;
        await prisma.score.update({
            where: {
                id: previousScore[0].id,
            },
            data: {
                date: new Date(),
                wpm,
            },
        });
    } catch (error) {
        console.log(error)
    }
}
