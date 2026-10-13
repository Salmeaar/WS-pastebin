const WebSocket = require('ws')
require('dotenv').config()

const PORT = process.env.PORT || 5000
const wsserv = new WebSocket.Server({ port: PORT})

wsserv.on('connection', (ws, req) => {
    console.log('Connected client')



    ws.on('message', (message) =>{
        console.log('Message: ', message)

        ws.send(JSON.stringify({
            status: 0,
            msg: String(message)
        }))
    })

    ws.on('close', () => {
        console.log('Connection closed')
    })

})