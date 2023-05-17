<script lang="ts">
    import "../app.css";
    import Icon from "../lib/components/icon.svelte";
    import Trophy from "../lib/components/trophy.svelte";
    import Profile from "../lib/components/profile.svelte";
</script>

<div class="w-3/4 flex flex-col mx-auto">
    <div class="flex flex-row justify-start gap-5 bg-skin-fill shadow-lg m-2 p-2 rounded text-xl">
            <a class="flex flex-row gap-2 bg-skin-fill-accent shadow-2xl px-2 rounded" href="/">
                <Icon/>
                <p class="align-middle leading-10">Typist</p>
            </a>
            <a class="flex flex-row gap-2 shadow-2xl px-2 rounded" href="/leaderboard">
                <Trophy/>
                <p class="align-middle leading-10">Leaderboard</p>
            </a>
            <div class="ml-auto flex flex-row gap-2">
                <a class="flex flex-row gap-2  shadow-2xl px-2 rounded" href="/signup">
                    <Profile/>
                    <p class="align-middle leading-10">Sign Up</p>
                </a>
                <a class="flex flex-row gap-2 ml-auto shadow-2xl px-2 rounded" href="/signin">
                    <Profile/>
                    <p class="align-middle leading-10">Sign In</p>
                </a>
            </div>
        </div>
</div>
<slot/>