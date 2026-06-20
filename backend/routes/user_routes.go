package routes

import (
	"netgames-go-server/controllers"

	"github.com/gin-gonic/gin"
)

// SetupUserRoutes configures all routes related to users
func SetupUserRoutes(router *gin.Engine) {
	userGroup := router.Group("/user")
	{
		// Get all users
		userGroup.GET("", controllers.GetAllUsers)

		// User login
		userGroup.POST("/login", controllers.Login)

		// Get user by ID
		userGroup.GET("/:userId", controllers.GetUserById)

		// Get user scores
		userGroup.GET("/getUserScores/:userId", controllers.GetUserScores)

		// Add user (register)
		userGroup.POST("/addUser", controllers.AddUser)
	}
}
