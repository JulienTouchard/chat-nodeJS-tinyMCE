const express = require('express');
const http = require('http');
const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);
const hostname = '127.0.0.1';
const port = 8000;
let socketClients = [];
let messages = [];



app.use(express.static('public'));
app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname });
})

// communication entre les clients et le serveur
// attention conneCTion
io.on('connection', (socket) => {
    socketClients.push({ id: socket.id })
    socket.emit("init", {
        message: "bienvenue nouveau client",
        id: socket.id,
        socketClients: socketClients,
        messages: messages
    })

    socket.on('initResponse', (initResponse) => {
        socketClients = initResponse.socketClients;
        // partager aux clients déjà connectés
        socket.broadcast.emit('newClient', { socketClients: socketClients })
    })
    socket.on("newMessage", (newMessage) => {
        messages = newMessage.messages;
        // je partage en broadcast le tableau message
        socket.broadcast.emit("newMessageResponse", {
            messages: messages
        })
    })
    socket.on("newPrivateMessage", (newPrivateMessage) => {
        // je recoit idContact, id, message, pseudo, date
        // je dois faire un emit sur un unique id (newPrivateMessage.idContact)
        // stockage des messages eventuel
        console.log("exec");
        socket.to(newPrivateMessage.idContact).emit("newPrivateMessageResponse", {
            newPrivateMessageResponse: newPrivateMessage
        })
    })
    if (socketClients.length > 0) {
        socket.on('disconnect', () => {
            // socket.id = client déconnecté
            for (let i = 0; i < socketClients.length; i++) {
                if (socketClients[i].id === socket.id) {
                    socketClients.splice(i, 1);
                }
            }
            socket.broadcast.emit('clientDisconnect', {
                socketClients: socketClients
            })
        })

    }
})



server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});