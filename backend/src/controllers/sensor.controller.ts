import { Request, Response } from 'express';
import SensorLog from '../models/SensorLog';

export const streamSensorData = async (req: Request, res: Response) => {
  try {
    const { claimId, userId, timestamp, location, network, motion, barometer, activity } = req.body;
    
    if (!claimId || !userId) {
      return res.status(400).json({ message: 'claimId and userId are required' });
    }

    const log = new SensorLog({
      claimId,
      userId,
      timestamp,
      location,
      network,
      motion,
      barometer,
      activity
    });

    await log.save();
    res.status(201).json({ message: 'Sensor data logged successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSensorLogs = async (req: Request, res: Response) => {
  try {
    const { claimId } = req.params;
    const logs = await SensorLog.find({ claimId }).sort({ timestamp: 1 });
    res.status(200).json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
