<script lang="ts">
  import ReconnectingEventSource from "reconnecting-eventsource";
  import { State, Command } from "$lib/scripts/States";
  import type { PageServerData } from "./$types";
  import { browser } from "$app/environment";
  import { onDestroy } from "svelte";

  export let data: PageServerData;

  function insertionSort(arr: any) {
    for (let i = 1; i < arr.length; i++) {
      for (let j = i - 1; j > -1; j--) {
        if (arr[j + 1].wpm > arr[j].wpm) {
          [arr[j + 1], arr[j]] = [arr[j], arr[j + 1]];
        }
      }
    }
    return arr;
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

  function Progress(): number {
    const placeholder = Math.round(
      ((Math.min(word.length, sentence.length) * Accuracy()) /
        sentence.length) *
        100
    );
    if (Number.isNaN(placeholder)) return 0;
    return placeholder;
  }

  function WordsPerMinute(): number {
    if (word.length < 5) return 0;
    let length = Math.min(word.length, sentence.length);
    let placeholder = Math.round(
      ((length * Accuracy()) / ((Date.now() - timeToStart) / 1000) / 4.7) * 60
    );
    if (Number.isFinite(placeholder) && !Number.isNaN(placeholder))
      return placeholder;
    return 0;
  }

  function CheckCharacterAt(index: number) {
    if (sentence[index] == word[index]) {
      return true;
    }
    return false;
  }

  let state: State = State.Waiting;
  let racers: { name: string; wpm: number; progress: number }[] = [];
  let timeToStart: number;
  let timeToEnd: number = 0;
  let sentence: string = "";
  let completers: { name: string; wpm: number; timeForComplete: number }[] = [];

  let word: string = "";
  let wordsPerMinute: number = 0;
  let progress: number = 0;
  let completed: boolean = false;

  let currentTime: number = 0;
  let lastProgress: number = 0;
  let lastWordsPerMinute: number = 0;

  setInterval(() => (currentTime = Date.now()), 100);
  setInterval(UpdateClientStates, 500);

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
      if (message.state == State.Waiting) {
        sentence = "";
        word = "";
        completed = false;
        timeToStart = 0;
        timeToEnd = 0;
        completers = [];
        wordsPerMinute = 0;
        progress = 0;
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
      if (message.sentence) {
        sentence = message.sentence;
      }
      if (message.command == Command.Add) {
        const index = racers.findIndex(({ name }) => name == message.name);
        if (index != -1) return;
        racers.push({ name: message.name, wpm: 0, progress: 0 });
        //Something wonky with how svelte updates object arrays
        //A value has to change for it to register and render
        racers[racers.length - 1].name = message.name;
      } else if (message.command == Command.Remove) {
        const index = racers.findIndex(({ name }) => name == message.name);
        if (index == -1) return;
        racers.slice(index, 1);
      } else if (message.command == Command.Performance) {
        const index = racers.findIndex(({ name }) => name == message.name);
        if (index == -1) {
          racers.push({
            name: message.name,
            wpm: message.wpm,
            progress: message.progress,
          });
        } else {
          racers[index].wpm = message.wpm;
          racers[index].progress = message.progress;
        }
      }
      if (message.timeForComplete) {
        const index = completers.findIndex(({ name }) => name == message.name);
        if (index != -1) return;
        completers.push({
          name: message.name,
          wpm: message.wpm,
          timeForComplete: message.timeForComplete,
        });
        //Something wonky with how svelte updates object arrays
        //A value has to change for it to register and render
        completers[completers.length - 1].name = message.name;
        completers = insertionSort(completers);
      }
      if (message.completers) {
        completers = insertionSort(message.completers);
      }
    };

    const interval = setInterval(() => {
      if (eventSource.readyState != ReconnectingEventSource.OPEN) return;
      TrySendPerformance();
    }, 1000);

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
        "content-type": "application/json",
      },
    })
      .then()
      .catch();
  }

  function TrySendPerformance() {
    if (state == State.Waiting || state == State.Starting) return;
    if (completed) return;
    let currentProgress: number = Progress();
    let currentWordsPerMinute: number = WordsPerMinute();
    if (
      (lastProgress == currentProgress) == true &&
      (lastWordsPerMinute == currentProgress) == true) return;
    SendMessage({
      command: Command.Performance,
      wpm: currentWordsPerMinute,
      progress: currentProgress,
    });
  }

  function UpdateClientStates() {
    if (completed) return;
    wordsPerMinute = WordsPerMinute();
    progress = Progress();
  }

  function HandleInput() {
    if (completed) return;
    if (Progress() < 100) return;
    completed = true;
    SendMessage({
      wpm: WordsPerMinute(),
      timeForComplete: Date.now() - timeToStart,
    });
    completers.push({
      name: data.name,
      wpm: WordsPerMinute(),
      timeForComplete: Date.now() - timeToStart,
    });
    completers = insertionSort(completers);
  }
