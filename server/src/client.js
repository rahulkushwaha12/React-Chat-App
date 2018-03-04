const WebSocket = require('uws');
const ws = new WebSocket('ws://localhost:3000');
ws.on('open',()=>{
    console.log("successful connected to server.");
    ws.on('message',(message)=>{
        console.log(message);
    });
});