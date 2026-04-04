import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  phoneNumber: string;
  isMockLocationEnabled: boolean;
  isRooted: boolean;
  isBlocked: boolean;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    phoneNumber: { type: String, required: true, unique: true },
    isMockLocationEnabled: { type: Boolean, default: false },
    isRooted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
