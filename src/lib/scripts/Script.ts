const words: string[] = [
    "strange",
    "knew",
    "never",
    "who",
    "love",
    "hate",
    "one",
    "in",
    "she",
    "would",
    "red",
    "cold",
    "warm",
    "help",
    "could",
    "hotel",
    "new",
];

export function Sentence(length: number): string {
    let previousWord: string = "";
    let sentence: string = RandomWord(previousWord);
    length -= 1;
    previousWord = sentence;
    while (length > 0) {
        previousWord = RandomWord(previousWord);
        sentence += " " + previousWord;
        length -= 1;
    }
    return sentence;
}

function RandomWord(previousWord: string): string {
    let word: string = words[GetRandomInt(0, words.length)];
    if (word == previousWord) {
        return RandomWord(previousWord);
    }
    return word;
}

function GetRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}