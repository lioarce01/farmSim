import app from './src/index';
import * as dotenv from 'dotenv';
import cron from 'node-cron';
import { updateGrowthStatus } from './src/utils/updateGrowthStatus';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const PORT = process.env.PORT || 3002;

// Crea el servidor HTTP
const server = createServer(app); 

// Usa la instancia del servidor para Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
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

// Cambia esto para usar el servidor que creaste
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// Tarea programada para ejecutar cada 21 minutos.
cron.schedule('* * * * *', async () => {
  console.log(`Running cron job at ${new Date().toISOString()}`);
  
  await updateGrowthStatus(io);
});
