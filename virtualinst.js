let grpc = require("grpc");
var protoLoader = require("@grpc/proto-loader");

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
    let channel = client.joinInst({ });
    channel.on("data", onResponse);
}

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

//Receive message from device and create the response to send back
function onResponse(message) {
    console.log(`Received command ${message.command}`);
    resp = fakeResponse();
    [...resp].forEach ( c => client.send({ response: c }, res => {}));
}

//Start serial communication as stream of charts
startSerial();