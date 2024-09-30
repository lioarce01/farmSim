import app from './src/index';
import * as dotenv from 'dotenv';
import cron from 'node-cron';
import { updateGrowthStatus } from './src/utils/updateGrowthStatus';
import { createServer } from 'http'
import { Server } from 'socket.io'

dotenv.config();

const PORT = process.env.PORT || 3002;

const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id)

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id)
  })
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// Tarea programada para ejecutar cada 1 minuto.
cron.schedule('0 */2 * * *', async () => {
  console.log(`Running cron job at ${new Date().toISOString()}`);
  
  await updateGrowthStatus(io);
});
