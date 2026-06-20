package routes

import (
	"netgames-go-server/controllers"

	"github.com/gin-gonic/gin"
)

// SetupScoreRoutes configures all routes related to scores
func SetupScoreRoutes(router *gin.Engine) {
	scoreGroup := router.Group("/score")
	{
		// Get all scores
		scoreGroup.GET("", controllers.GetAllGameScores)

		// Get score by ID
		scoreGroup.GET("/:scoreId", controllers.GetScoreById)

		// Post a new score
		scoreGroup.POST("", controllers.PostScore)

		// Add comment to score
		scoreGroup.POST("/addComment", controllers.AddCommentToScore)
	}
}
