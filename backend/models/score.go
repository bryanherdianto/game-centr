package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Score struct {
	ID        primitive.ObjectID     `bson:"_id,omitempty" json:"_id,omitempty"`
	Owner     primitive.ObjectID     `bson:"owner" json:"owner" binding:"required"`
	Game      string                 `bson:"game" json:"game" binding:"required"` // Game type identifier
	Value     int                    `bson:"value" json:"value" binding:"required"`
	Text      string                 `bson:"text" json:"text"`
	Metadata  map[string]interface{} `bson:"metadata,omitempty" json:"metadata,omitempty"` // Additional game-specific data
	Comments  []primitive.ObjectID   `bson:"comments" json:"comments"`
	CreatedAt time.Time              `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time              `bson:"updatedAt" json:"updatedAt"`
}

// ScoreWithUserDetails includes user information along with the score
type ScoreWithUserDetails struct {
	ID        primitive.ObjectID       `json:"_id,omitempty"`
	Owner     UserResponse             `json:"owner"`
	Game      string                   `json:"game"`
	Value     int                      `json:"value"`
	Text      string                   `json:"text"`
	Metadata  map[string]interface{}   `json:"metadata,omitempty"`
	Comments  []CommentWithUserDetails `json:"comments"`
	CreatedAt time.Time                `json:"createdAt"`
	UpdatedAt time.Time                `json:"updatedAt"`
}

// GameType represents a type of game in the system
type GameType struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	GameCode    string             `bson:"game_code" json:"game_code" binding:"required"`
	Name        string             `bson:"name" json:"name" binding:"required"`
	Description string             `bson:"description" json:"description"`
	ScoringType string             `bson:"scoring_type" json:"scoring_type"`
	MaxScore    *int               `bson:"max_score,omitempty" json:"max_score,omitempty"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}

// Leaderboard represents a cached leaderboard for a specific game and timeframe
type Leaderboard struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	GameType    string             `bson:"game_type" json:"game_type" binding:"required"`
	Timeframe   string             `bson:"timeframe" json:"timeframe" binding:"required"`
	Entries     []LeaderboardEntry `bson:"entries" json:"entries"`
	LastUpdated time.Time          `bson:"last_updated" json:"last_updated"`
}

// LeaderboardEntry represents a single entry in a leaderboard
type LeaderboardEntry struct {
	UserID   primitive.ObjectID `bson:"user_id" json:"user_id"`
	Username string             `bson:"username" json:"username"`
	Score    int                `bson:"score" json:"score"`
	Rank     int                `bson:"rank" json:"rank"`
}
