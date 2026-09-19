// Lightweight in-memory rate limiter middleware
const rateLimits = new Map();

/**
 * Creates a rate limiting middleware
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} maxRequests - Max requests allowed per window
 * @param {string} message - Custom error message
 */
const createRateLimiter = (windowMs = 60000, maxRequests = 100, message = 'Too many requests, please try again later.') => {
  return (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const key = `${req.baseUrl || req.path}_${clientIp}`;
    const now = Date.now();

    const record = rateLimits.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count++;
    }

    rateLimits.set(key, record);

    // Periodic cleanup of expired records to avoid memory growth
    if (rateLimits.size > 2000) {
      for (const [k, v] of rateLimits.entries()) {
        if (now > v.resetTime) rateLimits.delete(k);
      }
    }

    if (record.count > maxRequests) {
      return res.status(429).json({
        status: 'error',
        message
      });
    }

    next();
  };
};

module.exports = {
  createRateLimiter,
  authRateLimiter: createRateLimiter(60000, 30, 'Too many login or registration attempts. Please wait 1 minute before trying again.'),
  converterRateLimiter: createRateLimiter(60000, 20, 'Document conversion rate limit reached. Please wait a minute before submitting more conversions.')
};
