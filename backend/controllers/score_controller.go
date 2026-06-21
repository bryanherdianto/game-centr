package controllers

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"netgames-go-server/db"
	"netgames-go-server/middleware"
	"netgames-go-server/models"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GetAllScores retrieves all scores with populated owner and comments data
// If gameCode is provided in the URL, it filters scores by that game
func GetAllScores(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if game code is provided in the URL
	gameCode := c.Param("gameCode")

	// Prepare filter
	filter := bson.M{}
	if gameCode != "" {
		filter["game"] = gameCode
	}

	// Set options to sort by updatedAt in descending order (-1)
	limit, skip := parsePagination(c)
	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "updatedAt", Value: -1}})
	findOptions.SetLimit(limit)
	findOptions.SetSkip(skip)

	cursor, err := db.ScoreColl.Find(ctx, filter, findOptions)
	if err != nil {
		log.Printf("Error finding scores: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}
	defer cursor.Close(ctx)

	var scores []models.Score
	if err := cursor.All(ctx, &scores); err != nil {
		log.Printf("Error decoding scores: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}

	// Batch-populate owners and comments to avoid N+1 lookups
	scoresWithDetails, err := populateScores(ctx, scores)
	if err != nil {
		log.Printf("Error populating scores: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Successfully retrieved all scores",
		"data":    scoresWithDetails,
	})
}

func GetAllGameScores(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Set options to sort by updatedAt in descending order (-1)
	limit, skip := parsePagination(c)
	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "updatedAt", Value: -1}})
	findOptions.SetLimit(limit)
	findOptions.SetSkip(skip)

	cursor, err := db.ScoreColl.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		log.Printf("Error finding game scores: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}
	defer cursor.Close(ctx)

	var scores []models.Score
	if err := cursor.All(ctx, &scores); err != nil {
		log.Printf("Error decoding game scores: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}

	// Batch-populate owners and comments to avoid N+1 lookups
	scoresWithDetails, err := populateScores(ctx, scores)
	if err != nil {
		log.Printf("Error populating game scores: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Successfully retrieved all scores",
		"data":    scoresWithDetails,
	})
}

// GetScoreById retrieves a single score by ID with populated data
func GetScoreById(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	scoreId := c.Param("scoreId")
	objectId, err := primitive.ObjectIDFromHex(scoreId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid score ID",
		})
		return
	}

	var score models.Score
	err = db.ScoreColl.FindOne(ctx, bson.M{"_id": objectId}).Decode(&score)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Score not found",
			})
			return
		}
		log.Printf("Error finding score by ID: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}

	// Populate owner
	var owner models.User
	err = db.UserColl.FindOne(ctx, bson.M{"_id": score.Owner}).Decode(&owner)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Owner not found",
		})
		return
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

	scoreWithDetails := models.ScoreWithUserDetails{
		ID:        score.ID,
		Owner:     owner.ToResponse(),
		Game:      score.Game,
		Value:     score.Value,
		Text:      score.Text,
		Metadata:  score.Metadata,
		Comments:  commentsWithDetails,
		CreatedAt: score.CreatedAt,
		UpdatedAt: score.UpdatedAt,
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Successfully retrieved score",
		"data":    scoreWithDetails,
	})
}

