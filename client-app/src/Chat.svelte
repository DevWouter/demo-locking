<script lang="ts">
    import ChatMsg from "./ChatMsg.svelte";
    import { intercom } from "./Intercom";
    import { chatMessages } from "./ChatData";

    let chatInput = "";

    function onKeyUp(event: KeyboardEvent) {
        if (event.key === "Enter" && chatInput.length != 0) {
            intercom.send({ type: "chat", text: chatInput.trim() });
            chatInput = "";
        }
    }
</script>

<style>
    .container {
        display: grid;
        width: auto;
        max-height: 100vh;
        height: 100vh;
        grid-template-rows: 1fr min-content;
    }
    .log{
        overflow-y: auto;
    }
    .chat-input {
        box-sizing: border-box;
        padding: 8px;
        background-color: lavender;
        display: flex;
    }

    input {
        flex-grow: 1;
        flex-shrink: 1;
    }
</style>

<div class="container">
    <div class="log">
        {#each $chatMessages as message}
            <ChatMsg {message} />
        {/each}
    </div>
    <div class="chat-input">
        <input
            type="text"
            placeholder="Here you can write your chat-message"
            bind:value={chatInput}
            on:keyup={onKeyUp} />
    </div>
</div>
