<script lang="ts">
    import "../app.css";
    import Icon from "$lib/components/icon.svelte";
    import Trophy from "$lib/components/trophy.svelte";
    import Profile from "$lib/components/profile.svelte";
    import Flag from "$lib/components/flag.svelte";

    import type { LayoutServerData } from './$types';
    
    export let data: LayoutServerData;
</script>

<div class="w-3/4 flex flex-col mx-auto">
    <div class="flex flex-row justify-start gap-2 shadow-lg m-2 p-2 rounded text-xl bg-skin-accent">
            <a class="flex flex-row gap-2 shadow-2xl px-2 rounded bg-skin-secondary_accent" href="/">
                <Icon/>
                <p class="align-middle leading-10">Typister</p>
            </a>
            <a class="flex flex-row gap-2 shadow-2xl px-2 rounded bg-skin-secondary_accent" href="/leaderboard">
                <Trophy/>
                <p class="align-middle leading-10">Leaderboard</p>
            </a>
            {#if data?.name}
            <a class="flex flex-row gap-2 shadow-2xl px-2 rounded bg-skin-secondary_accent" href="/race">
                <Flag/>
                <p class="align-middle leading-10">Race</p>
            </a>
                <a class="flex flex-row gap-2 shadow-2xl ml-auto px-2 rounded bg-skin-secondary_accent" href="/profile">
                    <Profile/>
                    <p class="align-middle leading-10">{data?.name}</p>
                </a>
            {:else}
            <div class="ml-auto flex flex-row gap-2">
                <a class="shadow-2xl px-2 rounded bg-skin-secondary_accent" href="/signup">
                    <p class="align-middle leading-10">Sign Up</p>
                </a>
                <a class="ml-auto shadow-2xl px-2 rounded bg-skin-secondary_accent" href="/signin">
                    <p class="align-middle leading-10">Sign In</p>
                </a> 
            </div>
            {/if}
        </div>
</div>

<slot/>

<div class="flex justify-center mt-auto">
    <div class="h-32 w-[75%] m-2 bg-skin-accent rounded flex justify-center p-10 gap-10">
        <div class="flex flex-col justify-center">
            <p class="text-center italic">Made with ❤️ by Pal</p>
            <p class="text-center">Contact me:</p>
            <p>pal.david.miskolczi@gmail.com</p>
        </div>
        <div class="flex flex-col justify-center">
            <p class="italic">Icons by various authors</p>
            <div class="text-xs">
                <p>Icon by <a href="https://freeicons.io/profile/714">Raj Dev</a> on <a href="https://freeicons.io">freeicons.io</a></p>
                <p>Icon by <a class="link_pro" href="https://freeicons.io/basic-ui-elements-2/profile-icon-1161">icon king1</a>
                    on <a href="https://freeicons.io">freeicons.io</a></p>
                <p>Icon by <a class="link_pro" href="https://freeicons.io/university/trophy-achievement-champion-winner-cups-icon-133030">Hilmy Abiyyu Asad</a>
                    on <a href="https://freeicons.io">freeicons.io</a></p>
            </div>
        </div>
    </div>
</div>