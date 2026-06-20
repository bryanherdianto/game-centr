package db

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"netgames-go-server/models"
)

// InitGameTypes initializes the game_types collection with predefined game types
func InitGameTypes(client *mongo.Client, dbName string) error {
	collection := client.Database(dbName).Collection("game_types")

	// Create a unique index on game_code field
	indexModel := mongo.IndexModel{
		Keys:    bson.D{{Key: "game_code", Value: 1}},
		Options: options.Index().SetUnique(true),
	}
	_, err := collection.Indexes().CreateOne(context.Background(), indexModel)
	if err != nil {
		log.Printf("Error creating index on game_types: %v", err)
		return err
	}

	// Define game types
	gameTypes := []models.GameType{
		{
			GameCode:    "colorguess",
			Name:        "Color Guess",
			Description: "Match colors with their correct names",
			ScoringType: "points",
			MaxScore:    intPtr(20),
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "guess",
			Name:        "Number Guess",
			Description: "Guess a number between 1-100",
			ScoringType: "points",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "hangman",
			Name:        "Hangman",
			Description: "Guess the word before the hangman is complete",
			ScoringType: "binary",
			MaxScore:    intPtr(100),
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "memorymatch",
			Name:        "Memory Match",
			Description: "Match pairs of cards",
			ScoringType: "points",
			MaxScore:    intPtr(1000),
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "patternrepeater",
			Name:        "Pattern Repeater",
			Description: "Repeat patterns of arrow keys",
			ScoringType: "rounds",
			MaxScore:    intPtr(20),
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "pong",
			Name:        "Pong Game",
			Description: "Classic pong game with bouncing ball",
			ScoringType: "bounces",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "quickmath",
			Name:        "Quick Math Challenge",
			Description: "Solve math equations quickly",
			ScoringType: "points",
			MaxScore:    intPtr(15),
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "simonsays",
			Name:        "Simon Says",
			Description: "Repeat color patterns from memory",
			ScoringType: "rounds",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "typing",
			Name:        "Typing Game",
			Description: "Type sentences as quickly as possible",
			ScoringType: "sentences",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "whackamole",
			Name:        "Whack-a-Mole",
			Description: "Click on moles as they appear",
			ScoringType: "points",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
	}

	// Insert game types using upsert to avoid duplicates
	for _, gameType := range gameTypes {
		filter := bson.M{"game_code": gameType.GameCode}
		update := bson.M{"$set": gameType}
		opts := options.Update().SetUpsert(true)

		_, err := collection.UpdateOne(context.Background(), filter, update, opts)
		if err != nil {
			log.Printf("Error upserting game type %s: %v", gameType.GameCode, err)
			return err
		}
	}

	log.Println("Game types initialized successfully")
	return nil
}

// intPtr returns a pointer to the given int value
func intPtr(i int) *int {
	return &i
}

// InitGameScoreIndexes creates indexes for the scores collection
func InitGameScoreIndexes(client *mongo.Client, dbName string) error {
	collection := client.Database(dbName).Collection("scores")

	// Create indexes
	indexes := []mongo.IndexModel{
		{
			Keys: bson.D{{Key: "owner", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "game", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "value", Value: -1}}, // Descending for leaderboards
		},
		{
			Keys: bson.D{
				{Key: "game", Value: 1},
				{Key: "owner", Value: 1},
			},
		},
		{
			Keys: bson.D{{Key: "createdAt", Value: -1}}, // For time-based filtering
		},
	}

	_, err := collection.Indexes().CreateMany(context.Background(), indexes)
	if err != nil {
		log.Printf("Error creating indexes on scores: %v", err)
		return err
	}

	log.Println("Game score indexes created successfully")
	return nil
}
