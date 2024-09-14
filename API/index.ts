import app from './src/index';
import * as dotenv from 'dotenv';
import cron from 'node-cron';
import { updateStoreWithNewSeeds } from './utils/seedsGeneration.js'
import { updateSeedStatus } from './utils/updateSeedStatus.js';
dotenv.config();

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});


//se actualiza cada 1 minuto actualmente, cambiarlo mas adelante.
cron.schedule('* * * * *', async () => {
  try {
    console.log('Actualizando la tienda con nuevas semillas y aguas...');
    await updateStoreWithNewSeeds();
    console.log('Tienda actualizada con éxito.');
  } catch (error) {
    console.error('Error al actualizar la tienda:', error);
  }
});

// Tarea programada para ejecutar cada hora
cron.schedule('0 * * * *', async () => {
  console.log('Checking for seeds that need water...');
  await updateSeedStatus();
});