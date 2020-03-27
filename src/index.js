const { server, io, roller } = require('./app')
const port = process.env.PORT
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')


let count = 0

io.on('connection', (socket) => {
    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('serverMessage', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('serverMessage', generateMessage('Admin', `${user.username} has joined ${user.room}`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('clientMessage', (message, callback) => {
        const filter = new Filter()
        const diceReg = /^\/(roll|dice|r) (\d+)/

        if (filter.isProfane(message)) {
           return callback('Profanity is not allowed!') 
        }

        const user = getUser(socket.id)
        const match = message.match(diceReg)
        if (match) {
            let roll = roller.roll(`${match[2]}d10!=10>=8`).toJSON();
            let result = (`${user.username} rolled ${match[2]} dice for ${roll.total} successes.  ${roll.rolls.sort()}`);
            io.to(user.room).emit('serverMessage', generateMessage(user.username, result))
            callback()

        } else {
            io.to(user.room).emit('serverMessage', generateMessage(user.username, message))
            callback()
        }        
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.emit('serverMessage', generateMessage('Admin', `${user.username} has left ${user.room}`))

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)

        if (user) {
            io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, coords.latitude, coords.longitude))
        }
        

        callback()
    })
})

server.listen(port, () => {
    console.log('Server is up on port ' + port)
})