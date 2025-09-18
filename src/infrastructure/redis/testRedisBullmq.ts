import { redisBullmq } from './redisBullmqClient';

async function testRedisConnection() {
  try {
    await redisBullmq.set('testKey', 'Hello from Redis Cloud');
     await redisBullmq.set('testKeys', 'Hello from Redis Clouds');
    const value = await redisBullmq.get('testKeys');
    console.log('✅ Redis connected. Value:', value);
  } catch (err) {
    console.error('❌ Redis connection failed:', err);
  } finally {
    redisBullmq.disconnect();
  }
}

testRedisConnection();


