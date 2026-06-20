package main

import (
	"log"
	"net/http"
	"netgames-go-server/db"
	"netgames-go-server/routes"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: No .env file found. Using system environment variables.")
	}

	// Connect to MongoDB
	db.ConnectDB()
	defer db.DisconnectDB()

	// Setup Gin router
	router := gin.Default()

	// Configure CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Status endpoint
	router.GET("/status", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "Server is running",
		})
	})

	// Setup routes
	routes.SetupGameScoreRoutes(router)
	routes.SetupUserRoutes(router)
	routes.SetupAchievementRoutes(router)
	routes.SetupScoreRoutes(router)

	// Get port from environment variable or use default
	port := os.Getenv("PORT")

	// Start server in a goroutine
	go func() {
		log.Printf("SERVER IS RUNNING ON PORT %s\n", port)
		if err := router.Run(":" + port); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Set up graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
}
