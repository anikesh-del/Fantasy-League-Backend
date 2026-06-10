
const redis = require('../config/redis.js');

function slidingWindowLimiter({
    windowMs = 60000,
    max = 10,
    keyPrefix = 'rl:sw',
} = {}) {

    return async function slidingWindowMiddleware(req, res, next) {
        const identifier = req.user?.user_id || req.ip;
        const key = `${keyPrefix}:${identifier}`;
        const now = Date.now();

        const windowStart = now - windowMs;
        const member = `${now}-${Math.random().toString(36).slice(2, 7)}`;
        const ttlSeconds = Math.ceil(windowMs / 1000);

        const luascript = `
    local key=KEYS[1]
    local windowStart=tonumber(ARGV[1])
    local ttlSeconds=tonumber(ARGV[2])
    local max=tonumber(ARGV[3])
    local now=tonumber(ARGV[4])
    local member=ARGV[5]

    redis.call('ZREMRANGEBYSCORE',key,'-inf',windowStart)

    local count=redis.call('ZCARD',key)
    
    if count >= max then
                local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
                local resetAt = oldest[2] and (tonumber(oldest[2]) + (now - windowStart)) or now
                return {0, count, resetAt}
            end

    redis.call('ZADD',key,now,member)
    redis.call('EXPIRE',key,ttlSeconds)

    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
            local resetAt = tonumber(oldest[2]) + (now - windowStart)
            return {1, count + 1, resetAt}
    `;
        try {
            const [allowed, currentCount, resetAtMs] = await redis.eval(luascript, 1, key, windowStart, ttlSeconds, max, now, member);

            const remaining = Math.max(0, max - currentCount);

            res.set({
                'X-RateLimit-Limit': max,
                'X-RateLimit-Remaining': remaining,
                'X-RateLimit-Reset': Math.ceil(resetAtMs / 1000), // Unix epoch
            });

            if (!allowed) {
                const retryAfter = Math.max(1, Math.ceil((resetAtMs - now) / 1000));
                res.set('Retry-After', retryAfter);
                return res.status(429).json({
                    error: 'Too Many Requests',
                    retryAfter,
                });
            }

            next();
        } catch (err) {
            console.error('[rate-limiter] Redis error:', err);
            return res.status(503).json({ error: 'Service Unavailable' });
        }
    };
}

module.exports = slidingWindowLimiter;