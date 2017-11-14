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
      ws.send(intent);
    }
  });
}

const responses = require('./responses.json');

app.post('/dialogflow/:uuid', bodyParser.json(), (req, res) => {
  const intentName = req.body.result.metadata.intentName;
  console.log(new Date() + ': got intent "' + intentName + '"');
  broadcast(intentName, req.params.uuid);
  let speech = 'Ok';
  if (responses[intentName]) {
    speech = responses[intentName][Math.floor(Math.random() * responses[intentName].length)];
    for (const key in req.body.result.parameters) {
      speech = speech.replace(`$${key}`, req.body.result.parameters[key]);
    }
  }
  res.send({ speech });
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
