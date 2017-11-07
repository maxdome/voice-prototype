const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function broadcast(intent) {
  wss.clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(`${process.env.URL || 'http://localhost:5698'}/img/intents/${intent}.png`);
    }
  });
}

app.post('/dialogflow', bodyParser.json(), (req, res) => {
  broadcast(req.body.result.metadata.intentName);
  res.send({ speech: 'Ok' });
});

app.get('/send/:intent', (req, res) => {
  broadcast(req.params.intent);
  res.send();
});

app.use(express.static(path.join(process.cwd(), 'www')));

server.listen(process.env.PORT || 5698);
