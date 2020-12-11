const express = require('express')
const app = express()
const port = 3000
const server = require('http').createServer(app)
const io = require('socket.io')(server);
const rooms = []

let board = {
    room:
        [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ]
}

let propertyRoom = {}
let player0 = true;

io.on('connect', function(socket) {
    console.log('socket connected')
    socket.on('sendMessage', (payload) => {
        console.log(payload)
    })

    socket.on('joinRoom', (room) => {
        if (Object.keys(io.sockets.adapter.rooms).includes(room)){
            let length = Object.keys(io.sockets.adapter.rooms[room].sockets).length
            if (length !== 2){
                socket.join(room)
                socket.emit('updateCurrRoom',room)
                propertyRoom[room]['players'].push(socket.id)
            } else {
                //socket.join(room)
                io.emit('isFull',room)
            }
        }else{
            propertyRoom[room] = {}
            propertyRoom[room]['board'] = [
                ['', '', ''],
                ['', '', ''],
                ['', '', '']
            ]
            propertyRoom[room]['player0'] = true
            
            propertyRoom[room]['players'] = [socket.id]
            socket.join(room)
            socket.emit('updateCurrRoom',room)
            rooms.push(room)
        }
        
        
    })

    socket.on('gameBoard', function(payload) {
        //console.table(board)
        //console.log(payload.row, payload.col)
        const players = Object.keys(io.sockets.adapter.rooms[payload.room].sockets)
        let clickable;

        console.log(players, "<<<< players")
        console.log(socket.id, '<<<< socketid')
        console.log(player0, "<<<< player0")


        if (socket.id === players[0] && propertyRoom[payload.room]['player0']){
            clickable = true
            propertyRoom[payload.room]['player0'] = false
            console.log('kondisi1')
        }else if(socket.id === players[1] && !propertyRoom[payload.room]['player0']){
            clickable = true
            propertyRoom[payload.room]['player0'] = true
            console.log('kondisi2')
        }else{
            clickable = false
            console.log('kondisi3')
        }
        
        if(clickable){
            if(propertyRoom[payload.room]['player0']){
                propertyRoom[payload.room]['board'][payload.row][payload.col] = 'X'
            }else{
                propertyRoom[payload.room]['board'][payload.row][payload.col] = 'O'
            }
            console.table(board)
            io.to(payload.room).emit('changeBoard', propertyRoom[payload.room]['board'])
        }
    })
    socket.on('message', (room) => {
        io.to(room).emit('testRoom','test')
        console.log(socket.id, '<<< id')
        console.log(socket.rooms[room], " <<<< my Room")
        
    })
    socket.on('receiveUserName', (username) => {
        console.log(username, '<<<< usernmae')
        socket.emit('giveUsername',username)
        socket.broadcast.emit('addplayers', username)
        
    })
})


server.listen(port, () => {
    console.log(`Listening to port : http://localhost:${port}`)
})