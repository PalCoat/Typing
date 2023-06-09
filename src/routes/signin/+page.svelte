<script lang="ts">
    import type { ActionData } from './$types';
    import { redirect } from '@sveltejs/kit';

    export let form: ActionData;

    $: if (form?.success) {
        throw redirect(307, '/');
    }
</script>

<div class="flex flex-row justify-center align-middle">
    <div class="shadow-2xl rounded bg-skin-accent h-52">
        <form class="flex flex-col gap-5 p-10" method="POST" action="?/Login">
            <input type="text" placeholder="Username" class="shadow-lg bg-skin-secondary_accent" name="username">
            <input type="password" placeholder="Password" class="shadow-lg bg-skin-secondary_accent" name="password">
            <button class="shadow-lg rounded bg-skin-secondary_accent">Sign In</button>
            <div class="flex justify-center">
                {#if form?.message}
                    {form?.message}
                {/if}
            </div>
        </form>
    </div>
</div>