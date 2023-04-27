<script lang="ts">
    import "../app.css";
    import Icon from "../lib/components/icon.svelte";
    import Trophy from "../lib/components/trophy.svelte";
    import Profile from "../lib/components/profile.svelte";
</script>

<div>
    <div class="flex flex-row justify-start gap-5 bg-skin-fill shadow-lg m-2 p-2 rouned-5 text-xl rounded">
            <a class="flex flex-row bg-skin-fill-accent shadow-2xl px-2 align-middle rounded" href="/">
                <Icon/>
                <p class="align-middle leading-10">Typist</p>
            </a>
            <a class="flex flex-row shadow-2xl px-2 align-middle rounded" href="/leaderboard">
                <Trophy/>
                <p class="align-middle leading-10">Leaderboard</p>
            </a>
            <a class="flex flex-row justify-self-end shadow-2xl px-2 align-middle rounded" href="/profile">
                <Profile/>
                <p class="align-middle leading-10">Profile</p>
            </a>
    </div>
</div>
<slot/>