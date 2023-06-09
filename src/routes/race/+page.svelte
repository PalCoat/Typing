<script lang="ts">
    import { onMount } from "svelte";
    import ReconnectingEventSource from "reconnecting-eventsource";
    import { State, Command } from "$lib/scripts/States";
    import type { PageServerData } from './$types';
    import { browser } from "$app/environment";
    import { onDestroy } from "svelte";
    export let data: PageServerData;

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
        const placeholder = Math.round((Math.min(word.length, sentence.length) * Accuracy() / sentence.length) * 100)
        if (Number.isNaN(placeholder)) return 0;
        return placeholder;
    }

    function WordsPerMinute() : number {
        if (word.length < 5) return 0;
        let length = Math.min(word.length, sentence.length);
        let placeholder = Math.round(
            ((length * Accuracy()) /
                ((Date.now() - timeToStart) / 1000) /
                4.7) *
                60
        );
        if (Number.isFinite(placeholder) && !Number.isNaN(placeholder)) return placeholder;
        return 0;
    }

    function CheckCharacterAt(index: number) {
        if (sentence[index] == word[index]) {
            return true;
        }
        return false;
    }

    type Racer = {
        name: string,
        wpm: number,
        progress: number,
    }

    type Completers = {
        name: string,
        wpm: number,
        completedTime: number,
    }

    let state: State = State.Waiting;
    let racers : Racer[] = [];
    let timeToStart : number;
    let timeToEnd: number = 0;
    let sentence: string = "";
    let completers : Completers[] = [];

    let word : string = "";
    let wpm : number = 0;
    let progress : number = 0;

    if (browser) {
        let eventSource: ReconnectingEventSource;

        eventSource = new ReconnectingEventSource("/race");

        eventSource.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (!message) return;
            console.log(message);
            if (message.state) {
                state = message.state;
            }
            if (message.timeUntilStart) {
                timeToStart = Date.now() + message.timeUntilStart;
            }
            if (message.timeUntilEnd) {
                timeToEnd = Date.now() + message.timeUntilEnd;
            }
            if (message.racers) {
                racers = message.racers;
            }
            if (message.command == Command.Add) {
                racers.push({name: message.name, wpm: 0, progress: 0})
            }
        };

        const interval = setInterval(() => {
            if (eventSource.readyState != ReconnectingEventSource.OPEN) return;
            SendPerformance();
        }, 5000)

        onDestroy(() => {
            clearInterval(interval);
            eventSource.close();
        });
    }

    function SendMessage(message: any) {
        fetch("/race", {
            method: "POST",
            body: JSON.stringify(message),
            headers: {
                'content-type': 'application/json'
            }
        }).then().catch()
    }

    function SendPerformance() {
        SendMessage({
            wpm: WordsPerMinute(),
            progress: Progress()
        })
    }

    function UpdateClientStates() {
        wpm = WordsPerMinute();
        progress = Progress();
    }

    function HandleInput() {
    }
</script>

<div class="flex justify-center min-h-[55vh]">
    <div class="flex flex-col justify-start w-1/2 gap-2">
        <div class="flex justify-center gap-2">
            {#key racers}
                {#each racers as racer}
                    <div class="flex flex-col gap-2 w-32 bg-skin-accent rounded shadow-2xl p-2">
                        <p class="text-center text-2xl">{racer.name}</p>
                        <div class="flex flex-col gap-2 bg-skin-secondary_accent rounded shadow-2xl p-2">
                            {#if racer.wpm}
                                <p class="text-center">{racer.wpm}</p>
                            {:else} 
                                <p class="text-center">0</p>
                            {/if}
                            {#if racer.wpm}
                                <p class="text-center">{racer.progress}%</p>
                            {:else} 
                                <p class="text-center">0%</p>
                            {/if}
                        </div>
                    </div>
                {/each}
            {/key}
            <div class="flex flex-col gap-2 w-32 bg-skin-accent rounded shadow-2xl p-2">
                <p class="text-center text-2xl">{data?.name}</p>
                <div class="flex flex-col gap-2 bg-skin-secondary_accent rounded shadow-2xl p-2">
                    <p class="text-center">{wpm}</p>
                    <p class="text-center">{progress}%</p>
                </div>
            </div>
        </div>
        {#if state == State.Waiting}
            <div class="text-3xl text-center">Waiting for Players</div>
        {:else if timeToStart > Date.now()}
            <p class="text-3xl text-center">Starting in: {Math.round((timeToStart - Date.now()) / 1000)}</p>
            <div class="text-3xl flex-wrap flex blur-lg">
                Sneaky little rascal attempting to deceive, eh? Don't think I won't catch you. Cheating's not the way to go, my friend. Play fair and test your mettle instead.
            </div>
        {:else}
            {#if timeToEnd > Date.now()}
                <p class="text-3xl text-center">Ending in: {Math.round((timeToEnd - Date.now()) / 1000)}</p>
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
                            <span class="text-red-700 bg-red-300">&nbsp;</span>
                        {:else}
                            <span class="text-red-700 bg-red-300">
                                {character}
                            </span>
                        {/if}
                    {/each}
                {/key}
            </div>
        {/if}
        <input
        bind:value={word}
        type="text"
        ondrop="return false"
        onpaste="return false"
        placeholder="Wait for the race to start"
        class="shadow-2xl p-2 rounded bg-skin-accent"
        on:input={() => HandleInput()}
        />
        {#if completers.length > 0}
            <div class="flex justify-center gap-10">
                {#if typeof completers[1] !== 'undefined'}
                    <div class="mt-auto">
                        <p class="text-2xl text-center">{completers[1].name}</p>
                        <div class="bg-gradient-to-r from-yellow-400 to-yellow-600 h-[175px] w-[105px] rounded-xl">
                            <div class="text-2xl text-center">{completers[1].wpm}</div>
                            <div class="text-2xl relative top-[20%] text-center">2nd</div>
                        </div>
                    </div>
                {/if}
                {#if typeof completers[0] !== 'undefined'}
                    <div>
                        <p class="text-2xl text-center">{completers[0].name}</p>
                        <div class="bg-gradient-to-r from-yellow-300 to-yellow-500 h-[250px] w-[125px] rounded-xl">
                            <div class="text-2xl text-center">{completers[0].wpm}</div>
                            <div class="text-2xl relative top-[20%] text-center">1st</div>
                        </div>
                    </div>
                {/if}
                {#if typeof completers[2] !== 'undefined'}
                    <div class="mt-auto">
                        <p class="text-2xl text-center">{completers[2].name}</p>
                        <div class="bg-gradient-to-r from-yellow-500 to-yellow-700 h-[125px] w-[105px] rounded-xl">
                            <div class="text-2xl text-center">{completers[2].wpm}</div>
                            <div class="text-2xl relative top-[20%] text-center">3rd</div>
                        </div>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>
