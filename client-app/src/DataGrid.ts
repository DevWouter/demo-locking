import { writable } from 'svelte/store';

export interface DataGridDto {
    width: number;
    height: number;
    fields: {
        value: number;
        lockedByClientId?: number;
        frozenByClientIds: number[];
    }[];
}


export const gridStore = writable<DataGridDto>(undefined);