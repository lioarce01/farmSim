import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './routes/index';
import { auth } from 'express-openid-connect';

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

app.use('/', routes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
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


  // app.get('/api/auth/me', (req, res) => {
  //   if (req.oidc.isAuthenticated()) {
  //     res.json(req.oidc.user);
  //   } else {
  //     res.status(401).json({ error: 'Not authenticated' });
  //   }
  // });

app.get('/test', (req, res) => {
    res.send('server running');
});

export default app;