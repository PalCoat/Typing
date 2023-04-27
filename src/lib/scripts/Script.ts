//import { prisma } from "$lib/Database.ts";

const words: string[] = ["one", "two", "three", "four"];

export class Test {
    Sentence(length: number): string {
        var sentence: string = this.RandomWord();
        while (length > 0) {
            sentence += " " + this.RandomWord();
            length -= 1;
        }
        return sentence;
    }

    RandomWord(): string {
        return words[GetRandomInt(0, words.length)];
    }
}

function GetRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}
