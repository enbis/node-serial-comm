let grpc = require("grpc");
var protoLoader = require("@grpc/proto-loader");
var readline = require("readline");
 
//Read terminal Lines
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//Load the protobuf
var proto = grpc.loadPackageDefinition(
    protoLoader.loadSync("models/proto/serial.proto", {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    })
);

const REMOTE_SERVER = "0.0.0.0:5001";
let fullResp = ""

//Create gRPC client
let client = new proto.serial.Request(
    REMOTE_SERVER,
    grpc.credentials.createInsecure()
);

function startSerial() {
    let channel = client.joinDev({ });
    channel.on("data", onResponse);
    rl.on("line", function(text) {
        if (text == "S") {
            fullResp = ""
            console.log(`Sending command...`)
            client.send({ command: text }, res => {});
        } else {
            console.log(`Error, the only command accepted is S`);
        }
    });
}

function responseReader(){
    if (fullResp.endsWith('g')) {
        var regex = /\d+/
        var matches = regex.exec(fullResp);
        return `Current stable weight ${matches[0]} g`
    }
    switch (fullResp){
        case "S I":
            return `Command not executable`;
        case "S +": 
            return `Balance in overload range`;
        case "S -":
            return `Balance in underload range`;
        default:
            return "Listening..."

    }
}

function onResponse(message) {
    console.log(`Received ${message.response}`);
    fullResp += message.response
    console.log(`${responseReader()}.`);
}

startSerial();

console.log(`...device online \n Waiting for command:`);
