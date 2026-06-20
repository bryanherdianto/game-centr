package db

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

var (
	Client              *mongo.Client
	UserColl            *mongo.Collection
	ScoreColl           *mongo.Collection
	CommentColl         *mongo.Collection
	GameTypeColl        *mongo.Collection
	AchievementColl     *mongo.Collection
	UserAchievementColl *mongo.Collection
)

// ConnectDB establishes connection to MongoDB and sets up collections
func ConnectDB() {
	// Get MongoDB URI from environment variable
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		log.Fatal("MONGODB_URI environment variable not set")
	}

	// Set client options with timeout
	clientOptions := options.Client().ApplyURI(uri)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Connect to MongoDB
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	// Verify the connection
	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		log.Fatal("Failed to ping MongoDB:", err)
	}

	// Set global client
	Client = client

	// Initialize collections
	dbName := "netgames" // using fixed name, could be from env vars
	UserColl = Client.Database(dbName).Collection("users")
	ScoreColl = Client.Database(dbName).Collection("scores")
	CommentColl = Client.Database(dbName).Collection("comments")
	GameTypeColl = Client.Database(dbName).Collection("game_types")
	AchievementColl = Client.Database(dbName).Collection("achievements")
	UserAchievementColl = Client.Database(dbName).Collection("user_achievements")

	log.Println("Connected to MongoDB")

	// Initialize game types and create indexes
	if err := InitGameTypes(client, dbName); err != nil {
		log.Printf("Warning: Failed to initialize game types: %v", err)
	}

	if err := InitGameScoreIndexes(client, dbName); err != nil {
		log.Printf("Warning: Failed to create game score indexes: %v", err)
	}

	// Initialize achievements and create indexes
	if err := InitAchievements(client, dbName); err != nil {
		log.Printf("Warning: Failed to initialize achievements: %v", err)
	}

	if err := InitAchievementIndexes(client, dbName); err != nil {
		log.Printf("Warning: Failed to create achievement indexes: %v", err)
	}
}

// DisconnectDB closes the MongoDB connection
func DisconnectDB() {
	if Client == nil {
		return
	}

	err := Client.Disconnect(context.Background())
	if err != nil {
		log.Fatal("Failed to disconnect from MongoDB:", err)
	}
	log.Println("Disconnected from MongoDB")
}
