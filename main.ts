import * as http from 'http';
import * as fs from 'fs';
import * as ws from 'ws';
import { getMimeType } from './mimetypes';
import { Hub } from './hub';
import { handlers } from './handlers';

const PORT = 3000;
const TIMESTAMP = new Date().toString();

var httpServer = http.createServer(async (req, res) => {

    if (req.method == 'GET' && req.url === '/api/start-time') {
        res.end(TIMESTAMP);
        return;
    }

    console.log(`${req.method} ${req.url}`);
    const path = req.url === '/' ? '/index.html' : req.url;
    const filepath = 'www' + path;

    try {
        if (fs.existsSync(filepath)) {

            const contentType = getMimeType(filepath);

            res.writeHead(200, {
                'Content-Type': contentType,
            });
            const stream = fs.createReadStream(filepath);
            stream.pipe(res, { end: true });
        } else {
            res.statusCode = 404;
            res.end(`No file found: ${filepath}`);
        }
    } catch (ex) {
        res.statusCode = 500;
        res.end(JSON.stringify(ex));
    }
});

var wsServer = new ws.Server({ server: httpServer });
var hub = new Hub(handlers);
wsServer.addListener('connection', (ws) => {
    var client = hub.addClient(ws);

    ws.addListener('close', () => {
        hub.removeClient(client);
        client = undefined;
    });

    ws.addListener('error', () => {
        hub.removeClient(client);
        ws.close(); // Close the connection 
        client = undefined;
    });

    ws.addListener('message', function (data) {
        hub.processMessage(client, data.toString());
    });
});

httpServer.listen(PORT, () => {
    console.info(`Server is running on port ${PORT}`);
});


