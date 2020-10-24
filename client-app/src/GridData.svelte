<script lang="ts">
    import { gridStore } from "./DataGrid";
    import GridDataEdit from "./GridDataEdit.svelte";

    let rows: {
        value: number;
        lockedByClientId?: number;
        frozenByClientIds: number[];
    }[][] = [[]];
    $: {
        var data = $gridStore;
        if (data) {
            var newRows = [];
            for (var yi = 0; yi < data.height; ++yi) {
                newRows.push([]);
                for (var xi = 0; xi < data.width; ++xi) {
                    newRows[yi].push(data.fields[yi * data.width + xi]);
                }
            }

            rows = newRows;
        }
    }
</script>

<table>
    {#each rows as row, y}
        <tr>
            {#each row as _, x}
                <GridDataEdit {x} {y} />
            {/each}
        </tr>
    {/each}
</table>
