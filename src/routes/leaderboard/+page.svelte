<script lang="ts">
    import "../../app.css";
    import Trophy from "$lib/components/trophy.svelte";
    import Profile from "$lib/components/profile.svelte";

    import type { PageServerData } from './$types';
    export let data: PageServerData;
    const scores : PageServerData = insertionSort(data);

    function insertionSort(arr : PageServerData) {
    for (let i = 1; i < arr.tests.length; i++) {
        for (let j = i - 1; j > -1; j--) {
            if (arr.tests[j + 1].WPS > arr.tests[j].WPS) {
                [arr.tests[j + 1], arr.tests[j]] = [arr.tests[j], arr.tests[j + 1]];
            }
        }
    }
    return arr;
}
</script>
<!--
<div class="flex justify-center">
    <div class="flex flex-col w-1/3">
        <div class="flex justify-between">
            <div class="flex gap-2">
                <p>#</p>
                <p>Name</p>
            </div>
            <p>Score (WPM)</p>
            <p>Date</p>
        </div>
        <div class="flex justify-between">
            <div>
                {#each scores.tests as score, i}
                <div class="flex gap-2">
                    <p>{i + 1}.</p>
                    <p>{score.user?.name}</p>
                </div>
                {/each}
            </div>
            <div>
                {#each scores.tests as score}
                <div>
                    <p>{score.WPS}</p>
                </div>
                {/each}
            </div>
            <div>
                {#each scores.tests as score}
                <div>
                    <p>{score.date.toLocaleDateString()}</p>
                </div>
                {/each}
            </div>
        </div>
    </div>
</div>
-->

<div class="flex justify-center">
    <div class="flex flex-col w-1/3">
        <div class="flex p-2">
            <p class="basis-[5%]">#</p>
            <p class="basis-[40%]">Name</p>
            <p class="basis-[25%] text-right">Score (WPM)</p>
            <p class="basis-[30%] text-right">Date</p>
        </div>
        {#each scores.tests as score, i}
            {#if i % 2 == 0}
                <div class="flex bg-skin-secondary_accent p-2 rounded">
                    <p class="basis-[5%]">{i + 1}.</p>
                    <p class="basis-[40%]">{score.user?.name}</p>
                    <p class="basis-[25%] text-right">{score.WPS}</p>
                    <p class="basis-[30%] text-right">{score.date.toLocaleDateString()}</p>
                </div>
            {:else}
                <div class="flex p-2 rounded">
                    <p class="basis-[5%]">{i + 1}.</p>
                    <p class="basis-[40%]">{score.user?.name}</p>
                    <p class="basis-[25%] text-right">{score.WPS}</p>
                    <p class="basis-[30%] text-right">{score.date.toLocaleDateString()}</p>
                </div>
            {/if}
        {/each}
    </div>
</div>