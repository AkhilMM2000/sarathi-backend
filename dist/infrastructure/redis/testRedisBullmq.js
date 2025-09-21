"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redisBullmqClient_1 = require("./redisBullmqClient");
async function testRedisConnection() {
    try {
        await redisBullmqClient_1.redisBullmq.set('testKey', 'Hello from Redis Cloud');
        await redisBullmqClient_1.redisBullmq.set('testKeys', 'Hello from Redis Clouds');
        const value = await redisBullmqClient_1.redisBullmq.get('testKeys');
        console.log('✅ Redis connected. Value:', value);
    }
    catch (err) {
        console.error('❌ Redis connection failed:', err);
    }
    finally {
        redisBullmqClient_1.redisBullmq.disconnect();
    }
}
testRedisConnection();
//# sourceMappingURL=testRedisBullmq.js.map