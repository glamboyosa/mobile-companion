const redis = require('redis')
export const redisClient = redis.createClient(6379)
