<script lang="ts">
    import { onMount } from "svelte";
    import { getSocket } from '$lib/scripts/Socket';

    type Racer = {
        name: string;
        wpm: number;
        progress: number;
    }

    let socket: WebSocket
    let complete = false;
    let racers : Racer[] = [];
    let sentence : string = "";
    let word : string = "";
    let wpm : number = 0;
    let progress : number = 0;
    let startTime : number = 0;
    let currentTime : number = 0;
    let endTime : number = 0;

    onMount(() => {
        socket = getSocket();

        socket.addEventListener("message", (event) => {
            let data = JSON.parse(event.data.toString());
            if (data.endTime != undefined) {
                endTime = data.endTime;
                startTime = 0;
                return;
            }
            if (Array.isArray(data)) {
                racers = data;
                return;
            }
            if (data.sentence != undefined) {
                sentence = data.sentence.toString();
                startTime = data.time;
                return;
            }
            const index = racers.findIndex(({name}) => name == data.name);
            if (index == -1) {
                racers.push({
                    name: data.name,
                    wpm: data.wpm,
                    progress: data.progress,
                })
            } else {
                racers[index].wpm = data.wpm;
                racers[index].progress = data.progress;
            }
        });
    });

    function Message() {
        if (complete) return;
        const json = {wpm: WordsPerMinute(), progress: Progress()};
        if (socket == undefined) return;
        socket.send(JSON.stringify(json));
    }

    function Accuracy(): number {
        if (word.length == 0) return 0;
        let correct = 0;
        let length = Math.min(word.length, sentence.length);
        for (let i = 0; i < length; i++) {
            if (CheckCharacterAt(i)) {
                correct++;
            }
        }
        return correct / length;
    }

    function Progress() : number {
        return Math.round((word.length * Accuracy() / sentence.length) * 100)
    }

    function WordsPerMinute() : number {
        if (word.length < 5) return 0;
        if (startTime == 0) return 0;
        let length = Math.min(word.length, sentence.length);
        let placeholder = Math.round(
            ((length * Accuracy()) /
                ((Date.now() - startTime) / 1000) /
                4.7) *
                60
        );
        if (Number.isFinite(placeholder) && !Number.isNaN(placeholder)) {
            return placeholder;
        }
        return 0;
    }

    function CheckCharacterAt(index: number) {
        if (sentence[index] == word[index]) {
            return true;
        }
        return false;
    }

    function UpdateWordsPerMinute() {
        currentTime = Date.now();
        wpm = WordsPerMinute();
        progress = Progress();
    }

    function HandleInput() {
        if (complete == true) return;
        if (Progress() >= 100) complete = true;
        socket.send(JSON.stringify({
            completedTime: Date.now(),
        }));
    }

    setInterval(UpdateWordsPerMinute, 250);
    setInterval(Message, 1000);
</script>

<div class="flex justify-center">
    <div class="flex flex-col w-1/2 gap-2">
        <div class="flex justify-center gap-2">
            {#key racers}
                {#each racers as racer}
                    <div class="flex flex-col gap-2 w-32 bg-skin-accent rounded shadow-2xl p-2">
                        <p class="text-center text-2xl">{racer.name}</p>
                        <div class="flex flex-col gap-2 bg-skin-secondary_accent rounded shadow-2xl p-2">
                            <p class="text-center">{racer.wpm}</p>
                            <p class="text-center">{racer.progress}%</p>
                        </div>
                    </div>
                {/each}
            {/key}
            <div class="flex flex-col gap-2 w-32 bg-skin-accent rounded shadow-2xl p-2">
                <p class="text-center text-2xl">You</p>
                <div class="flex flex-col gap-2 bg-skin-secondary_accent rounded shadow-2xl p-2">
                    <p class="text-center">{wpm}</p>
                    <p class="text-center">{progress}%</p>
                </div>
            </div>
        </div>
        {#key currentTime}
            {#if currentTime > startTime}
            {#if endTime != 0}
                <p class="text-3xl text-center">Ending in: {Math.round((endTime - Date.now()) / 1000)}</p>
            {/if}
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
            {:else}
                {#if startTime != 0}
                    <p class="text-3xl text-center">Starting in: {Math.round((startTime - Date.now()) / 1000)}</p>
                {/if}
                <div class="text-3xl flex-wrap flex blur-lg">
                    {sentence}
                </div>
            {/if}
        {/key}
        <input
        bind:value={word}
        type="text"
        ondrop="return false"
        onpaste="return false"
        placeholder="Wait for the race to start"
        class="shadow-2xl p-2 rounded bg-skin-accent"
        on:input={() => HandleInput()}
        />
    </div>
</div>
