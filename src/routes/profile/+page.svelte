<script lang="ts">
    import type { PageServerData } from './$types';
    
    export let data: PageServerData;
</script>

<div class="flex justify-center text-xl">
    <div class="flex-col">
        <div class="flex justify-center">
            {data?.name}
        </div>
        <div class="flex justify-center">
            <form method="POST" action="?/Logout">
                <button class="shadow-lg p-2 rounded bg-skin-accent">Sign Out</button>
            </form>
        </div>
    </div>
</div>