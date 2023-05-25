<script lang="ts">
    import "../app.css";
    import { onMount } from "svelte"
    import { Test } from "$lib/scripts/Script";
    const test : Test = new Test();
    let sentence : string = "";
    const sentenceLength = 15;
    let word : string = "";
    let startDate : Date;
    let input : HTMLElement;
    let wordsPerMinute : number = 0;
    let lastWordsPerMinute : number = 0;
    let lastAccuracy : number = 0;
    ResetSentence();
    onMount(() => input.focus())

    function ResetSentence() {
        sentence = test.Sentence(sentenceLength);
        word = ""
        wordsPerMinute = 0;
        input?.focus()
    }

    async function SubmitText() {
        if (sentence.length > word.length) return;
        const WPS : number = WordsPerMinute();
        lastWordsPerMinute = WPS;
        lastAccuracy = Math.round(Accuracy() * 100);
        const formData = {
            WPS,
        };

        fetch("?/Submit", {
        method: 'POST',
        body: JSON.stringify(formData),
        })
        .then()
        .catch();
        ResetSentence();
    }

    function WordsPerMinute() {
        let length = Math.min(word.length, sentence.length);
        let placeholder = Math.round((((length * Accuracy()) / ((new Date().getTime() - startDate.getTime()) / 1000)) / 4.7) * 60);
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
        return (correct / length);
    }

    function HandleInput() {
        if (word.length >= sentence.length) {
            SubmitText();
        }
        if (word.length == 1) {
            startDate = new Date();
        }
        wordsPerMinute = WordsPerMinute();
    }

    function CheckCharacterAt(index: number) {
        if (sentence[index] == word[index]) {
            return true;
        }
        return false;
    }
</script>

<div class="flex justify-center">
    <div class="flex flex-col gap-2 w-1/2">
        <div class="flex justify-center">
            <div class="flex gap-10 text-3xl">
                <p>{wordsPerMinute}</p>
                {#if lastWordsPerMinute != 0}
                    <p>|</p>
                    <p>{lastWordsPerMinute}</p>
                    <p>{lastAccuracy}%</p>
                {/if}
            </div>
        </div>
        <p class="text-3xl flex justify-center">
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
                                <span class="underline">
                                    &nbsp;
                                </span>
                            {:else}
                                <span>&nbsp;</span>
                            {/if}
                        {:else}
                          {#if i == word.length}
                                <span class="underline">
                                    {character}
                                </span>
                            {:else}
                                <span>{character}</span>
                            {/if}
                        {/if}
                    {:else}
                        {#if character == " "}
                            <span>&nbsp;</span>
                        {:else}
                            <span class="text-red-700 bg-red-300">
                                {character}
                            </span>
                        {/if}
                    {/if}
                {/each}
            {/key}
        </p>
        <input bind:this={input} bind:value={word} type="text" ondrop="return false" onpaste="return false" placeholder="{sentence}" class="shadow-2xl p-2 rounded" on:input={() => HandleInput()} on:change={() => SubmitText()}>
        <div class="flex justify-center">
            <button class="shadow-2xl p-2 w-min rounded align-middle" on:click={() => ResetSentence()}>Reset</button>
        </div>
    </div>
</div>