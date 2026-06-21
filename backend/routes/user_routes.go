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

	// Require a valid JWT for everything except login/register.
	auth := middleware.AuthRequired()

	userGroup := router.Group("/user")
	{
		// Login and register are public (rate limited).
		userGroup.POST("/login", authLimiter, controllers.Login)
		userGroup.POST("/addUser", authLimiter, controllers.AddUser)

		// Get all users
		userGroup.GET("", auth, controllers.GetAllUsers)

		// Get user by ID
		userGroup.GET("/:userId", auth, controllers.GetUserById)

		// Get user scores
		userGroup.GET("/getUserScores/:userId", auth, controllers.GetUserScores)

		// Get user game stats (consolidated here from SetupGameScoreRoutes so all
		// /user routes are registered in a single place / tree)
		userGroup.GET("/:userId/stats", auth, controllers.GetUserGameStats)
	}
}