</script>

<div class="flex justify-center">
  <div class="flex flex-col justify-start w-1/2 gap-2">
    <div class="flex justify-center gap-2">
      {#key racers}
      {#each racers as racer}
        <div
          class="flex flex-col gap-2 w-32 bg-skin-accent rounded shadow-2xl p-2"
        >
          <p class="text-center text-2xl">{racer.name}</p>
          <div
            class="flex flex-col gap-2 bg-skin-secondary_accent rounded shadow-2xl p-2"
          >
            {#if racer.wpm}
              <p class="text-center">{racer.wpm}</p>
            {:else}
              <p class="text-center">0</p>
            {/if}
            {#if racer.progress}
              <p class="text-center">{racer.progress}%</p>
            {:else}
              <p class="text-center">0%</p>
            {/if}
          </div>
        </div>
      {/each}
      {/key}
      <div
        class="flex flex-col gap-2 w-32 bg-skin-accent rounded shadow-2xl p-2"
      >
        <p class="text-center text-2xl">{data?.name}</p>
        <div class="flex flex-col gap-2 bg-skin-secondary_accent rounded shadow-2xl p-2">
          <p class="text-center">{wordsPerMinute}</p>
          <p class="text-center">{progress}%</p>
        </div>
      </div>
    </div>
    {#if state == State.Waiting}
      <div class="text-3xl text-center">Waiting for Players</div>
    {:else if timeToStart > currentTime}
      <p class="text-3xl text-center">
        Starting in: {Math.round((timeToStart - currentTime) / 1000)}
      </p>
      <div class="text-3xl flex-wrap flex blur-lg">
        Sneaky little rascal attempting to deceive, eh? Don't think I won't
        catch you. Cheating's not the way to go, my friend. Play fair and test
        your mettle instead.
      </div>
    {:else}
      {#if timeToEnd > currentTime}
        <p class="text-3xl text-center">
          Ending in: {Math.round((timeToEnd - currentTime) / 1000)}
        </p>
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
        {#if typeof completers[1] !== "undefined"}
          <div class="mt-auto">
            <p class="text-2xl text-center">{completers[1].name}</p>
            <div
              class="bg-gradient-to-r from-yellow-400 to-yellow-600 h-[175px] w-[105px] rounded-xl"
            >
              <div class="text-2xl text-center">{completers[1].wpm}</div>
              <div class="text-2xl relative top-[20%] text-center">2nd</div>
            </div>
          </div>
        {/if}
        {#if typeof completers[0] !== "undefined"}
          <div>
            <p class="text-2xl text-center">{completers[0].name}</p>
            <div
              class="bg-gradient-to-r from-yellow-300 to-yellow-500 h-[250px] w-[125px] rounded-xl"
            >
              <div class="text-2xl text-center">{completers[0].wpm}</div>
              <div class="text-2xl relative top-[20%] text-center">1st</div>
            </div>
          </div>
        {/if}
        {#if typeof completers[2] !== "undefined"}
          <div class="mt-auto">
            <p class="text-2xl text-center">{completers[2].name}</p>
            <div
              class="bg-gradient-to-r from-yellow-500 to-yellow-700 h-[125px] w-[105px] rounded-xl"
            >
              <div class="text-2xl text-center">{completers[2].wpm}</div>
              <div class="text-2xl relative top-[20%] text-center">3rd</div>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
