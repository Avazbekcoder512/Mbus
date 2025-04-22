import { RateLimiterMemory } from 'rate-limiter-flexible'

const rateLimiter = new RateLimiterMemory({
    points: 3,
    duration: 60,
    blockDuration: 900
});

export const loginLimit = async (req, res, next) => {
    try {
        await rateLimiter.consume(req.ip)
        next()
    } catch (rateLimiterRes) {
        return res.status(429).send({
            error: `Siz juda ko'p urinish qildingiz! Iltimos 15 daqiqa kuting!`
        })
    }
}