const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(
  require('@dnode/http-auth')({
    user: process.env.HTTP_AUTH_USER,
    password: process.env.HTTP_AUTH_PASSWORD,
  })
);

function broadcast(intent, uuid) {
  wss.clients.forEach(ws => {
    if (ws.uuid !== uuid) {
      return;
    }
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(`img/intents/${intent}.png`);
    }
  });
}

app.post('/dialogflow/:uuid', bodyParser.json(), (req, res) => {
  broadcast(req.body.result.metadata.intentName, req.params.uuid);
  res.send({ speech: 'Ok' });
});

app.get('/send/:intent', (req, res) => {
  broadcast(req.params.intent, req.query.uuid);
  res.send();
});

wss.on('connection', ws => {
  ws.on('message', message => {
    if (message === 'ping') {
      console.log(new Date() + ': got ping, send pong');
      ws.send('pong');
    } else {
      ws.uuid = message;
    }
  });
});

app.use(express.static(path.join(process.cwd(), 'www')));

server.listen(process.env.PORT || 5698);
