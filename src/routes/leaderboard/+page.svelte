<script lang="ts">
    import "../../app.css";
    import type { PageServerData } from './$types';
    export let data: PageServerData;
    const scores : PageServerData = insertionSort(data);

    function insertionSort(arr : PageServerData) {
        for (let i = 1; i < arr.scores.length; i++) {
            for (let j = i - 1; j > -1; j--) {
                if (arr.scores[j + 1].wpm > arr.scores[j].wpm) {
                    [arr.scores[j + 1], arr.scores[j]] = [arr.scores[j], arr.scores[j + 1]];
                }
            }
        }
        return arr;
    }
</script>

<div class="flex justify-center">
    <div class="flex flex-col w-1/3">
        <div class="flex p-2">
            <p class="basis-[5%]">#</p>
            <p class="basis-[35%]">Name</p>
            <p class="basis-[25%] text-right">Score (WPM)</p>
            <p class="basis-[35%] text-right">Date</p>
        </div>
        {#each scores.scores as score, i}
            {#if i % 2 == 0}
                <div class="flex bg-skin-secondary_accent p-2 rounded">
                    <p class="basis-[5%]">{i + 1}.</p>
                    <p class="basis-[35%]">{score.user?.name}</p>
                    <p class="basis-[25%] text-right">{score.wpm}</p>
                    <p class="basis-[35%] text-right">{score.date.toLocaleDateString()}</p>
                </div>
            {:else}
                <div class="flex p-2 rounded">
                    <p class="basis-[5%]">{i + 1}.</p>
                    <p class="basis-[35%]">{score.user?.name}</p>
                    <p class="basis-[25%] text-right">{score.wpm}</p>
                    <p class="basis-[35%] text-right">{score.date.toLocaleDateString()}</p>
                </div>
            {/if}
        {/each}
    </div>
</div>