let grpc = require("grpc");
var protoLoader = require("@grpc/proto-loader");
 
const server = new grpc.Server();
const SERVER_ADDRESS = "0.0.0.0:5001";
 
// Load protobuf
let proto = grpc.loadPackageDefinition(
    protoLoader.loadSync("models/proto/serial.proto", {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    })
);
 
let devices = []
let instruments = []

//Device joined as one of the agents involved in the communication process
function joinDev(call, callback) {
    devices.push(call);
}

//Instrument joined as one of the agents involved in the communication process
function joinInst(call, callback) {
    instruments.push(call);
}

//Function used as a broker of sending message between device and instument
function send(call, callback) {
    if (call.request.command != ""){
        notifyInstrument({ command: call.request.command});
    } else {
        notifyDevice({ response: call.request.response});
    }
}
 
// Function used by device in order to send command to instrument
function notifyInstrument(message) {
    instruments.forEach(instrument => {
        instrument.write(message);
    });
}

// Function used by instrument in order to send response to device
function notifyDevice(message) {
    devices.forEach(device => {
        device.write(message);
    });
}

 
// Define server and start
server.addService(proto.serial.Request.service, { joinInst: joinInst, joinDev: joinDev, send: send });
 
server.bind(SERVER_ADDRESS, grpc.ServerCredentials.createInsecure());
 
server.start();

console.log("Server starts listening ", SERVER_ADDRESS)