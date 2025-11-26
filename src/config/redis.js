import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL
})


redisClient.on("error", (err) => {
    console.log
})


redisClient.on("error", (err) => {
    console.err("redis errror")
})



// (async () => {
//     await redisClient.connect();
// })();

await redisClient.connect();

export default redisClient;




// import { createClient } from 'redis';

// const redisClient = createClient();

// redisClient.on('error', err => console.log('Redis Client Error', err));

// await redisClient.connect();

// export default redisClient;