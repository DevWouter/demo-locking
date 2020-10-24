import { Hub, HubClient, HubHandlers } from "./hub";
import { DataGrid } from './data-system';

var grid = new DataGrid(5, 20);

function onChat(hub: Hub, client: HubClient, message: { text: string; }) {
    hub.sendAll('chat', { client: client.id, text: message.text });
}

export const handlers: HubHandlers = {
    onAdd: (_, client) => {
        client.send('set-client-id', { clientId: client.id });
        client.send('state', grid.getDto());
    },
    onMessage: {
        'chat': onChat,
        'lock': (hub, client, msg: { x: number, y: number }) => {
            if (grid.lock(msg.x, msg.y, client.id)) {
                // Locks has been acquired.
                hub.sendAll('state', grid.getDto());
            } else {
                client.send('lock-failed', msg);
            }
        },
        'unlock': (hub, client, msg: { x: number, y: number }) => {
            grid.unlock(msg.x, msg.y, client.id);
            hub.sendAll('state', grid.getDto());
        },
        'steal-lock': (hub, client, msg: { x: number, y: number }) => {
            grid.steal(msg.x, msg.y, client.id);
            hub.sendAll('state', grid.getDto());
        },
        'set-value': (hub, client, msg: { x: number, y: number, value: number }) => {
            const result = grid.setValue(msg.x, msg.y, msg.value, client.id);
            if (result === "success") {
                hub.sendAll('state', grid.getDto());
            } else {
                client.send('set-value-failed', { ...msg, reason: result })
            }
        },
        'freeze': (hub, client, { x, y }: { x: number, y: number }) => {
            grid.freeze(x, y, client.id);
            hub.sendAll('state', grid.getDto());
        },
        'unfreeze': (hub, client, { x, y }: { x: number, y: number }) => {
            grid.unfreeze(x, y, client.id);
            hub.sendAll('state', grid.getDto());
        },
    }
}