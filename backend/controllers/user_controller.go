package controllers

import (
	"context"
	"log"
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
		log.Printf("Error inserting user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}

	// Get the inserted user with ID
	id, ok := result.InsertedID.(primitive.ObjectID)
	if !ok {
		log.Printf("Error: unexpected InsertedID type for user: %T", result.InsertedID)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}
	user.ID = id

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
			log.Printf("Login failed: user not found for username %q", loginData.Username)
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid username or password",
			})
			return
		}
		log.Printf("Error finding user during login: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}

	// Verify password
	if !user.CheckPassword(loginData.Password) {
		log.Printf("Login failed: invalid password for username %q", loginData.Username)
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid username or password",
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
	limit, skip := parsePagination(c)
	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "updatedAt", Value: -1}})
	findOptions.SetLimit(limit)
	findOptions.SetSkip(skip)

	cursor, err := db.UserColl.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		log.Printf("Error finding users: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}
	defer cursor.Close(ctx)

	var users []models.UserResponse
	for cursor.Next(ctx) {
		var user models.User
		if err := cursor.Decode(&user); err != nil {
			log.Printf("Error decoding user: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Internal server error",
			})
			return
		}
		users = append(users, user.ToResponse())
	}

	if err := cursor.Err(); err != nil {
		log.Printf("Cursor error iterating users: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
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
		log.Printf("Error finding user by ID: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
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
		log.Printf("Error finding user for scores: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
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
		log.Printf("Error finding scores for user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}
	defer cursor.Close(ctx)

	// Collect all scores
	var scores []models.Score
	if err := cursor.All(ctx, &scores); err != nil {
		log.Printf("Error decoding scores for user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}

	// Batch-populate owners and comments to avoid N+1 lookups
	userScores, err := populateScores(ctx, scores)
	if err != nil {
		log.Printf("Error populating user scores: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Successfully retrieved the user",
		"data":    userScores,
	})
}
