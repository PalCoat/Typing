const words = [
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


/**
 * @param {number} length
 * @returns {string}
 */
export function Sentence(length) {
    let previousWord = "";
    let sentence = RandomWord(previousWord);
    length -= 1;
    previousWord = sentence;
    while (length > 0) {
        previousWord = RandomWord(previousWord);
        sentence += " " + previousWord;
        length -= 1;
    }
    return sentence;
}

/**
 * @param {string} previousWord
 * @returns {string}
 */
function RandomWord(previousWord) {
    let word = words[GetRandomInt(0, words.length)];
    if (word == previousWord) {
        return RandomWord(previousWord);
    }
    return word;
}

/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function GetRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}
