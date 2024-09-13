import app from './src/index'
import * as dotenv from 'dotenv';
const cron = require('node-cron');
const { updateStoreWithNewSeeds } = require('./seedsGeneration.js'); // Ruta correcta
dotenv.config()

const PORT = process.env.PORT || 3001

cron.schedule('* */8 * * *', async () => {
    try {
      console.log('Actualizando la tienda con nuevas semillas...');
      await updateStoreWithNewSeeds();
      console.log('Tienda actualizada con éxito.');
    } catch (error) {
      console.error('Error al actualizar la tienda:', error);
    }
  });

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})