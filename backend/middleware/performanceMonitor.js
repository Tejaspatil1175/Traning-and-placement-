/**
 * Request performance monitoring middleware
 * Logs slow queries and tracks API performance
 */

const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  
  // Capture the original send function
  const originalSend = res.send;
  
  res.send = function (data) {
    const duration = Date.now() - startTime;
    
    // Log slow requests (>1 second)
    if (duration > 1000) {
      console.warn(`⚠️ Slow Request: ${req.method} ${req.originalUrl} - ${duration}ms`);
    }
    
    // Add performance headers
    res.setHeader('X-Response-Time', `${duration}ms`);
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${req.method} ${req.originalUrl} - ${duration}ms`);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = performanceMonitor;
