import app from './src/index';
import * as dotenv from 'dotenv';
import cron from 'node-cron';
import { updateStoreWithNewSeeds } from './utils/seedsGeneration.js'
import { updateSeedStatus } from './utils/updateSeedStatus.js';
import { auth } from 'express-openid-connect'
import express, { NextFunction, Request, Response } from 'express';
dotenv.config();

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

app.use(
  auth({
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    baseURL: 'http://localhost:3002', // Cambia esto a la URL de tu aplicación
    clientID: process.env.AUTH0_CLIENT_ID,
    secret: process.env.AUTH0_CLIENT_SECRET,
    authRequired: false, // Establece esto a true si quieres que todas las rutas estén protegidas
    auth0Logout: true,   // Habilita el logout
  })
)

app.get('/api/auth/me', (req, res) => {
  if (req.oidc.isAuthenticated()) {
    res.json(req.oidc.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
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