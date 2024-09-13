import 'dotenv/config';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './routes/index';

const app = express();
const prisma = new PrismaClient();

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

app.use('/', routes);

app.get('/test', (req, res) => {
    res.send('server running');
});

export default app;