package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Comment represents a user's comment on a score
type Comment struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	Score     primitive.ObjectID `bson:"score" json:"score" binding:"required"`
	Author    primitive.ObjectID `bson:"author" json:"author" binding:"required"`
	Text      string             `bson:"text" json:"text" binding:"required"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}

// CommentWithUserDetails includes user information with the comment
type CommentWithUserDetails struct {
	ID        primitive.ObjectID `json:"_id,omitempty"`
	Score     primitive.ObjectID `json:"score"`
	Author    UserResponse       `json:"author"`
	Text      string             `json:"text"`
	CreatedAt time.Time          `json:"createdAt"`
	UpdatedAt time.Time          `json:"updatedAt"`
}
