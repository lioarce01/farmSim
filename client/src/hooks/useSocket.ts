// hooks/useSocket.ts
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const useSocket = (url: string) => {
  const socket: Socket = io(url);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    // Manejar la desconexión
    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return socket;
};

export default useSocket;
