package controllers

import (
	"context"
	"log"
	"net/http"
	"netgames-go-server/db"
	"netgames-go-server/models"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GetAllGameTypes retrieves all game types
func GetAllGameTypes(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Set options to sort by name
	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "name", Value: 1}})

	cursor, err := db.GameTypeColl.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	defer cursor.Close(ctx)

	var gameTypes []models.GameType
	if err := cursor.All(ctx, &gameTypes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Successfully retrieved all game types",
		"data":    gameTypes,
	})
}

// GetGameTypeByCode retrieves a single game type by its code
func GetGameTypeByCode(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	gameCode := c.Param("gameCode")

	var gameType models.GameType
	err := db.GameTypeColl.FindOne(ctx, bson.M{"game_code": gameCode}).Decode(&gameType)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Game type not found",
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
		"message": "Successfully retrieved game type",
		"data":    gameType,
	})
}

// GetGameLeaderboard retrieves top scores for a specific game with filtering options
func GetGameLeaderboard(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	gameCode := c.Param("gameCode")

	// Parse query parameters for filtering
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10 // Default limit
	}

	timeFrame := c.DefaultQuery("timeFrame", "all") // all, daily, weekly, monthly

	// Build the filter
	filter := bson.M{"game": gameCode}

	// Add time frame filter if specified
	if timeFrame != "all" {
		var startTime time.Time
		now := time.Now()

		switch timeFrame {
		case "daily":
			startTime = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		case "weekly":
			startTime = now.AddDate(0, 0, -7)
		case "monthly":
			startTime = now.AddDate(0, -1, 0)
		}

		if !startTime.IsZero() {
			filter["createdAt"] = bson.M{"$gte": startTime}
		}
	}

	// Get game type to determine scoring type
	var gameType models.GameType
	err = db.GameTypeColl.FindOne(ctx, bson.M{"game_code": gameCode}).Decode(&gameType)
	if err != nil {
		log.Printf("Error retrieving game type %q: %v", gameCode, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}

	// Set options to sort by score descending, with createdAt ascending as a
	// tiebreaker so equal scores rank by who achieved them first, and limit results
	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "value", Value: -1}, {Key: "createdAt", Value: 1}})
	findOptions.SetLimit(int64(limit))

	cursor, err := db.ScoreColl.Find(ctx, filter, findOptions)
	if err != nil {
		log.Printf("Error finding leaderboard scores: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}
	defer cursor.Close(ctx)

	var scores []models.Score
	if err := cursor.All(ctx, &scores); err != nil {
		log.Printf("Error decoding leaderboard scores: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}

	// Batch-fetch owners to avoid an N+1 lookup per leaderboard entry
	ownerIDs := make([]primitive.ObjectID, 0, len(scores))
	for _, score := range scores {
		ownerIDs = append(ownerIDs, score.Owner)
	}
	ownerMap, err := buildUserMap(ctx, ownerIDs)
	if err != nil {
		log.Printf("Error fetching leaderboard owners: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		return
	}

	var leaderboardEntries []gin.H
	rank := 0
	for _, score := range scores {
		owner, ok := ownerMap[score.Owner]
		if !ok {
			continue // Skip if owner not found
		}

		// Increment rank only for entries we actually include so ranks stay
		// contiguous even when an owner lookup is skipped
		rank++
		leaderboardEntries = append(leaderboardEntries, gin.H{
			"rank":        rank,
			"score":       score.Value,
			"user":        owner.ToResponse(),
			"metadata":    score.Metadata,
			"createdAt":   score.CreatedAt,
			"scoringType": gameType.ScoringType,
		})
	}

	// Get aggregated stats
	aggregatedStats, err := getGameAggregatedStats(ctx, gameCode)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Successfully retrieved leaderboard, but failed to get aggregated stats",
			"data":    leaderboardEntries,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Successfully retrieved leaderboard",
		"data":    leaderboardEntries,
		"stats":   aggregatedStats,
		"gameInfo": gin.H{
			"name":        gameType.Name,
			"description": gameType.Description,
			"scoringType": gameType.ScoringType,
			"maxScore":    gameType.MaxScore,
		},
	})
}

// getGameAggregatedStats retrieves aggregated statistics for a game
func getGameAggregatedStats(ctx context.Context, gameCode string) (gin.H, error) {
	// Pipeline for aggregating game stats
	pipeline := mongo.Pipeline{
		// Match documents for this game
		{{"$match", bson.M{"game": gameCode}}},
		// Group and calculate statistics
		{{"$group", bson.M{
			"_id":          nil,
			"totalPlays":   bson.M{"$sum": 1},
			"averageScore": bson.M{"$avg": "$value"},
			"highestScore": bson.M{"$max": "$value"},
			"lowestScore":  bson.M{"$min": "$value"},
		}}},
	}

	cursor, err := db.ScoreColl.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	// If no results, return empty stats
	if len(results) == 0 {
		return gin.H{
			"totalPlays":   0,
			"averageScore": 0,
			"highestScore": 0,
			"lowestScore":  0,
		}, nil
	}

	return gin.H{
		"totalPlays":   results[0]["totalPlays"],
		"averageScore": results[0]["averageScore"],
		"highestScore": results[0]["highestScore"],
		"lowestScore":  results[0]["lowestScore"],
	}, nil
}

// GetUserGameStats retrieves aggregated statistics for a user across all games
func GetUserGameStats(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userId := c.Param("userId")

	userObjectId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid user ID",
		})
		return
	}

	// Get user details
	var user models.User
	err = db.UserColl.FindOne(ctx, bson.M{"_id": userObjectId}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
		})
		return
	}

	// Pipeline for aggregating user stats across all games
	overallPipeline := mongo.Pipeline{
		// Match documents for this user
		{{"$match", bson.M{"owner": userObjectId}}},
		// Group and calculate statistics
		{{"$group", bson.M{
			"_id":          nil,
			"totalPlays":   bson.M{"$sum": 1},
			"averageScore": bson.M{"$avg": "$value"},
			"highestScore": bson.M{"$max": "$value"},
		}}},
	}

	overallCursor, err := db.ScoreColl.Aggregate(ctx, overallPipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	defer overallCursor.Close(ctx)

	var overallResults []bson.M
	if err = overallCursor.All(ctx, &overallResults); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Pipeline for aggregating user stats by game
	byGamePipeline := mongo.Pipeline{
		// Match documents for this user
		{{"$match", bson.M{"owner": userObjectId}}},
		// Group by game and calculate statistics
		{{"$group", bson.M{
			"_id":          "$game",
			"totalPlays":   bson.M{"$sum": 1},
			"averageScore": bson.M{"$avg": "$value"},
			"highestScore": bson.M{"$max": "$value"},
			"lastPlayed":   bson.M{"$max": "$createdAt"},
		}}},
		// Sort by most played
		{{"$sort", bson.M{"totalPlays": -1}}},
	}

	byGameCursor, err := db.ScoreColl.Aggregate(ctx, byGamePipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	defer byGameCursor.Close(ctx)

	var byGameResults []bson.M
	if err = byGameCursor.All(ctx, &byGameResults); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Batch-fetch all game types referenced by the user's stats to avoid an
	// N+1 lookup per game.
	gameCodes := make([]string, 0, len(byGameResults))
	for _, stat := range byGameResults {
		if code, ok := stat["_id"].(string); ok {
			gameCodes = append(gameCodes, code)
		}
	}

	gameTypeMap := make(map[string]models.GameType)
	if len(gameCodes) > 0 {
		gtCursor, err := db.GameTypeColl.Find(ctx, bson.M{"game_code": bson.M{"$in": gameCodes}})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": err.Error(),
			})
			return
		}
		var gameTypesList []models.GameType
		if err := gtCursor.All(ctx, &gameTypesList); err != nil {
			gtCursor.Close(ctx)
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": err.Error(),
			})
			return
		}
		gtCursor.Close(ctx)
		for _, gt := range gameTypesList {
			gameTypeMap[gt.GameCode] = gt
		}
	}

	// Enhance game stats with game info
	var gameStats []gin.H
	for _, stat := range byGameResults {
		gameCode := stat["_id"].(string)

		// Get game type info
		gameType, ok := gameTypeMap[gameCode]
		if !ok {
			// Skip if game type not found
			continue
		}

		gameStats = append(gameStats, gin.H{
			"gameCode":     gameCode,
			"gameName":     gameType.Name,
			"totalPlays":   stat["totalPlays"],
			"averageScore": stat["averageScore"],
			"highestScore": stat["highestScore"],
			"lastPlayed":   stat["lastPlayed"],
			"scoringType":  gameType.ScoringType,
		})
	}

	// Prepare response
	var overallStats gin.H
	if len(overallResults) > 0 {
		overallStats = gin.H{
			"totalPlays":   overallResults[0]["totalPlays"],
			"averageScore": overallResults[0]["averageScore"],
			"highestScore": overallResults[0]["highestScore"],
			"totalGames":   len(gameStats),
		}
	} else {
		overallStats = gin.H{
			"totalPlays":   0,
			"averageScore": 0,
			"highestScore": 0,
			"totalGames":   0,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Successfully retrieved user game statistics",
		"user":    user.ToResponse(),
		"overall": overallStats,
		"games":   gameStats,
	})
}

