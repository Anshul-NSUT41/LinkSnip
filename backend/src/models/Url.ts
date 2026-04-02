import mongoose, { Document, Schema } from 'mongoose';

// Visit history entry interface
export interface IVisitEntry {
  timestamp: Date;
  ip?: string;
  userAgent?: string;
  browser?: string;
  os?: string;
  device?: string;
  country?: string;
  referrer?: string;
}

// URL document interface
export interface IUrl extends Document {
  originalUrl: string;
  shortCode: string;
  customAlias?: string;
  userId?: mongoose.Types.ObjectId;
  clickCount: number;
  visitHistory: IVisitEntry[];
  password?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  lastVisitedAt?: Date;
  isExpired(): boolean;
}

const visitEntrySchema = new Schema<IVisitEntry>(
  {
    timestamp: { type: Date, default: Date.now },
    ip: String,
    userAgent: String,
    browser: String,
    os: String,
    device: String,
    country: String,
    referrer: String,
  },
  { _id: false }
);

const urlSchema = new Schema<IUrl>(
  {
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customAlias: {
      type: String,
      trim: true,
      sparse: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    visitHistory: {
      type: [visitEntrySchema],
      default: [],
    },
    password: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    lastVisitedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient lookup
urlSchema.index({ shortCode: 1 });
urlSchema.index({ userId: 1, createdAt: -1 });

// Check if URL is expired
urlSchema.methods.isExpired = function (): boolean {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Don't return password in JSON
urlSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const Url = mongoose.model<IUrl>('Url', urlSchema);
export default Url;
