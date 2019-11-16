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

//Create gRPC client
let client = new proto.serial.Request(
    REMOTE_SERVER,
    grpc.credentials.createInsecure()
);

function startSerial() {
    let channel = client.joinDev({ });
    channel.on("data", onResponse);
    rl.on("line", function(text) {
        client.send({ command: text }, res => {});
    });
}

function onResponse(message) {
    console.log(`Received response ${message.response}`);
}

startSerial();
