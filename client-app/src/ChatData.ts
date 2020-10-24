import type { MessageDto } from "./MessageDto";
import { writable } from 'svelte/store';

export function addToChat(text: string) {
    chatMessages.update(collection => {
        collection.push({
            text,
            time: new Date(),
            type: 'msg',
        });
        return collection;
    });
}

export function addWarningToChat(text: string, data: { code?: string }) {
    chatMessages.update(collection => {
        collection.push({
            text,
            time: new Date(),
            type: 'warning',
            code: data?.code
        });
        return collection;
    });
}

export const chatMessages = writable<MessageDto[]>([]);