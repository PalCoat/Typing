<script lang="ts">
    import type { PageServerData } from './$types';
    
    export let data: PageServerData;
</script>

<p class="text-xl">{data?.race}</p> 