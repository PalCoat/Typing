<script lang="ts">
    /*import { onMount } from "svelte";

    let socket: WebSocket

    onMount(() => {
        socket = new WebSocket("ws://localhost:80");

        socket.addEventListener("message", (event) => {
            console.log("Message from server ", event.data);
        });
    });
    */
    function Message() {
        //socket.send("Hello");
    }
</script>

<div class="flex justify-center">
    <button on:click={() => {Message();}}>
        Hello
    </button>
</div>
