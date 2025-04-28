import { RateLimiterMemory } from 'rate-limiter-flexible'

const rateLimiter = new RateLimiterMemory({
    points: 5,
    duration: 300,
    blockDuration: 1800
});

export const limit = async (req, res, next) => {
    try {
        await rateLimiter.consume(req.ip)
        next()
    } catch (rateLimiterRes) {
        return res.status(429).send({
            error: `Siz juda ko'p urinish qildingiz! Iltimos 30 daqiqa kuting!`
        })
    }
}