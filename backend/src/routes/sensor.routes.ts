import { Router } from 'express';
import { streamSensorData, getSensorLogs } from '../controllers/sensor.controller';

const router = Router();

router.post('/stream', streamSensorData);
router.get('/:claimId', getSensorLogs);

export default router;
