import Redis from 'ioredis';
import 'dotenv/config';

const client = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,

    retryStrategy(times){
        if(times>10) return null;
        return Math.min(times*200,3000);
    },

    enableOfflineQueue:true,

     lazyConnect: true,

     keyPrefix:'myapp',
  
});

client.on('connect', () => {
  console.log('[Redis] Connected to Redis');
});

client.on('error', (err) => {
  console.error('[Redis] Error connecting to Redis:', err);
});

client.on('reconnecting', () => {
  console.log('[Redis] 🔄 Reconnecting...');
});

client.on('end', () => {
  console.log('[Redis] Disconnected from Redis');
});

export default client;  