import { addToChat, addWarningToChat } from "./ChatData";
import { gridStore } from './DataGrid';

const ChatHandlers: Record<string, (msg: any) => void> = {};
ChatHandlers['set-client-id'] = (msg) => {
    intercom.id = msg.data.clientId;
    addToChat(`You are client ${msg.data.clientId}`);
};
ChatHandlers['debug'] = (msg) => addToChat(`debug ${msg.data.message}`);
ChatHandlers['chat'] = (msg) => addToChat(`${msg.data.client} says ${msg.data.text}`);
ChatHandlers['state'] = (msg) => gridStore.set(msg.data);

class Intercom {
    private ws: WebSocket;
    public id = -1;

    send(message) {
        this.ws.send(JSON.stringify(message));
    }

    connect(path) {
        this.ws = new WebSocket(path);
        this.ws.addEventListener("message", (ev) => {
            const msg = JSON.parse(ev.data);
            if (ChatHandlers[msg.type]) {
                ChatHandlers[msg.type](msg);
            } else {
                addWarningToChat(`Unsupported message`, { code: JSON.stringify(msg, undefined, 2) });
            }
        });
    }
}

export const intercom = new Intercom();