import mongoose, { Document, Schema } from 'mongoose';

export interface IClaim extends Document {
  userId: mongoose.Types.ObjectId;
  status: 'PENDING' | 'APPROVED' | 'NEEDS_PROOF' | 'FLAGGED';
  trustScore: number;
  trustScoreBreakdown: {
    movement: number;
    accelerometer: number;
    gyroscope: number;
    barometer: number;
    network: number;
    activity: number;
    deviceIntegrity: number;
  };
  claimDate: Date;
  proofImageUrl?: string;
  weatherContext?: {
    isStorm: boolean;
    weatherCondition: string;
    description: string;
  };
}

const claimSchema = new Schema<IClaim>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'NEEDS_PROOF', 'FLAGGED'], default: 'PENDING' },
    trustScore: { type: Number, default: 0 },
    trustScoreBreakdown: {
      movement: { type: Number, default: 0 },
      accelerometer: { type: Number, default: 0 },
      gyroscope: { type: Number, default: 0 },
      barometer: { type: Number, default: 0 },
      network: { type: Number, default: 0 },
      activity: { type: Number, default: 0 },
      deviceIntegrity: { type: Number, default: 0 },
    },
    claimDate: { type: Date, default: Date.now },
    proofImageUrl: { type: String },
    weatherContext: {
      isStorm: { type: Boolean },
      weatherCondition: { type: String },
      description: { type: String }
    }
  },
  { timestamps: true }
);

export default mongoose.model<IClaim>('Claim', claimSchema);
