import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import claimRoutes from './routes/claim.routes';
import sensorRoutes from './routes/sensor.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/claims', claimRoutes);
app.use('/api/sensors', sensorRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;
