package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// rateLimiter is a self-contained in-memory fixed-window per-IP rate limiter.
// It uses only the standard library + sync (no external dependencies).
type rateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
	limit    int           // max requests per window
	window   time.Duration // length of the fixed window
}

// visitor tracks a single client IP's request count for the current window.
type visitor struct {
	count       int
	windowStart time.Time
	lastSeen    time.Time
}

// newRateLimiter creates a rate limiter allowing `limit` requests per `window`.
// It starts a background goroutine that periodically evicts stale visitors.
func newRateLimiter(limit int, window time.Duration) *rateLimiter {
	rl := &rateLimiter{
		visitors: make(map[string]*visitor),
		limit:    limit,
		window:   window,
	}
	go rl.cleanupLoop()
	return rl
}

// allow reports whether a request from the given IP is permitted right now,
// updating the fixed-window counter for that IP.
func (rl *rateLimiter) allow(ip string) bool {
	now := time.Now()

	rl.mu.Lock()
	defer rl.mu.Unlock()

	v, ok := rl.visitors[ip]
	if !ok || now.Sub(v.windowStart) >= rl.window {
		// Start a fresh window for this IP.
		rl.visitors[ip] = &visitor{
			count:       1,
			windowStart: now,
			lastSeen:    now,
		}
		return true
	}

	v.lastSeen = now
	if v.count >= rl.limit {
		return false
	}
	v.count++
	return true
}

// cleanupLoop periodically removes visitors that have been idle for a while
// to keep memory bounded.
func (rl *rateLimiter) cleanupLoop() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		now := time.Now()
		rl.mu.Lock()
		for ip, v := range rl.visitors {
			// Drop entries idle for more than 10 minutes.
			if now.Sub(v.lastSeen) > 10*time.Minute {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}

// middleware returns a gin handler enforcing this limiter, keyed by client IP.
func (rl *rateLimiter) middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		if !rl.allow(ip) {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"message": "Too many requests",
			})
			return
		}
		c.Next()
	}
}

// RateLimit returns a gin middleware that allows `limit` requests per `window`
// per client IP, responding with HTTP 429 when exceeded.
func RateLimit(limit int, window time.Duration) gin.HandlerFunc {
	return newRateLimiter(limit, window).middleware()
}
