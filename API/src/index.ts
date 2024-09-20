import 'dotenv/config';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './routes/index';
// import authMiddleware from './middleware/auth';
// import 'types/express'

const app = express();

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

app.use('/', routes);

app.get('/test', (req, res) => {
    res.send('server running');
});

// app.get('/api/auth/me', authMiddleware, (req, res) => {
//     if (!req.user) {
//       return res.status(401).json({ message: 'Unauthorized' });
//     }
  
//     res.json({
//       id: req.user.id,
//       username: req.user.username,
//       inventory: req.user.inventory,
//       balanceToken: req.user.balanceToken
//     });
//   });

export default app;