import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/coderank';

  try {
    console.log('🔄 [MongoDB] Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    isConnected = true;
    console.log(`✅ [MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    console.warn(`⚠️ [MongoDB] Connection to Atlas/Local MongoDB failed (${error.message}).`);
    console.warn('ℹ️ [MongoDB] Running with in-memory fallback datasets for seamless local testing.');
    return null;
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

export default mongoose;
