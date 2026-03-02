import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { ensureDatabaseConnected } from './config/database';
import routes from './modules';

const app = express();

app.use(async (req, res, next) => {
  await ensureDatabaseConnected();
  next();
});

app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Soul match Server!');
});

app.use('/', routes);

export default app;
