import { Redis, RedisOptions } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();
const redisConfig: RedisOptions = {
  host: process.env.REDIS_CLOUD_HOST,
  port: Number(process.env.REDIS_CLOUD_PORT),
  username: 'default',
  password: process.env.REDIS_CLOUD_PASSWORD,
};


if (process.env.NODE_ENV === 'production') {
  redisConfig.tls = {};
}

export const redisBullmq = new Redis(redisConfig);