// GetGlobalLeaderboard retrieves top players across all games
func GetGlobalLeaderboard(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Parse query parameters
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10 // Default limit
	}

	// Pipeline for aggregating top players
	pipeline := mongo.Pipeline{
		// Group by user and calculate statistics
		{{"$group", bson.M{
			"_id":        "$owner",
			"totalScore": bson.M{"$sum": "$value"},
			"totalPlays": bson.M{"$sum": 1},
			"avgScore":   bson.M{"$avg": "$value"},
			"games":      bson.M{"$addToSet": "$game"},
		}}},
		// Sort by total score descending
		{{"$sort", bson.M{"totalScore": -1}}},
		// Limit results
		{{"$limit", int64(limit)}},
	}

	cursor, err := db.ScoreColl.Aggregate(ctx, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Batch-fetch users to avoid an N+1 lookup per leaderboard entry
	userIDs := make([]primitive.ObjectID, 0, len(results))
	for _, result := range results {
		if id, ok := result["_id"].(primitive.ObjectID); ok {
			userIDs = append(userIDs, id)
		}
	}
	userMap, err := buildUserMap(ctx, userIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Enhance with user details
	var leaderboard []gin.H
	for i, result := range results {
		userId := result["_id"].(primitive.ObjectID)

		// Get user details
		user, ok := userMap[userId]
		if !ok {
			continue // Skip if user not found
		}

		// Count unique games played
		gamesPlayed := len(result["games"].(primitive.A))

		leaderboard = append(leaderboard, gin.H{
			"rank":        i + 1,
			"user":        user.ToResponse(),
			"totalScore":  result["totalScore"],
			"totalPlays":  result["totalPlays"],
			"avgScore":    result["avgScore"],
			"gamesPlayed": gamesPlayed,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Successfully retrieved global leaderboard",
		"data":    leaderboard,
	})
}

// GetUserGameScores retrieves all scores for a specific user and game
func GetUserGameScores(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	gameCode := c.Param("gameCode")
	userId := c.Param("userId")

	userObjectId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid user ID",
		})
		return
	}

	// Set options to sort by updatedAt in descending order
	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "updatedAt", Value: -1}})

	cursor, err := db.ScoreColl.Find(ctx, bson.M{
		"game":  gameCode,
		"owner": userObjectId,
	}, findOptions)
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

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Successfully retrieved user game scores",
		"data":    scores,
	})
}
