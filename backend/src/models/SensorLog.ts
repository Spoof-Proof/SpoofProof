import mongoose, { Document, Schema } from 'mongoose';

export interface ISensorLog extends Document {
  claimId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
    speed: number;
    accuracy: number;
  };
  network: {
    strength: number; // e.g., 0-100 or dBm
    type: string; // e.g., LTE, 5G, WIFI
  };
  motion: {
    accelerometer: { x: number; y: number; z: number };
    gyroscope: { x: number; y: number; z: number };
  };
  barometer?: {
    pressure: number;
  };
  activity: {
    type: string; // walking, driving, idle
    confidence: number;
  };
}

const sensorLogSchema = new Schema<ISensorLog>(
  {
    claimId: { type: Schema.Types.ObjectId, ref: 'Claim', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      speed: { type: Number, required: true },
      accuracy: { type: Number, required: true }
    },
    network: {
      strength: { type: Number, required: true },
      type: { type: String, required: true }
    },
    motion: {
      accelerometer: { x: Number, y: Number, z: Number },
      gyroscope: { x: Number, y: Number, z: Number },
    },
    barometer: {
      pressure: { type: Number }
    },
    activity: {
      type: { type: String, required: true },
      confidence: { type: Number, required: true }
    }
  },
  { timestamps: true }
);

export default mongoose.model<ISensorLog>('SensorLog', sensorLogSchema);
