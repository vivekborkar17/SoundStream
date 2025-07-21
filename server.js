const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Initialize Socket.io
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Socket.io event handlers
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('create-room', (roomId) => {
      socket.join(roomId);
      console.log(`Room created: ${roomId}`);
    });

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`Client ${socket.id} joined room: ${roomId}`);
    });

    socket.on('audio-chunk', ({ roomId, chunk }) => {
      socket.to(roomId).emit('audio-chunk', chunk);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
