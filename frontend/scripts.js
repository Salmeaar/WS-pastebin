const token = new URLSearchParams(window.location.search).get('token')
const socket = token
    ? new WebSocket(`ws://localhost:5000/?token=${encodeURIComponent(token)}`)
    : null
const input = document.querySelector('#input')
const output = document.querySelector('#output')

if (socket) {
    socket.onopen = function () {
        console.log('Successfully connected')
    }

    socket.onmessage = function (event) {
        const data = JSON.parse(event.data)
        output.textContent = data.msg
    }

    socket.onclose = function () {
        console.log('Disconnected')
    }
} else {
    output.textContent = 'JWT missing from URL (?token=...)'
}

input.addEventListener('input', (event) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(event.target.value)
    }
})