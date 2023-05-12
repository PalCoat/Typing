//import { prisma } from "./Database";

const words: string[] = [
    "strange",
    "begin",
    "knew",
    "miss",
    "who",
    "love",
    "hate",
    "one",
    "in",
    "she",
    "will",
    "not",
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
}

function GetRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}
