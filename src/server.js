
const WebSocket = require('ws')
require('dotenv').config()
const jwt = require('jsonwebtoken')

const express = require('express')
const { createServer } = require('http')

const app = express()
const server = createServer(app)

const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT

const clientsByUser = new Map()

// WebSocket server
const wsserv = new WebSocket.Server({
    noServer: true
})

// Verify JWT before accepting connection
server.on('upgrade', (req, socket, head) => {
    console.log("WebSocket upgrade received");
    
    const url = new URL(req.url, 'http://localhost')
    const token = url.searchParams.get('token')

    try {
        if (!token) {
            throw new Error('Missing token')
        }

        if (!JWT_SECRET) {
            throw new Error('JWT secret not configured')
        }

        const payload = jwt.verify(token, JWT_SECRET, {
            algorithms: ['HS256']
        })

        if (payload.sub === undefined || payload.sub === null ||
            String(payload.sub).length === 0) {
            throw new Error('Token is missing a subject')
        }

        // Save user ID
        req.userId = String(payload.sub)

        // Accept connection
        wsserv.handleUpgrade(req, socket, head, (ws) => {
            wsserv.emit('connection', ws, req)
        })

    } catch (error) {
        console.log('WebSocket authentication failed:', error.message)

        const expired = error.name === 'TokenExpiredError'

        socket.write(
            `HTTP/1.1 ${expired ? 401 : 401} Unauthorized\r\n` +
            'Connection: close\r\n' +
            '\r\n'
        )
        socket.destroy()
    }
})

// WebSocket connection
wsserv.on('connection', (ws, req) => {
    const userId = req.userId

    console.log('Connected client:', userId)

    if (!clientsByUser.has(userId)) {
        clientsByUser.set(userId, new Set())
    }

    const clients = clientsByUser.get(userId)
    clients.add(ws)

    // Receive and broadcast text to same user
    ws.on('message', (message) => {
        console.log('Message from:', userId)

        for (const client of clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    status: 0,
                    msg: String(message)
                }))
            }
        }
    })

    // Remove disconnected clients
    ws.on('close', () => {
        clients.delete(ws)

        if (clients.size === 0) {
            clientsByUser.delete(userId)
        }

        console.log('Connection closed:', userId)
    })
})

// Start server
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})
