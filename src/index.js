const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { 
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if(error) return callback(error);

    socket.join(user.room);

    socket.emit('message', generateMessage(user.username, `Welcome ${user.username}!`));
    socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  })

  socket.on("sendMessage", (text, callback) => {
    const filter = new Filter();
    if(filter.isProfane(text)) return callback('Curse words are not allowed!');

    const user = getUser(socket.id);
    io.to(user.room).emit('message', generateMessage(user.username, text));
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
    callback();
  });

  socket.on('disconnect', () => {
    const userList = removeUser(socket.id);

    if(userList) {
      const user = userList[0];

      io.to(user.room).emit('message', generateMessage(user.username, `${user.username} has left!`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server connected on port ${port}`);
});
