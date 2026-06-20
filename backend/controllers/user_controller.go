package controllers

import (
	"context"
	"net/http"
	"netgames-go-server/db"
	"netgames-go-server/models"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// AddUser creates a new user
func AddUser(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Check if username already exists
	var existingUser models.User
	err := db.UserColl.FindOne(ctx, bson.M{"username": user.Username}).Decode(&existingUser)
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Username already exists",
		})
		return
	}

	// Set timestamps
	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now
	user.Scores = []primitive.ObjectID{}

	// Hash the password
	if err := user.HashPassword(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Error hashing password",
		})
		return
	}

	// Insert user into database
	result, err := db.UserColl.InsertOne(ctx, user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Get the inserted user with ID
	user.ID = result.InsertedID.(primitive.ObjectID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Successfully Registered User",
		"data":    user.ToResponse(),
	})
}

// Login authenticates a user
func Login(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var loginData struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Find the user by username
	var user models.User
	err := db.UserColl.FindOne(ctx, bson.M{"username": loginData.Username}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "User not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Verify password
	if !user.CheckPassword(loginData.Password) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid Password",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Found user",
		"data":    user.ToResponse(),
	})
}

// GetAllUsers retrieves all users sorted by updated time
func GetAllUsers(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Set options to sort by updatedAt in descending order (-1)
	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "updatedAt", Value: -1}})

	cursor, err := db.UserColl.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	defer cursor.Close(ctx)

	var users []models.UserResponse
	for cursor.Next(ctx) {
		var user models.User
		if err := cursor.Decode(&user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": err.Error(),
			})
			return
		}
		users = append(users, user.ToResponse())
	}

	if err := cursor.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Successfully retrieved all users",
		"data":    users,
	})
}

// GetUserById retrieves a user by their ID
func GetUserById(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userId := c.Param("userId")
	objectId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid user ID",
		})
		return
	}

	var user models.User
	err = db.UserColl.FindOne(ctx, bson.M{"_id": objectId}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "User not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Successfully retrieved the user",
		"data":    user.ToResponse(),
	})
}

// GetUserScores retrieves all scores associated with a user
func GetUserScores(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userId := c.Param("userId")
	objectId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid user ID",
		})
		return
	}

	// Find the user by ID
	var user models.User
	err = db.UserColl.FindOne(ctx, bson.M{"_id": objectId}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "User not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// If user has no scores, return empty list
	if len(user.Scores) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "User has no scores",
			"data":    []models.ScoreWithUserDetails{},
		})
		return
	}

	// Find all scores for user
	cursor, err := db.ScoreColl.Find(ctx, bson.M{"_id": bson.M{"$in": user.Scores}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	defer cursor.Close(ctx)

	// Collect all scores
	var scores []models.Score
	if err := cursor.All(ctx, &scores); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// For each score, populate owner and comments
	var userScores []models.ScoreWithUserDetails
	for _, score := range scores {
		// Populate owner
		var owner models.User
		err := db.UserColl.FindOne(ctx, bson.M{"_id": score.Owner}).Decode(&owner)
		if err != nil {
			continue // Skip if owner not found
		}

		// Populate comments
		var commentsWithDetails []models.CommentWithUserDetails
		if len(score.Comments) > 0 {
			commentsCursor, err := db.CommentColl.Find(ctx, bson.M{"_id": bson.M{"$in": score.Comments}})
			if err == nil {
				defer commentsCursor.Close(ctx)

				var comments []models.Comment
				if err := commentsCursor.All(ctx, &comments); err == nil {
					for _, comment := range comments {
						var commentAuthor models.User
						err := db.UserColl.FindOne(ctx, bson.M{"_id": comment.Author}).Decode(&commentAuthor)
						if err == nil {
							commentsWithDetails = append(commentsWithDetails, models.CommentWithUserDetails{
								ID:        comment.ID,
								Score:     comment.Score,
								Author:    commentAuthor.ToResponse(),
								Text:      comment.Text,
								CreatedAt: comment.CreatedAt,
								UpdatedAt: comment.UpdatedAt,
							})
						}
					}
				}
			}
		}

		userScores = append(userScores, models.ScoreWithUserDetails{
			ID:        score.ID,
			Owner:     owner.ToResponse(),
			Value:     score.Value,
			Text:      score.Text,
			Comments:  commentsWithDetails,
			CreatedAt: score.CreatedAt,
			UpdatedAt: score.UpdatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Successfully retrieved the user",
		"data":    userScores,
	})
}
