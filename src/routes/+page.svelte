<script lang="ts">
    import "../app.css";
    import { Test } from "../lib/scripts/Script";
    const test : Test = new Test();
    let sentence : string = "";
    const senteceLength = 10;

    function ResetSentence() {
        sentence = test.Sentence(senteceLength);
    }
</script>

<div class="flex justify-center">
    <div class="flex flex-col">
        <p>{sentence}</p>
        <div class="flex justify-center">
            <button class="shadow-2xl p-2 w-min rounded" on:click={() => ResetSentence()}>Reset</button>
        </div>
    </div>
</div>