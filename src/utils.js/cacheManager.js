import redisClient from "../config/redis.js";

export const CacheKeys = {
    singlePost: (id) => `posts:${id}`,
    paginatedPosts: (page, limit) => `posts:page=${page}:limit=${limit}`,
};

export const invalidateSinglePost = async (id) => {
    await redisClient.del(CacheKeys.singlePost(id));
};

export const invalidateAllPostPages = async () => {
    const keys = await redisClient.keys("posts:page=*");
    if (keys.length > 0) {
        await redisClient.del(keys);
    }
};
