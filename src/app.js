const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const rpgDiceRoller = require('rpg-dice-roller/lib/umd/bundle.js');
const roller = new rpgDiceRoller.DiceRoller();

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

module.exports = { server, io, roller }