// PostScore creates a new score
func PostScore(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get game code from URL parameter if available
	gameCode := c.Param("gameCode")

	// The score owner is the authenticated user, NOT a value from the request
	// body — this prevents posting scores on behalf of another user.
	owner, ok := middleware.AuthUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	var scoreRequest struct {
		Game     string                 `json:"game"`
		Value    int                    `json:"value"`
		Text     string                 `json:"text" binding:"max=280"`
		Metadata map[string]interface{} `json:"metadata,omitempty"`
	}

	if err := c.ShouldBindJSON(&scoreRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Reject negative score values (0 is allowed)
	if scoreRequest.Value < 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Score value cannot be negative",
		})
		return
	}

	// Enforce score text length limit (defensive even if binding is bypassed)
	if len(scoreRequest.Text) > maxScoreTextLen {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Score text is too long",
		})
		return
	}

	// Cap the metadata payload size to avoid storing oversized blobs
	if scoreRequest.Metadata != nil {
		metaBytes, err := bson.Marshal(scoreRequest.Metadata)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Invalid metadata",
			})
			return
		}
		if len(metaBytes) > maxMetadataBytes {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Metadata is too large",
			})
			return
		}
	}

	// Check if user exists
	var user models.User
	err := db.UserColl.FindOne(ctx, bson.M{"_id": owner}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "User not found",
			})
			return
		}
		log.Printf("Error finding user for score: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}

	// Use game code from URL if provided, otherwise use from request body
	game := gameCode
	if game == "" {
		game = scoreRequest.Game
	}

	// Validate that we have a game code
	if game == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Game code is required",
		})
		return
	}

	// Server-side sanity bound: if the game defines a positive max score,
	// reject values above it. (Not a substitute for auth.)
	var gameType models.GameType
	gtErr := db.GameTypeColl.FindOne(ctx, bson.M{"game_code": game}).Decode(&gameType)
	if gtErr == nil && gameType.MaxScore != nil && *gameType.MaxScore > 0 && scoreRequest.Value > *gameType.MaxScore {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Score value exceeds the maximum allowed for this game",
		})
		return
	}

	// Create score
	now := time.Now()
	score := models.Score{
		Owner:     owner,
		Game:      game,
		Value:     scoreRequest.Value,
		Text:      scoreRequest.Text,
		Metadata:  scoreRequest.Metadata,
		Comments:  []primitive.ObjectID{},
		CreatedAt: now,
		UpdatedAt: now,
	}

	// Atomically insert the score and push its id onto the user's scores array.
	// A MongoDB transaction ensures a partial failure cannot orphan the score.
	session, err := db.Client.StartSession()
	if err != nil {
		log.Printf("Error starting session for score write: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}
	defer session.EndSession(ctx)

	var insertedID primitive.ObjectID
	_, err = session.WithTransaction(ctx, func(sessCtx mongo.SessionContext) (interface{}, error) {
		result, err := db.ScoreColl.InsertOne(sessCtx, score)
		if err != nil {
			return nil, err
		}

		id, ok := result.InsertedID.(primitive.ObjectID)
		if !ok {
			return nil, fmt.Errorf("unexpected InsertedID type for score: %T", result.InsertedID)
		}
		insertedID = id

		_, err = db.UserColl.UpdateOne(
			sessCtx,
			bson.M{"_id": owner},
			bson.M{"$push": bson.M{"scores": id}, "$set": bson.M{"updatedAt": now}},
		)
		if err != nil {
			return nil, err
		}
		return nil, nil
	})
	if err != nil {
		log.Printf("Error writing score transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}

	score.ID = insertedID

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Successfully added score",
		"data":    score,
	})
}

// AddCommentToScore adds a comment to a score for a specific game
func AddCommentToScore(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	gameCode := c.Param("gameCode")
	scoreId := c.Param("scoreId")
	objectId, err := primitive.ObjectIDFromHex(scoreId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid score ID"})
		return
	}

	// The comment author is the authenticated user, NOT a value from the body.
	author, ok := middleware.AuthUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	var commentRequest struct {
		Text string `json:"text" binding:"required,max=500"`
	}

	if err := c.ShouldBindJSON(&commentRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Enforce comment text length limit (defensive even if binding is bypassed)
	if len(commentRequest.Text) > maxCommentTextLen {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Comment text is too long",
		})
		return
	}

	// Check if user exists
	var user models.User
	err = db.UserColl.FindOne(ctx, bson.M{"_id": author}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "User not found",
		})
		return
	}

	// Check if score exists and belongs to the correct game.
	// On the game-scoped route gameCode is present and the score must match it;
	// on the legacy route gameCode is empty so we match by _id only.
	scoreFilter := bson.M{"_id": objectId}
	if gameCode != "" {
		scoreFilter["game"] = gameCode
	}

	var score models.Score
	err = db.ScoreColl.FindOne(ctx, scoreFilter).Decode(&score)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Score not found for this game",
		})
		return
	}

	// Create comment
	now := time.Now()
	comment := models.Comment{
		Score:     objectId,
		Author:    author,
		Text:      commentRequest.Text,
		CreatedAt: now,
		UpdatedAt: now,
	}

	// Insert comment into database
	result, err := db.CommentColl.InsertOne(ctx, comment)
	if err != nil {
		log.Printf("Error inserting comment: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}

	commentID, ok := result.InsertedID.(primitive.ObjectID)
	if !ok {
		log.Printf("Error: unexpected InsertedID type for comment: %T", result.InsertedID)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}
	comment.ID = commentID

	// Add comment to score comments array
	_, err = db.ScoreColl.UpdateOne(
		ctx,
		bson.M{"_id": objectId},
		bson.M{"$push": bson.M{"comments": comment.ID}, "$set": bson.M{"updatedAt": now}},
	)
	if err != nil {
		log.Printf("Error updating score with comment: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Successfully added comment",
		"data":    comment,
	})
}
