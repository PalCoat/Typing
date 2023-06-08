<script lang="ts">
    import { onMount } from "svelte";
    import { getSocket } from '$lib/scripts/Socket'; 
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

    let lastProgress = 0;
    let socket: WebSocket
    let racers : Racer[] = [];
    let word : string = "";
    let wpm : number = 0;
    let progress : number = 0;

    let startTime : number = 0;
    let endTime: number = 0;
    let sentence: string = "";
    let completed: boolean = false;
    let currentTime: number = 0;
    let completers : Completers[] = []; 
    let lastCompleted: number = 0;
    let lastRequest: number = 0;

    onMount(() => {
        socket = getSocket(location.hostname);

        socket.addEventListener("message", (event) => {
            let data = JSON.parse(event.data.toString());
            //console.log(data);

            if (data.completedTime != undefined) {
                const index = completers.findIndex(({name}) => name == data.name);
                if (index == -1) {
                    completers.push({
                        name: data.name,
                        wpm: data.wpm,
                        completedTime: data.completedTime,
                    })
                    const index = completers.findIndex(({name}) => name == data.name);
                    completers[index].wpm = data.wpm;
                    completers[index].completedTime = data.completedTime;
                } else {
                    completers[index].wpm = data.wpm;
                    completers[index].completedTime = data.completedTime;
                }
                completers.sort((firstItem, secondItem) =>  firstItem.completedTime - secondItem.completedTime);
                return;
            }

            if (data.sentence != undefined) {
                if (data.sentence == "") {
                    word = "";
                    sentence = "";
                    completed = false;
                    startTime = 0;
                    endTime = 0;
                    if (Date.now() > lastRequest) {
                        socket.send(JSON.stringify({message: "racers"}));
                        lastRequest = Date.now() + 2 * 1000;
                    }
                    completers = [];
                } else {
                    if (data.startTime > Date.now()) {
                        startTime = Date.now() + 15 * 1000;
                    } else {
                        startTime = data.startTime;
                    }
                    sentence = data.sentence;
                    if (data.endTime > Date.now()) {
                        endTime = Date.now() + 15 * 1000;
                    } else {
                        endTime = data.endTime;
                    }
                    if (Date.now() > lastRequest) {
                        socket.send(JSON.stringify({message: "racers"}));
                        lastRequest = Date.now() + 2 * 1000;
                    }
                }
                return;
            }

            if (Array.isArray(data)) {
                racers = data;
                return;
            }
            
            if (data.progress != undefined) {
                const index = racers.findIndex(({name}) => name == data.name);
                if (index == -1) {
                    racers.push({
                        name: data.name,
                        wpm: data.wpm,
                        progress: data.progress,
                    })
                    const index = racers.findIndex(({name}) => name == data.name);
                    racers[index].wpm = data.wpm;
                    racers[index].progress = data.progress;
                } else {
                    racers[index].wpm = data.wpm;
                    racers[index].progress = data.progress;
                }
                return;
            }
        });
        setTimeout(() => socket.send(JSON.stringify({message: "started"})), 100);
        setTimeout(() => socket.send(JSON.stringify({message: "state"})), 150);
        setTimeout(() => socket.send(JSON.stringify({message: "racers"})), 200);
        setInterval(Update, 250);
        setInterval(Message, 1000);

        setInterval(() => {
            if (socket == undefined) socket = getSocket(location.hostname);
            if (sentence == "") {
                socket.send(JSON.stringify({message: "started"}))
            }
        }, 5000) 
    });

    function Message() {
        if (completed) return;
        const currentProgress = Progress();
        if (currentProgress == lastProgress) return;
        const data = {wpm: WordsPerMinute(), progress: currentProgress};
        if (socket) {
            socket.send(JSON.stringify(data));
        }
        lastProgress = currentProgress;
    }

    function Update() {
        currentTime = Date.now();
        if (completed) return;
        wpm = WordsPerMinute();
        progress = Progress();
    }

    function HandleInput() {
        if (completed) return;
        if (lastCompleted > Date.now()) return;
        if (Progress() < 100) return;
        wpm = WordsPerMinute();
        progress = Progress();
        completed = true;
        const json = {completedTime: Date.now(), wpm: WordsPerMinute()}
        socket.send(JSON.stringify(json));
        lastCompleted = Date.now() + 25 * 1000;
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
                <p class="text-center text-2xl">You</p>
                <div class="flex flex-col gap-2 bg-skin-secondary_accent rounded shadow-2xl p-2">
                    <p class="text-center">{wpm}</p>
                    <p class="text-center">{progress}%</p>
                </div>
            </div>
        </div>
        {#if startTime == 0}
            <div class="text-3xl text-center">Waiting for Players</div>
        {:else if currentTime < startTime}
            <p class="text-3xl text-center">Starting in: {Math.round((startTime - currentTime) / 1000)}</p>
            <div class="text-3xl flex-wrap flex blur-lg">
                Sneaky little rascal attempting to deceive, eh? Don't think I won't catch you. Cheating's not the way to go, my friend. Play fair and test your mettle instead.
            </div>
        {:else if currentTime > startTime}
            {#if currentTime < endTime}
                <p class="text-3xl text-center">Ending in: {Math.round((endTime - currentTime) / 1000)}</p>
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
