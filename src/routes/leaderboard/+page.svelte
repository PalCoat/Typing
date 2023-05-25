<script lang="ts">
    import "../../app.css";
    import Trophy from "../../lib/components/trophy.svelte";
    import Profile from "../../lib/components/profile.svelte";
    
    import type { PageServerData } from './$types';
    export let data: PageServerData;
</script>

<div class="flex justify-center">
    <div class="flex flex-col w-1/3">
        <div class="flex justify-between">
            <p>Name</p>
            <p>Score (WPS)</p>
            <p>Date</p>
        </div>
        <div class="flex justify-between">
            <div>
                {#each data.tests as test, i}
                <div class="flex gap-2">
                    <p>{i + 1}.</p>
                    <p>{test.user?.name}</p>
                </div>
                {/each}
            </div>
            <div>
                {#each data.tests as test}
                <div>
                    <p>{test.WPS}</p>
                </div>
                {/each}
            </div>
            <div>
                {#each data.tests as test}
                <div>
                    <p>{test.date.toLocaleDateString()}</p>
                </div>
                {/each}
            </div>
        </div>
    </div>
</div>