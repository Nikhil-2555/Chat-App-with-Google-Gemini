import Redis from 'ioredis';


const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD

});

redisClient.on('error', err => console.log('Redis Client Error', err));

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('ready', () => {
    console.log('Redis is ready');
});


export default redisClient;



// >>> bar

