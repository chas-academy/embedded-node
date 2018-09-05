const express = require('express');
const app = express();

const wss = require('express-ws')(app);
const raspividStream = require('raspivid-stream');

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));


app.ws('/video-stream', (ws, req) => {
    const numClients = wss.getWss().clients.size;
    let videoStream = raspividStream();
    
    console.log(`${numClients} connected at the moment`);
    
    ws.send(JSON.stringify({
        action: 'init',
        width: '960',
        height: '540'
    }));

    videoStream.on('data', (data) => {
        ws.send(data, {
            binary: true
        }, (error) => {
            if (error) console.error(error)
        });
    });

    ws.on('close', () => {
        console.log('A client left');
        videoStream.removeAllListeners('data');
    });
});


app.use((err, req, res, next) => {
    console.log(err);
    next();
});

app.listen(7203, () => console.log('::: PI-server started on 7203'));