import app from './src/index';
import * as dotenv from 'dotenv';
import cron from 'node-cron';
import { updateStoreWithNewSeeds } from './src/utils/seedsGeneration.js'
import { updateSeedStatus } from './src/utils/updateSeedStatus.js';
dotenv.config();

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// Tarea programada para ejecutar cada hora
cron.schedule('0 * * * *', async () => {
  console.log('Checking for seeds that need water...');
  await updateSeedStatus();
});