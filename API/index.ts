import app from './src/index';
import * as dotenv from 'dotenv';
import cron from 'node-cron';
import { updateStoreWithNewSeeds } from './seedsGeneration.js'
dotenv.config();

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

cron.schedule('0 */8 * * *', async () => {
  try {
    console.log('Actualizando la tienda con nuevas semillas...');
    await updateStoreWithNewSeeds();
    console.log('Tienda actualizada con éxito.');
  } catch (error) {
    console.error('Error al actualizar la tienda:', error);
  }
});