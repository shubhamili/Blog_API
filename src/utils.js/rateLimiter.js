import rateLimit from "express-rate-limit";

export const basicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    ipv6Subnet: 56, // Adjust the subnet size as needed
    message: 'Too many requests, please try again later.',
})

export const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5,                   // only 5 attempts allowed
    message: 'Too many login attempts. Try again after 10 minutes.',
});

