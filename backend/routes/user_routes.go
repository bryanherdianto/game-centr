package routes

import (
	"time"

	"netgames-go-server/controllers"
	"netgames-go-server/middleware"

	"github.com/gin-gonic/gin"
)

// SetupUserRoutes configures all routes related to users
func SetupUserRoutes(router *gin.Engine) {
	// Strict per-IP rate limit for auth endpoints (login + register).
	authLimiter := middleware.RateLimit(10, time.Minute)

	userGroup := router.Group("/user")
	{
		// Get all users
		userGroup.GET("", controllers.GetAllUsers)

		// User login (rate limited)
		userGroup.POST("/login", authLimiter, controllers.Login)

		// Get user by ID
		userGroup.GET("/:userId", controllers.GetUserById)

		// Get user scores
		userGroup.GET("/getUserScores/:userId", controllers.GetUserScores)

		// Get user game stats (consolidated here from SetupGameScoreRoutes so all
		// /user routes are registered in a single place / tree)
		userGroup.GET("/:userId/stats", controllers.GetUserGameStats)

		// Add user (register) (rate limited)
		userGroup.POST("/addUser", authLimiter, controllers.AddUser)
	}
}
