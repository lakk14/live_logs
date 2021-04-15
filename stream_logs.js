const express = require('express')
const app = express()
const server = require('http').createServer(app);
const WebSocket = require('ws');
var Tail = require('tail').Tail;
const config = require('./config.json');

var clients = [];
const wss = new WebSocket.Server({ server: server });
var tail = new Tail(config.LOG_FILE_PATH);
wss.on('connection', function connection(ws) {
    console.log('A new client Connected!');
    ws.send('Welcome New Client!');
    tail.on('line', function (msg) {

        // anonymize / mask / hide IPs
        msg = msg.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/, "*.*.*.*").replace(/ port \d* /, " port **** ");
        ws.send(msg);
        console.log('> Broadcasting: ' + msg); // display what we just sent

        json = JSON.stringify({ data: msg });
        // broadcast message to all connected clients
        for (var i = 0; i < clients.length; i++) {
            clients[i].sendUTF(json);
        }

    });

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);

        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });

    });
});

server.listen(config.PORT, () => console.log(`Lisening on port :` + config.PORT))