package routes

import (
	"netgames-go-server/controllers"

	"github.com/gin-gonic/gin"
)

func SetupGameScoreRoutes(router *gin.Engine) {
	// Game types routes
	gameTypesGroup := router.Group("/game-types")
	{
		gameTypesGroup.GET("", controllers.GetAllGameTypes)
		gameTypesGroup.GET("/:gameCode", controllers.GetGameTypeByCode)
	}

	// Game scores routes
	gameGroup := router.Group("/game")
	{
		// Global leaderboard
		gameGroup.GET("/leaderboard", controllers.GetGlobalLeaderboard)

		// Game-specific leaderboard
		gameGroup.GET("/:gameCode/leaderboard", controllers.GetGameLeaderboard)

		// Game scores
		gameGroup.GET("/:gameCode/score", controllers.GetAllScores)
		gameGroup.POST("/:gameCode/score", controllers.PostScore)
		gameGroup.POST("/:gameCode/score/:scoreId/comment", controllers.AddCommentToScore)

		// User game scores
		gameGroup.GET("/:gameCode/user/:userId/scores", controllers.GetUserGameScores)
	}

	// User stats routes
	userStatsGroup := router.Group("/user")
	{
		userStatsGroup.GET("/:userId/stats", controllers.GetUserGameStats)
	}
}
