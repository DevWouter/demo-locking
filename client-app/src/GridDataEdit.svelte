<script lang="ts">
    import { intercom } from "./Intercom";
    import { gridStore } from "./DataGrid";
    export let x: number;
    export let y: number;

    var value = 0;
    var isFrozen = false;
    var isFrozenByMe = false;
    var canEdit = true;
    var useAutoLock = true;
    var lockedByOthers = false;
    var title = "";
    var inputEl: HTMLInputElement;

    var lastGridData = undefined;

    $: {
        const gridData = $gridStore;
        if (JSON.stringify(gridData) !== JSON.stringify(lastGridData)) {
            const field = gridData.fields[y * gridData.width + x];
            value = field.value;
            isFrozen = (field.frozenByClientIds || []).length > 0;
            isFrozenByMe = (field.frozenByClientIds || []).some(
                (z) => z == intercom.id
            );

            lockedByOthers =
                typeof field.lockedByClientId == "number" &&
                field.lockedByClientId !== intercom.id;

            if (lockedByOthers) {
                canEdit = false && !isFrozen;
            } else {
                canEdit = true && !isFrozen;
            }
        }
        if (lockedByOthers) {
            title = "Field is locked by others";
        }
        if (isFrozen) {
            title = "Field is frozen";
        }

        lastGridData = gridData;
    }

    function toggleAutoLock() {
        useAutoLock = !useAutoLock;
    }

    function onFocus() {
        if (useAutoLock) {
            intercom.send({ type: "lock", x, y });
        }
    }

    function onBlur() {
        intercom.send({ type: "set-value", x, y, value });
        if (useAutoLock) {
            intercom.send({ type: "unlock", x, y });
        }
    }

    function freeze() {
        intercom.send({ type: "freeze", x, y });
    }
    function unfreeze() {
        intercom.send({ type: "unfreeze", x, y });
    }

    function askSteal() {
        if (lockedByOthers) {
            if (
                confirm(
                    "This field is locked by another client, do you want to steal the lock?"
                )
            ) {
                intercom.send({ type: "steal-lock", x, y });
                canEdit = true;
                // A small delay is required, otherwise the component is not editable
                queueMicrotask(() => {
                    inputEl.focus();
                    inputEl.select();
                });
            }
        }
    }
</script>

<style>
    input {
        width: 3em;
    }
    button {
        width: 2em;
    }
    .noAutoLock {
        border-color: purple;
    }
    .lockedByOthers {
        border-color: yellow;
    }
    .isFrozen {
        border-color: red;
    }
</style>

<input
    bind:this={inputEl}
    bind:value
    class:noAutoLock={!useAutoLock}
    class:lockedByOthers
    class:isFrozen
    on:focus={onFocus}
    on:blur={onBlur}
    on:dblclick={toggleAutoLock}
    disabled={!canEdit}
    {title} />
{#if isFrozenByMe}
    <button on:click={unfreeze}>🔑</button>
{:else}<button on:click={freeze}>🔒</button>{/if}
<button
    on:click={askSteal}
    title="break lock"
    disabled={!lockedByOthers}>💔</button>
