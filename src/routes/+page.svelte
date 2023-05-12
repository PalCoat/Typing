<script lang="ts">
    import "../app.css";
    import { onMount } from "svelte"
    import { Test } from "../lib/scripts/Script";
    const test : Test = new Test();
    let sentence : string = "";
    const sentenceLength = 10;
    let word : string = "";
    let startDate : Date;
    let input;
    let wordsPerMinute : number = 0;
    ResetSentence();
    onMount(() => input.focus())
    function ResetSentence() {
        sentence = test.Sentence(sentenceLength);
        word = ""
        wordsPerMinute = 0;
        input?.focus()
    }

    function SubmitText() {
        if (sentence.length > word.length) {
            console.log("You have to complete the sentence");
        } else {
            console.log("Submitted");
            console.log(Accuracy());
            ResetSentence();
        }
    }

    function WordsPerMinute() {
        let WPM : number = Math.round((((word.length * Accuracy()) / 4.7) / ((new Date().getTime() - startDate.getTime()) / 1000)) * 60);
        if (WPM == Infinity) return 0;
        return WPM
    }

    function Accuracy(): number {
        let correct = 0;
        for (let i = 0; i < word.length; i++) {
            if (CheckCharacterAt(i)) {
                correct++;
            }
        }
        return (correct / sentence.length);
    }

    function HandleInput() {
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
            <p class="text-3xl">{wordsPerMinute}</p>
        </div>
        <p class="text-3xl inline-block justify-center">
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
                            <span>&nbsp;</span>
                        {:else}
                            <span>
                                {character}
                            </span>
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
        <input bind:this={input} bind:value={word} type="text" placeholder="{sentence}" class="shadow-2xl p-2 rounded" on:input={() => HandleInput()} on:change={() => SubmitText()}>
        <div class="flex justify-center">
            <button class="shadow-2xl p-2 w-min rounded align-middle" on:click={() => ResetSentence()}>Reset</button>
        </div>
    </div>
</div>