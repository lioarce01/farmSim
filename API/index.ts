import app from './src/index';
import * as dotenv from 'dotenv';
import cron from 'node-cron';
import { updateGrowthStatus } from './src/utils/updateGrowthStatus';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { updateStoreWithNewSeeds } from './src/controllers/storeController';
import express from 'express';
import path from 'path';
import { ClimateEventType, PrismaClient } from '@prisma/client';
import { applyClimateEffectToAllFarms } from './src/utils/climateEvents';

const prisma = new PrismaClient();

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

// TAREA PARA EVENTOS CLIMÁTICOS (SEMANAL)
cron.schedule('* * * * *', async () => {
  // Verificar si hay un evento climático activo
  const activeEvent = await prisma.climateEvent.findFirst({
    where: {
      isActive: true,
    },
  });

  if (!activeEvent) {
    // Si no hay un evento activo, generar uno nuevo
    const eventType =
      Object.values(ClimateEventType)[Math.floor(Math.random() * 4)];
    const intensity = Math.floor(Math.random() * 5) + 1;
    const duration = Math.floor(Math.random() * 7) + 1;

    const event = await prisma.climateEvent.create({
      data: {
        type: eventType,
        intensity,
        duration,
        endTime: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });

    await applyClimateEffectToAllFarms(event);

    io.emit('climateEvent', event);

    console.log(
      `Nuevo evento climático generado: ${event.type} con intensidad ${event.intensity}`,
    );
  } else {
    console.log(
      `Evento activo encontrado: ${activeEvent.type}. No se generará uno nuevo.`,
    );
  }
});

// Verificar y terminar eventos climáticos cuando expiren
cron.schedule('* * * * *', async () => {
  const now = new Date();

  const expiredEvents = await prisma.climateEvent.findMany({
    where: {
      endTime: { lte: now },
      isActive: true,
    },
  });

  for (const event of expiredEvents) {
    await prisma.climateEvent.update({
      where: { id: event.id },
      data: { isActive: false },
    });

    console.log(`Evento climático finalizado: ${event.type}`);
    io.emit('climateEventEnd', event);
  }
});
