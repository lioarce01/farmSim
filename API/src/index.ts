import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './routes/index';
import { auth } from 'express-openid-connect';

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
      baseURL: 'http://localhost:3002', 
      clientID: process.env.AUTH0_CLIENT_ID,
      secret: process.env.AUTH0_CLIENT_SECRET,
      authRequired: false, 
      auth0Logout: true, 
    })
  )

app.get('/test', (req, res) => {
    res.send('server running');
});

export default app;