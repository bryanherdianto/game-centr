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
	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "updatedAt", Value: -1}})

	cursor, err := db.ScoreColl.Find(ctx, filter, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	defer cursor.Close(ctx)

	var scores []models.Score
	if err := cursor.All(ctx, &scores); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	var scoresWithDetails []models.ScoreWithUserDetails
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
				var comments []models.Comment
				if err := commentsCursor.All(ctx, &comments); err == nil {
					commentsCursor.Close(ctx)

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

		scoresWithDetails = append(scoresWithDetails, models.ScoreWithUserDetails{
			ID:        score.ID,
			Owner:     owner.ToResponse(),
			Game:      score.Game,
			Value:     score.Value,
			Text:      score.Text,
			Metadata:  score.Metadata,
			Comments:  commentsWithDetails,
			CreatedAt: score.CreatedAt,
			UpdatedAt: score.UpdatedAt,
		})
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
	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "updatedAt", Value: -1}})

	cursor, err := db.ScoreColl.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	defer cursor.Close(ctx)

	var scores []models.Score
	if err := cursor.All(ctx, &scores); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	var scoresWithDetails []models.ScoreWithUserDetails
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
				var comments []models.Comment
				if err := commentsCursor.All(ctx, &comments); err == nil {
					commentsCursor.Close(ctx)

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

		scoresWithDetails = append(scoresWithDetails, models.ScoreWithUserDetails{
			ID:        score.ID,
			Owner:     owner.ToResponse(),
			Game:      score.Game,
			Value:     score.Value,
			Text:      score.Text,
			Comments:  commentsWithDetails,
			CreatedAt: score.CreatedAt,
			UpdatedAt: score.UpdatedAt,
		})
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
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
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

	var scoreRequest struct {
		Owner    primitive.ObjectID     `json:"owner" binding:"required"`
		Game     string                 `json:"game"`
		Value    int                    `json:"value" binding:"required"`
		Text     string                 `json:"text"`
		Metadata map[string]interface{} `json:"metadata,omitempty"`
	}

	if err := c.ShouldBindJSON(&scoreRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Check if user exists
	var user models.User
	err := db.UserColl.FindOne(ctx, bson.M{"_id": scoreRequest.Owner}).Decode(&user)
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

	// Create score
	now := time.Now()
	score := models.Score{
		Owner:     scoreRequest.Owner,
		Game:      game,
		Value:     scoreRequest.Value,
		Text:      scoreRequest.Text,
		Metadata:  scoreRequest.Metadata,
		Comments:  []primitive.ObjectID{},
		CreatedAt: now,
		UpdatedAt: now,
	}

	// Insert score into database
	result, err := db.ScoreColl.InsertOne(ctx, score)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Get the inserted score with ID
	score.ID = result.InsertedID.(primitive.ObjectID)

	// Add score to user scores array
	_, err = db.UserColl.UpdateOne(
		ctx,
		bson.M{"_id": scoreRequest.Owner},
		bson.M{"$push": bson.M{"scores": score.ID}, "$set": bson.M{"updatedAt": now}},
	)
	if err != nil {
		// This shouldn't fail the request, but log it
		// In production, you might want to handle this differently
		// such as removing the score if we can't update the user
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Successfully added score but failed to update user record",
			"data":    score,
		})
		return
	}

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

	var commentRequest struct {
		Author primitive.ObjectID `json:"author" binding:"required"`
		Text   string             `json:"text" binding:"required"`
	}

	if err := c.ShouldBindJSON(&commentRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Check if user exists
	var user models.User
	err = db.UserColl.FindOne(ctx, bson.M{"_id": commentRequest.Author}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "User not found",
		})
		return
	}

	// Check if score exists and belongs to the correct game
	var score models.Score
	err = db.ScoreColl.FindOne(ctx, bson.M{"_id": objectId, "game": gameCode}).Decode(&score)
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
		Author:    commentRequest.Author,
		Text:      commentRequest.Text,
		CreatedAt: now,
		UpdatedAt: now,
	}

	// Insert comment into database
	result, err := db.CommentColl.InsertOne(ctx, comment)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	comment.ID = result.InsertedID.(primitive.ObjectID)

	// Add comment to score comments array
	_, err = db.ScoreColl.UpdateOne(
		ctx,
		bson.M{"_id": objectId},
		bson.M{"$push": bson.M{"comments": comment.ID}, "$set": bson.M{"updatedAt": now}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Successfully added comment",
		"data":    comment,
	})
}
