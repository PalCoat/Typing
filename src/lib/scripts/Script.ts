import { prisma } from "./Database";

const words: string[] = [
    "strange",
    "knew",
    "miss",
    "who",
    "love",
    "hate",
    "one",
    "in",
    "she",
    "will",
    "see",
];

export class Test {
    Sentence(length: number): string {
        let previousWord: string = "";
        let sentence: string = this.RandomWord(previousWord);
        length -= 1;
        previousWord = sentence;
        while (length > 0) {
            previousWord = this.RandomWord(previousWord);
            sentence += " " + previousWord;
            length -= 1;
        }
        return sentence;
    }

    RandomWord(previousWord: string): string {
        let word: string = words[GetRandomInt(0, words.length)];
        if (word == previousWord) {
            return this.RandomWord(previousWord);
        }
        return word;
    }


    async SubmitTest(length: number, time: number, locals) {
        const user = await prisma.user.findFirst({where: {session: locals.session}});
        if (!user) return;
        const test = prisma.test.create({data: {
            length: length,
            time: time,
            date: new Date(),
            user: user,
        }});

    }
}

function GetRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}
