<script lang="ts">
    import "../../app.css";
    import Trophy from "../../lib/components/trophy.svelte";
    import Profile from "../../lib/components/profile.svelte";
    
    import type { PageServerData } from './$types';
    export let data: PageServerData;
    console.log(data);
</script>

<div class="flex justify-center">
    <div class="flex flex-col">
        <div class="flex gap-10">
            <p>Name</p>
            <p>Score</p>
            <p>Date</p>
        </div>
        {#each data.tests as test}
            <div class="flex gap-10">
                <p>{test.user?.name}</p>
                <p>{test.WPS}</p>
                <p>{test.date.toLocaleDateString()}</p>
            </div>
        {/each}
    </div>
</div>