import app from './src/index';
import * as dotenv from 'dotenv';
import cron from 'node-cron';
import { updateGrowthStatus } from './src/utils/updateSeedStatus.js';
dotenv.config();

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// Tarea programada para ejecutar cada 2 HORAS.
cron.schedule('0 */2 * * *', async () => {
  console.log(`Running cron job at ${new Date().toISOString()}`);
  await updateGrowthStatus();
});
