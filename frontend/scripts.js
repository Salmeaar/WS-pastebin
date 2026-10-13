const socket = new WebSocket(`ws://localhost:5000`)

socket.onopen = function (event) {
    console.log('Successfully connected')
}

socket.onmessage = function (event) {
    const data = JSON.parse(event.data)
    document.querySelector('#output').innerHTML = data.msg


}

socket.onclose = function (event) {
    console.log('Disconnected')
}

document.querySelector('#input').addEventListener('input', (evt) => {
    socket.send(evt.target.value)
})