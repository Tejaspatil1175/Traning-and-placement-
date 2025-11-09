/**
 * Simple rate limiter middleware
 * Install express-rate-limit for production: npm install express-rate-limit
 */

const rateLimitStore = new Map();

/**
 * Simple in-memory rate limiter
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false
  } = options;

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Get user's request history
    let userRequests = rateLimitStore.get(key) || [];
    
    // Remove expired requests
    userRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
    
    // Check limit
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((userRequests[0] + windowMs - now) / 1000)
      });
    }
    
    // Add current request
    userRequests.push(now);
    rateLimitStore.set(key, userRequests);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - userRequests.length);
    res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
    
    next();
  };
};

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, requests] of rateLimitStore.entries()) {
    if (requests.length === 0 || now - requests[requests.length - 1] > 3600000) {
      rateLimitStore.delete(key);
    }
  }
}, 3600000);

module.exports = createRateLimiter;
