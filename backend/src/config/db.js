import mongoose from 'mongoose';
import { config } from './config.js';

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  const uri = config.mongodbUri;
  const isAtlas = uri.startsWith('mongodb+srv://');
  // Safe URI for logging (hide credentials)
  const safeUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');

  try {
    console.log(`🔄 [MongoDB] Connecting to ${isAtlas ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB'} [${safeUri}]...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: true
    });

    isConnected = true;
    console.log(`✅ [MongoDB] Connected to ${isAtlas ? 'Atlas Cloud Database' : 'Database'}: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    console.error(`❌ [MongoDB] Connection to ${isAtlas ? 'MongoDB Atlas' : 'Local MongoDB'} failed: ${error.message}`);
    if (isAtlas) {
      console.error('💡 [MongoDB Atlas Tip] Ensure your IP address is whitelisted in MongoDB Atlas Network Access (e.g. 0.0.0.0/0 for anywhere), and that database username/password are correct.');
    }
    return null;
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

export default mongoose;
