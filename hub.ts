import * as ws from 'ws';

export type HubHandlers = {
    onAdd?: (hub: Hub, client: HubClient) => void;
    onRemove?: (hub: Hub, client: HubClient) => void;
    onMessage: Record<string, (hub: Hub, client: HubClient, data: object) => void>;
}


export interface HubClient {
    readonly id: number;
    send(type: string, data: object);
}

class HubClientImpl implements HubClient {
    constructor(private readonly socket: ws, public readonly id: number) {
        this.socket = socket;
    }

    send(type: string, data: object) {
        this.socket.send(JSON.stringify({ type, data }));
    }
}


export class Hub {
    nextClientId = 1;

    private clients: HubClient[] = [];
    constructor(
        private readonly handlers: HubHandlers,
    ) {
    }

    addClient(socket: ws): HubClient {
        var newClient = new HubClientImpl(socket, this.nextClientId) as HubClient;
        this.nextClientId++;
        this.clients.push(newClient);
        if (this.handlers.onAdd) {
            this.handlers.onAdd(this, newClient);
        }

        return newClient;
    }

    removeClient(client: HubClient) {
        if (!client) return;
        const index = this.clients.findIndex(x => x.id === client.id);
        if (index === -1) { return; }
        this.clients.splice(index, 1);

        if (this.handlers.onRemove) {
            this.handlers.onRemove(this, client);
        }
    }

    processMessage(client: HubClient, data: string) {
        if (!client) return;
        const msg = JSON.parse(data);
        if (this.handlers.onMessage[msg.type]) {
            console.info(`WS client ${client.id}: ${data}`);
            this.handlers.onMessage[msg.type](this, client, msg);
        } else {
            console.warn(`WS client ${client.id}: (UNKNOWN) ${data}`);
        }
    }

    sendAll(type: string, data: object) {
        this.clients.forEach(c => c.send(type, data));
    }
}