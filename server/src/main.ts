import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import categoriesRouter from './routing/categories';
import menuItemsRouter from './routing/menu-items';

const PORT = 3000;
const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());
app.use('/', categoriesRouter);
app.use('/', menuItemsRouter);

server.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
