package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Achievement represents a game achievement that can be earned by users
type Achievement struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	GameCode    string             `bson:"game_code" json:"gameCode"`
	Code        string             `bson:"code" json:"code"`
	Title       string             `bson:"title" json:"title"`
	Description string             `bson:"description" json:"description"`
	Icon        string             `bson:"icon" json:"icon"`
	Difficulty  string             `bson:"difficulty" json:"difficulty"` // easy, medium, hard
	IsHidden    bool               `bson:"is_hidden" json:"isHidden"`    // Easter egg achievements
	CreatedAt   time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updatedAt"`
}

// UserAchievement represents an achievement earned by a user
type UserAchievement struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID        primitive.ObjectID `bson:"user_id" json:"userId"`
	AchievementID primitive.ObjectID `bson:"achievement_id" json:"achievementId"`
	GameCode      string             `bson:"game_code" json:"gameCode"`
	AwardedAt     time.Time          `bson:"awarded_at" json:"awardedAt"`
}

// AchievementWithDetails represents an achievement with additional details for display
type AchievementWithDetails struct {
	ID          primitive.ObjectID `json:"id"`
	GameCode    string             `json:"gameCode"`
	GameName    string             `json:"gameName"`
	Code        string             `json:"code"`
	Title       string             `json:"title"`
	Description string             `json:"description"`
	Icon        string             `json:"icon"`
	Difficulty  string             `json:"difficulty"`
	IsHidden    bool               `json:"isHidden"`
	IsUnlocked  bool               `json:"isUnlocked"`
	AwardedAt   *time.Time         `json:"awardedAt,omitempty"`
}

// UserProfile represents a user's profile with their achievements
type UserProfile struct {
	User         UserResponse             `json:"user"`
	Achievements []AchievementWithDetails `json:"achievements"`
	Stats        map[string]interface{}   `json:"stats"`
}
