package routes

import (
	"netgames-go-server/controllers"

	"github.com/gin-gonic/gin"
)

// SetupAchievementRoutes sets up the routes for achievements
func SetupAchievementRoutes(router *gin.Engine) {
	achievementRoutes := router.Group("/achievement")
	{
		// Get all achievements
		achievementRoutes.GET("", controllers.GetAllAchievements)

		// Get user achievements
		achievementRoutes.GET("/user/:userId", controllers.GetUserAchievements)

		// Award an achievement
		achievementRoutes.POST("/award", controllers.AwardAchievement)

		// Check achievement progress
		achievementRoutes.POST("/check-progress", controllers.CheckAchievementProgress)
	}
}
