<script>
    import "../app.css";
    import Icon from "../lib/components/icon.svelte";
    import Trophy from "../lib/components/trophy.svelte";
</script>

<div class="flex flex-row justify-start gap-5 shadow-lg m-2 p-2 rouned-5 text-xl">
        <a class="flex flex-row shadow-2xl px-2 align-middle" href="/">
            <Icon/>
            <p>Typist</p>
        </a>
        <a class="flex flex-row shadow-2xl px-2 align-middle" href="/Leaderboard">
            <Trophy/>
            <p class="align-middle">Leaderboard</p>
        </a>
</div>

<slot/>