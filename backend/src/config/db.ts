import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Override DNS resolution to use Google's DNS to prevent Windows querySrv ECONNREFUSED errors
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urlshortener';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

export default connectDB;
