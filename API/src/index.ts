import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './routes/index';
import { auth } from 'express-openid-connect';

const app = express();

// Configuración de CORS
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// Configuración de body-parser
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

// Rutas de la API
app.use('/', routes);

// Manejador de errores
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Configuración de autenticación de Auth0
app.use(
  auth({
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    baseURL: 'http://localhost:3002',
    clientID: process.env.AUTH0_CLIENT_ID,
    secret: process.env.AUTH0_CLIENT_SECRET,
    authRequired: false,
    auth0Logout: true,
  }),
);

export default app;
