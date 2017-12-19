# Voice Prototype

A prototype of the showcase to control OTT devices by voice commands.

## General Workflow

* The OTT app open a WebSocket to a service after starting and authenticate with the user
* This service can handle voice commands by provide endpoints (e.g. for Dialogflow) for authenticated users
* If this service gets a voice command it send this command to all connected devices over the WebSockets
* The OTT app gets the command and can react on that

## Developing / Testing

* The `www/index.html` opens the WebSocket
* The `server.js` provides `GET /send/:intent` to test the sending of commands 
* The intent must match to a special video command (e.g. `play`) or an image filename in `img/intents`
* Different instances/users can be tested independently by providing an `uuid`
 * `www/index.html?uuid=test`
 * `GET /send/:intent?uuid=test`

## Integration in Dialogflow

* The `server.js` provides `POST /dialogflow/:uuid` which must be defined in Dialogflow as fulfilment endpoint
* The Voice commands responses differently if responses are defined in the `responses.json`, otherwise with an `Ok`

## Known issues

* On AWS WebSockets are not provided by default in Beanstalk apps
* If the server restarts all WebSocket connections are lost, the browser tab of the `www/index.html` must be refreshed
