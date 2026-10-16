const WebSocket = require('ws')
require('dotenv').config()
const jwt = require('jsonwebtoken')

const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT

const clientsByUser = new Map()
const wsserv = new WebSocket.Server({
    port: PORT,
    verifyClient(info, callback) {
        const url = new URL(info.req.url, 'http://localhost')
        const token = url.searchParams.get('token')

        try {
            if (!token) throw new Error('Missing token')

            const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
            if (typeof payload.lobby !== 'string' || payload.lobby.length === 0) {
                throw new Error('Token is missing a subject')
            }

            info.req.userId = payload.lobby
            callback(true)
        } catch {
            callback(false, 401, 'Unauthorized')
        }
    }
})

wsserv.on('connection', (ws, req) => {
    console.log('Connected client')
    const userId = req.userId

    if (!clientsByUser.has(userId)) clientsByUser.set(userId, new Set())
    const clients = clientsByUser.get(userId)
    clients.add(ws)
    
    ws.on('message', (message) => {
        console.log('Message: ', message)
        for(const client of clients) {
            if(client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    status: 0,
                    msg: String(message)
                }))
            }
        }
    })

    ws.on('close', () => {
        clients.delete(ws)
        if(clients.size === 0) clientsByUser.delete(userId)
        console.log('Connection closed')
    })

})