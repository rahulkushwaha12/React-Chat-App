import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import {version} from '../package.json';
import WebSocketServer,{Server} from 'uws';

const PORT = 3000;
const app = express();
app.server = http.createServer(app);

app.use(morgan('dev'));

app.use(cors({
    exposedHeaders: "*"
}));

app.use(bodyParser.json({
    limit: '50mb'
}));

app.wss = new Server({
    server: app.server
});

let clients = [];

app.wss.on('connection',(connection)=>{
    const userId = clients.length+1;
    connection.userId = userId;
    const newClient = {
        ws:connection,
        userId: userId,
    };
    clients.push(newClient);
    console.log("New Client Connected with userId ",userId);
    connection.on('close',()=>{
        console.log('client with ID ',userId,' is disconnected');
        clients = clients.filter((client)=>client.userId !== userId);
    });
});

app.get('/all',(req,res)=>{
    res.json({
        version: version
    });
});

app.get('/api/all_connections',(req, res, next)=>{
    return res.json({
        people:clients,
    });
});

setInterval(()=>{
    console.log(`There ${clients.length} people in the connection`);
    if(clients.length>0){
        clients.forEach((client)=>{
            console.log("clients id:",client.userId);
            const msg = `Hey ID: ${client.userId} you got a new msg from server`;
            client.ws.send(msg);
        });
    }
},3000);

app.server.listen(process.env.PORT || PORT, () => {
        console.log(`App is running on port ${app.server.address().port}`);
});

export default app;