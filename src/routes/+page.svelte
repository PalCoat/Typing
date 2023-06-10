<script lang="ts">
    import { onMount } from "svelte";
    import { Sentence } from "$lib/scripts/Script";
    let sentence: string = "";
    const sentenceLength = 15;
    let word: string = "";
    let startDate: number;
    let input: HTMLElement;
    let wordsPerMinute: number = 0;
    let lastWordsPerMinute: number = 0;
    let lastAccuracy: number = 0;

    onMount(() => {
        input.focus();
        ResetSentence();
    });

    function ResetSentence() {
        sentence = Sentence(sentenceLength);
        word = "";
        wordsPerMinute = 0;
        input?.focus();
    }

    async function SubmitText() {
        if (sentence.length > word.length) return;
        const wpm: number = WordsPerMinute();
        lastWordsPerMinute = wpm;
        lastAccuracy = Math.round(Accuracy() * 100);

        fetch("?/Submit", {
            method: "POST",
            body: JSON.stringify({wpm}),
        }).then().catch()
        ResetSentence();
    }

    function WordsPerMinute() : number {
        if (word.length < 5) return 0;
        if (startDate == null) return 0;
        let length = Math.min(word.length, sentence.length);
        let placeholder = Math.round(
            ((length * Accuracy()) /
                ((Date.now() - startDate) / 1000) /
                4.7) *
                60
        );
        if (Number.isFinite(placeholder) && !Number.isNaN(placeholder)) {
            return placeholder;
        }
        return 0;
    }

    function Accuracy(): number {
        let correct = 0;
        let length = Math.min(word.length, sentence.length);
        for (let i = 0; i < length; i++) {
            if (CheckCharacterAt(i)) {
                correct++;
            }
        }
        return correct / length;
    }

    function HandleInput() {
        if (word.length >= sentence.length) {
            SubmitText();
        }
        if (word.length == 1) {
            startDate = Date.now();
        }
    }

    function CheckCharacterAt(index: number) {
        if (sentence[index] == word[index]) {
            return true;
        }
        return false;
    }

    function UpdateWordsPerMinute() {
        wordsPerMinute = WordsPerMinute();
    }

    setInterval(UpdateWordsPerMinute, 250);
</script>

<div class="flex justify-center">
    <div class="flex flex-col gap-5 w-1/2">
        <div class="flex justify-center">
            <div class="flex justify-center text-3xl w-full">
                <p class="basis-48 text-center">{wordsPerMinute}</p>
                {#if lastWordsPerMinute != 0}
                    <p class="basis-2 text-center">|</p>
                    <p class="basis-24 text-center">{lastWordsPerMinute}</p>
                    <p class="basis-24 text-center">{lastAccuracy}%</p>
                {/if}
            </div>
        </div>
        <div class="text-3xl flex-wrap flex">
            {#key word}
                {#each sentence as character, i}
                    {#if CheckCharacterAt(i)}
                        {#if character == " "}
                            <span>&nbsp;</span>
                        {:else}
                            <span class="text-green-700 bg-green-300">
                                {character}
                            </span>
                        {/if}
                    {:else if i > word.length - 1}
                        {#if character == " "}
                            {#if i == word.length}
                                <span class="underline">&nbsp;</span>
                            {:else}
                                <span>&nbsp;</span>
                            {/if}
                        {:else if i == word.length}
                            <span class="underline">
                                {character}
                            </span>
                        {:else}
                            <span>{character}</span>
                        {/if}
                    {:else if character == " "}
                        <span>&nbsp;</span>
                    {:else}
                        <span class="text-red-700 bg-red-300">
                            {character}
                        </span>
                    {/if}
                {/each}
            {/key}
        </div>
        <input
            bind:this={input}
            bind:value={word}
            type="text"
            ondrop="return false"
            onpaste="return false"
            placeholder={sentence}
            class="shadow-2xl p-2 rounded bg-skin-accent"
            on:input={() => HandleInput()}
            on:change={() => SubmitText()}
        />
        <div class="flex justify-center">
            <button
                class="shadow-2xl p-2 w-min rounded align-middle bg-skin-accent"
                on:click={() => ResetSentence()}>Reset</button
            >
        </div>
    </div>
</div>