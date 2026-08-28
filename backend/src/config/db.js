import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  mongoose.connection.on('error', (err) => {
    console.error('[mongo] connection error:', err.message);
  });

  await mongoose.connect(env.mongoUri);
  console.log('[mongo] connected');
}

export function dbState() {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  return mongoose.connection.readyState;
}
