import { io, Socket } from 'socket.io-client';

// Connect to local or current host socket server
const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin;

export const socket: Socket = io(socketUrl, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});
