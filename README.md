# node-serial-comm

Async communication between instrument and device. A device driver performing a query command, the virtual instrument simulates its state and gives the response. 

## Architecture

<img align="center" width="651" height="241" src="https://github.com/enbis/node-serial-comm/blob/master/imgs/serial_comm.png">

### Components

* **grpc server:** it opens two stream, one with the device and one with the instrumet. It receives the request from the device and forward it to the instrument, then awaits the response and send back to the remote device.  
* **protocol buffer:** is the method used for serializing data.
* **device driver:** it requires to starts the communication with the server, sends on the request through CLI command and waits for the response. It is able to decode a bunch of possible response that the sever forwards.

_CLI command_
```javascript
rl.on("line", function(text) {
    if (text == "S") {
        fullResp = ""
        console.log(`Sending command...`)
        client.send({ command: text }, res => {});
    } else {
        console.log(`Error, the only command accepted is S`);
    }
});
```

* **virtual instrument:** it requires to starts the communication with the server, and waits for the requests coming from the remote device. The logic within it simulates its state and introduces a random delay on the response, ranging from 1 to 5 seconds. 

_simulated state:_
```javascript
function fakeResponse(){
    random = getRandomInt(0, 3);
    switch (random){
        case 0:
            weight = getRandomInt(0, 500);
            return `S S ${weight} g`;
        case 1:
            return "S I";
        case 2: 
            return "S +";
        case 3:
            return "S -";
        default:
            console.log("Error")

    }
}
```

_articifial delay:_ 
```javascript
async function sendDelayedResponse(resp) {
    for (const c of resp) {
        await new Promise(resolve => setTimeout(resolve, getRandomInt(1000, 5000)))
        client.send({response: c}, res => {})
    }
}
```

## Assumptions and instructions

1. Run the server and the two processes in the following order, so as to allow to the device and the instrument to communicate with the server. 
* `npm run server`
* `npm run device`
* `npm run intrument`

2. The device CLI is able to send only one type of command: `S`, any other attempt returns an error to the driver console.
3. Only one device and one instrument process are permitted for each instance of server.