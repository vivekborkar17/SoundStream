const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  socket.on('create-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('audio-chunk', ({ roomId, chunk }) => {
    socket.to(roomId).emit('audio-chunk', chunk);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));