import app from './src/index';
import * as dotenv from 'dotenv';
import cron from 'node-cron';
import { updateGrowthStatus } from './src/utils/updateGrowthStatus';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { updateStoreWithNewSeeds } from './src/controllers/storeController';
import express from 'express'; // Asegúrate de importar express
import path from 'path'; // Asegúrate de importar path

dotenv.config();

const PORT = process.env.PORT || 3002;

const server = createServer(app);

// Usa la instancia del servidor para Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
});

// Maneja las conexiones de Socket.IO
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Asigna la instancia de Socket.IO a locals
app.locals.io = io;

// ** Agrega esta línea para servir archivos estáticos **
app.use('/assets', express.static(path.join(__dirname, 'src/public/assets')));

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// Tarea programada para ejecutar cada 2 horas. (update growth status)
cron.schedule('0 */2 * * *', async () => {
  console.log(`Running cron job at ${new Date().toISOString()}`);

  await updateGrowthStatus(io);
});

// Tarea programada para ejecutarse cada 1 minuto (renew store)
cron.schedule('* * * * *', async () => {
  try {
    await updateStoreWithNewSeeds();
    io.emit('storeUpdated', 60);
    console.log('store updated with socket io');
  } catch (error) {
    console.error('Error updating store:', error);
  }
});
