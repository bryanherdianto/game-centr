package routes

import (
	"netgames-go-server/controllers"
	"netgames-go-server/middleware"

	"github.com/gin-gonic/gin"
)

func SetupGameScoreRoutes(router *gin.Engine) {
	auth := middleware.AuthRequired()

	// Game types routes
	gameTypesGroup := router.Group("/game-types")
	gameTypesGroup.Use(auth)
	{
		gameTypesGroup.GET("", controllers.GetAllGameTypes)
		gameTypesGroup.GET("/:gameCode", controllers.GetGameTypeByCode)
	}

	// Game scores routes
	gameGroup := router.Group("/game")
	gameGroup.Use(auth)
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

	// Note: /user/:userId/stats is registered in SetupUserRoutes so all /user
	// routes share a single registration tree.
}
