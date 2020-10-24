<script lang="ts">
    import type { MessageDto } from "./MessageDto";
    export let message: MessageDto;
</script>

<style>
    .container {
        display: grid;
        grid-template-columns: 200px 1fr;
        justify-items: start;
    }
    code{
        white-space: pre;
    }
</style>

<div class="container {message.type}">
    <div class="time">{message.time.toISOString()}</div>
    <div class="body">
        <div class="text">{message.text}</div>
        {#if message.code}<code>{message.code}</code>{/if}
    </div>
</div>
