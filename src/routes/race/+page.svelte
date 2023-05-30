<script lang="ts">
    import type { ActionData } from './$types';
    
    export let form: ActionData;

    const socket = new WebSocket("ws://localhost:81");

    socket.onmessage = ({data}) => {
        console.log("Server says" + data);
    };

    function Message() {
        socket.send("Hot");
    }
</script>

<div class="flex justify-center">
    {#if form}
        {#each form?.racers as racer}
            <p class="text-xl">{racer.name}</p> 
        {/each}
        <button on:click={() => {Message()}}></button>
    {:else}
        <form class="flex flex-col" method="POST" action="?/Join">
            <button class="shadow-lg rounded bg-skin-secondary_accent text-2xl p-2">Join</button>
        </form>
    {/if}
</div>