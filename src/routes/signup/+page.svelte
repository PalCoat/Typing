<script lang="ts">
    import type { ActionData } from './$types';

    export let form: ActionData;
</script>

<div class="flex flex-row justify-center align-middle">
    <div class="shadow-2xl rounded">
        <form class="flex flex-col gap-5 p-10" method="POST" action="?/Register">
            <input type="text" placeholder="Username" class="shadow-lg" name="username">
            <input type="password" placeholder="Password" class="shadow-lg" name="password">
            <button class="shadow-lg">Sign Up</button>
            <div class="flex justify-center">
                {#if form}
                    {form}
                {/if}
            </div>
        </form>
    </div>
</div>