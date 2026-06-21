package controllers

import (
	"context"
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
)

// GetAllAchievements returns all achievements
func GetAllAchievements(c *gin.Context) {
	var achievements []models.Achievement

	// Get query parameters
	gameCode := c.Query("gameCode")
	showHidden := c.Query("showHidden") == "true"

	// Build filter
	filter := bson.M{}
	if gameCode != "" {
		if gameCode == "all" {
			// Only include global achievements
			filter = bson.M{"game_code": "all"}
		} else {
			// Only include achievements for the specified game and global achievements
			filter = bson.M{
				"$or": []bson.M{
					{"game_code": gameCode},
					{"game_code": "all"},
				},
			}
		}
	}

	// Only show non-hidden achievements unless showHidden is true
	if !showHidden {
		filter["is_hidden"] = false
	}

	// Find achievements
	cursor, err := db.AchievementColl.Find(context.Background(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get achievements"})
		return
	}
	defer cursor.Close(context.Background())

	// Decode achievements
	if err := cursor.All(context.Background(), &achievements); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode achievements"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    achievements,
	})
}

// GetUserAchievements returns all achievements for a user
func GetUserAchievements(c *gin.Context) {
	// Get user ID from URL parameter
	userIDStr := c.Param("userId")
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Get query parameters
	gameCode := c.Query("gameCode")
	showHidden := c.Query("showHidden") == "true"

	// Get all achievements
	var achievements []models.Achievement
	achievementFilter := bson.M{}
	if gameCode != "" {
		if gameCode == "all" {
			// Only include global achievements
			achievementFilter = bson.M{"game_code": "all"}
		} else {
			// Only include achievements for the specified game and global achievements
			achievementFilter = bson.M{
				"$or": []bson.M{
					{"game_code": gameCode},
					{"game_code": "all"},
				},
			}
		}
	}

	// Only show non-hidden achievements unless showHidden is true
	if !showHidden {
		achievementFilter["is_hidden"] = false
	}

	cursor, err := db.AchievementColl.Find(context.Background(), achievementFilter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get achievements"})
		return
	}
	defer cursor.Close(context.Background())

	if err := cursor.All(context.Background(), &achievements); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode achievements"})
		return
	}

	// Get user's unlocked achievements
	var userAchievements []models.UserAchievement
	userAchievementFilter := bson.M{"user_id": userID}
	if gameCode != "" && gameCode != "all" {
		userAchievementFilter["game_code"] = gameCode
	}

	userAchievementCursor, err := db.UserAchievementColl.Find(context.Background(), userAchievementFilter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user achievements"})
		return
	}
	defer userAchievementCursor.Close(context.Background())

	if err := userAchievementCursor.All(context.Background(), &userAchievements); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode user achievements"})
		return
	}

	// Create a map of unlocked achievements
	unlockedAchievements := make(map[string]models.UserAchievement)
	for _, ua := range userAchievements {
		unlockedAchievements[ua.AchievementID.Hex()] = ua
	}

	// Get game types for game names
	var gameTypes []models.GameType
	gameTypeCursor, err := db.GameTypeColl.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get game types"})
		return
	}
	defer gameTypeCursor.Close(context.Background())

	if err := gameTypeCursor.All(context.Background(), &gameTypes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode game types"})
		return
	}

	// Create a map of game codes to game names
	gameNames := make(map[string]string)
	for _, gt := range gameTypes {
		gameNames[gt.GameCode] = gt.Name
	}
	gameNames["all"] = "Global"

	// Combine achievements with user achievement data
	var achievementsWithDetails []models.AchievementWithDetails
	for _, a := range achievements {
		ua, unlocked := unlockedAchievements[a.ID.Hex()]

		// Skip hidden achievements that are not unlocked
		if a.IsHidden && !unlocked && !showHidden {
			continue
		}

		// Get game name
		gameName, ok := gameNames[a.GameCode]
		if !ok {
			gameName = a.GameCode
		}

		// Create achievement with details
		awd := models.AchievementWithDetails{
			ID:          a.ID,
			GameCode:    a.GameCode,
			GameName:    gameName,
			Code:        a.Code,
			Title:       a.Title,
			Description: a.Description,
			Icon:        a.Icon,
			Difficulty:  a.Difficulty,
			IsHidden:    a.IsHidden,
			IsUnlocked:  unlocked,
		}

		// Add awarded time if unlocked
		if unlocked {
			awd.AwardedAt = &ua.AwardedAt
		}

		achievementsWithDetails = append(achievementsWithDetails, awd)
	}

	// Get user data
	var user models.User
	err = db.UserColl.FindOne(context.Background(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user data"})
		return
	}

	// Get user stats from scores collection
	var userScores []models.Score
	scoresCursor, err := db.ScoreColl.Find(context.Background(), bson.M{"owner": userID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user scores"})
		return
	}
	defer scoresCursor.Close(context.Background())
	if err := scoresCursor.All(context.Background(), &userScores); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode user scores"})
		return
	}

	highestScore := 0
	gameCounts := make(map[string]int)
	for _, s := range userScores {
		if s.Value > highestScore {
			highestScore = s.Value
		}
		gameCounts[s.Game]++
	}

	// Compute favorite game = the game_code the user has the most scores in.
	favoriteGame := ""
	maxCount := 0
	for game, count := range gameCounts {
		if count > maxCount {
			maxCount = count
			favoriteGame = game
		}
	}

	stats := map[string]interface{}{
		"totalGamesPlayed":  len(userScores),
		"totalAchievements": len(userAchievements),
		"favoriteGame":      favoriteGame,
		"highestScore":      highestScore,
	}

	// Create user profile
	userProfile := models.UserProfile{
		User:         user.ToResponse(),
		Achievements: achievementsWithDetails,
		Stats:        stats,
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    userProfile,
	})
}

// AwardAchievement awards an achievement to a user
func AwardAchievement(c *gin.Context) {
	// Parse request body
	var input struct {
		GameCode        string `json:"gameCode" binding:"required"`
		AchievementCode string `json:"achievementCode" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// The user is the authenticated caller, NOT a value from the request body.
	userID, ok := middleware.AuthUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Unauthorized"})
		return
	}

	// Find the achievement
	var achievement models.Achievement
	err := db.AchievementColl.FindOne(
		context.Background(),
		bson.M{"game_code": input.GameCode, "code": input.AchievementCode},
	).Decode(&achievement)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Achievement not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find achievement"})
		}
		return
	}

	// Check if the user already has this achievement
	count, err := db.UserAchievementColl.CountDocuments(
		context.Background(),
		bson.M{"user_id": userID, "achievement_id": achievement.ID},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check existing achievements"})
		return
	}

	// If the user already has this achievement, return success
	if count > 0 {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": gin.H{
				"message":        "Achievement already awarded",
				"alreadyAwarded": true,
			},
		})
		return
	}

	// Create user achievement
	userAchievement := models.UserAchievement{
		UserID:        userID,
		AchievementID: achievement.ID,
		GameCode:      input.GameCode,
		AwardedAt:     time.Now(),
	}

	// Insert user achievement
	result, err := db.UserAchievementColl.InsertOne(context.Background(), userAchievement)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to award achievement"})
		return
	}

	// Get the inserted ID
	id, ok := result.InsertedID.(primitive.ObjectID)
	if !ok {
		log.Printf("Error: unexpected InsertedID type for user achievement: %T", result.InsertedID)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	userAchievement.ID = id

	// Get game name
	var gameType models.GameType
	err = db.GameTypeColl.FindOne(context.Background(), bson.M{"game_code": input.GameCode}).Decode(&gameType)
	if err != nil && err != mongo.ErrNoDocuments {
		log.Printf("Error finding game type: %v", err)
	}

	gameName := input.GameCode
	if err == nil {
		gameName = gameType.Name
	}
	if input.GameCode == "all" {
		gameName = "Global"
	}

	// Create achievement with details for response
	achievementWithDetails := models.AchievementWithDetails{
		ID:          achievement.ID,
		GameCode:    achievement.GameCode,
		GameName:    gameName,
		Code:        achievement.Code,
		Title:       achievement.Title,
		Description: achievement.Description,
		Icon:        achievement.Icon,
		Difficulty:  achievement.Difficulty,
		IsHidden:    achievement.IsHidden,
		IsUnlocked:  true,
		AwardedAt:   &userAchievement.AwardedAt,
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"message":        "Achievement awarded successfully",
			"achievement":    achievementWithDetails,
			"alreadyAwarded": false,
		},
	})
}

// CheckAchievementProgress checks if a user has earned any achievements based on their game progress
func CheckAchievementProgress(c *gin.Context) {
	// Parse request body
	var input struct {
		GameCode string                 `json:"gameCode" binding:"required"`
		Progress map[string]interface{} `json:"progress" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// The user is the authenticated caller, NOT a value from the request body.
	userID, ok := middleware.AuthUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Unauthorized"})
		return
	}

	// Get achievements for this game
	var achievements []models.Achievement
	filter := bson.M{
		"$or": []bson.M{
			{"game_code": input.GameCode},
			{"game_code": "all"},
		},
	}

	cursor, err := db.AchievementColl.Find(context.Background(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get achievements"})
		return
	}
	defer cursor.Close(context.Background())

	if err := cursor.All(context.Background(), &achievements); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode achievements"})
		return
	}

	// Get user's existing achievements
	var userAchievements []models.UserAchievement
	userAchievementFilter := bson.M{"user_id": userID}

	userAchievementCursor, err := db.UserAchievementColl.Find(context.Background(), userAchievementFilter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user achievements"})
		return
	}
	defer userAchievementCursor.Close(context.Background())

	if err := userAchievementCursor.All(context.Background(), &userAchievements); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode user achievements"})
		return
	}

	// Create a map of existing achievements
	existingAchievements := make(map[string]bool)
	for _, ua := range userAchievements {
		existingAchievements[ua.AchievementID.Hex()] = true
	}

	// Check each achievement to see if it's been earned
	var newlyAwardedAchievements []models.UserAchievement
	var achievementsWithDetails []models.AchievementWithDetails

	for _, achievement := range achievements {
		// Skip if already earned
		if existingAchievements[achievement.ID.Hex()] {
			continue
		}

		// Check if achievement conditions are met based on game code and progress
		if checkAchievementConditions(achievement, input.GameCode, input.Progress, userID) {
			// Award the achievement
			userAchievement := models.UserAchievement{
				UserID:        userID,
				AchievementID: achievement.ID,
				GameCode:      input.GameCode,
				AwardedAt:     time.Now(),
			}

			// Insert user achievement
			result, err := db.UserAchievementColl.InsertOne(context.Background(), userAchievement)
			if err != nil {
				log.Printf("Error awarding achievement %s: %v", achievement.Code, err)
				continue
			}

			// Get the inserted ID
			id, ok := result.InsertedID.(primitive.ObjectID)
			if !ok {
				log.Printf("Error: unexpected InsertedID type for user achievement %s: %T", achievement.Code, result.InsertedID)
				continue
			}
			userAchievement.ID = id
			newlyAwardedAchievements = append(newlyAwardedAchievements, userAchievement)

			// Get game name
			var gameType models.GameType
			err = db.GameTypeColl.FindOne(context.Background(), bson.M{"game_code": achievement.GameCode}).Decode(&gameType)
			if err != nil && err != mongo.ErrNoDocuments {
				log.Printf("Error finding game type: %v", err)
			}

			gameName := achievement.GameCode
			if err == nil {
				gameName = gameType.Name
			}
			if achievement.GameCode == "all" {
				gameName = "Global"
			}

			// Create achievement with details for response
			achievementWithDetails := models.AchievementWithDetails{
				ID:          achievement.ID,
				GameCode:    achievement.GameCode,
				GameName:    gameName,
				Code:        achievement.Code,
				Title:       achievement.Title,
				Description: achievement.Description,
				Icon:        achievement.Icon,
				Difficulty:  achievement.Difficulty,
				IsHidden:    achievement.IsHidden,
				IsUnlocked:  true,
				AwardedAt:   &userAchievement.AwardedAt,
			}

			achievementsWithDetails = append(achievementsWithDetails, achievementWithDetails)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"achievementsAwarded": len(newlyAwardedAchievements),
			"achievements":        achievementsWithDetails,
		},
	})
}

// checkAchievementConditions checks if the achievement conditions are met based on game progress
func checkAchievementConditions(achievement models.Achievement, gameCode string, progress map[string]interface{}, userID primitive.ObjectID) bool {
	// This is where you would implement the logic to check if the achievement conditions are met
	// For now, we'll just return false since we don't have the actual game logic implemented

	// Example implementation:
	switch achievement.GameCode {
	case "colorguess":
		return checkColorGuessAchievements(achievement, progress)
	case "guess":
		return checkGuessAchievements(achievement, progress)
	case "hangman":
		return checkHangmanAchievements(achievement, progress)
	case "memorymatch":
		return checkMemoryMatchAchievements(achievement, progress)
	case "patternrepeater":
		return checkPatternRepeaterAchievements(achievement, progress)
	case "pong":
		return checkPongAchievements(achievement, progress)
	case "quickmath":
		return checkQuickMathAchievements(achievement, progress)
	case "simonsays":
		return checkSimonSaysAchievements(achievement, progress)
	case "typing":
		return checkTypingAchievements(achievement, progress)
	case "whackamole":
		return checkWhackAMoleAchievements(achievement, progress)
	case "all":
		return checkGlobalAchievements(achievement, progress, gameCode, userID)
	}

	return false
}

// Game-specific achievement checks
// These would be implemented with actual game logic
func checkColorGuessAchievements(achievement models.Achievement, progress map[string]interface{}) bool {
	// Example implementation
	switch achievement.Code {
	case "sharp_eyes":
		if correct, ok := progress["correctAnswers"].(float64); ok && correct == 20 {
			if mistakes, ok := progress["mistakes"].(float64); ok && mistakes == 0 {
				return true
			}
		}
	case "quick_colors":
		if timeSpent, ok := progress["timeSpent"].(float64); ok && timeSpent < 30 {
			return true
		}
	case "color_novice":
		if completed, ok := progress["completed"].(bool); ok && completed {
			return true
		}
	case "rainbow_master":
		if playCount, ok := progress["playCount"].(float64); ok && playCount >= 50 {
			return true
		}
	}
	return false
}

func checkGuessAchievements(achievement models.Achievement, progress map[string]interface{}) bool {
	// Example implementation
	switch achievement.Code {
	case "lucky_guess":
		if guessCount, ok := progress["guessCount"].(float64); ok && guessCount == 1 {
			if correct, ok := progress["correct"].(bool); ok && correct {
				return true
			}
		}
	case "close_call":
		if distance, ok := progress["distance"].(float64); ok && distance <= 2 {
			return true
		}
	case "persistence":
		if guessCount, ok := progress["guessCount"].(float64); ok && guessCount >= 10 {
			return true
		}
	case "binary_search":
		if guessCount, ok := progress["guessCount"].(float64); ok && guessCount <= 7 {
			if correct, ok := progress["correct"].(bool); ok && correct {
				return true
			}
		}
	}
	return false
}

func checkHangmanAchievements(achievement models.Achievement, progress map[string]interface{}) bool {
	// Example implementation
	switch achievement.Code {
	case "word_wizard":
		if incorrectGuesses, ok := progress["incorrectGuesses"].(float64); ok && incorrectGuesses == 0 {
			if solved, ok := progress["solved"].(bool); ok && solved {
				return true
			}
		}
	case "last_chance":
		if remainingGuesses, ok := progress["remainingGuesses"].(float64); ok && remainingGuesses == 1 {
			if solved, ok := progress["solved"].(bool); ok && solved {
				return true
			}
		}
	case "vowel_master":
		if allVowelsGuessed, ok := progress["allVowelsGuessed"].(bool); ok && allVowelsGuessed {
			return true
		}
	case "hangman_savior":
		if winCount, ok := progress["winCount"].(float64); ok && winCount >= 10 {
			return true
		}
	}
	return false
}

func checkMemoryMatchAchievements(achievement models.Achievement, progress map[string]interface{}) bool {
	// Example implementation
	switch achievement.Code {
	case "photographic_memory":
		if incorrectMatches, ok := progress["incorrectMatches"].(float64); ok && incorrectMatches == 0 {
			if completed, ok := progress["completed"].(bool); ok && completed {
				return true
			}
		}
	case "speed_matcher":
		if timeSpent, ok := progress["timeSpent"].(float64); ok && timeSpent < 30 {
			if completed, ok := progress["completed"].(bool); ok && completed {
				return true
			}
		}
	case "memory_novice":
		if completed, ok := progress["completed"].(bool); ok && completed {
			return true
		}
	case "memory_streak":
		if streak, ok := progress["streak"].(float64); ok && streak >= 5 {
			return true
		}
	}
	return false
}

func checkPatternRepeaterAchievements(achievement models.Achievement, progress map[string]interface{}) bool {
	// Example implementation
	switch achievement.Code {
	case "pattern_master":
		if level, ok := progress["level"].(float64); ok && level >= 20 {
			return true
		}
	case "rhythm_king":
		if perfectTiming, ok := progress["perfectTiming"].(bool); ok && perfectTiming {
			return true
		}
	case "pattern_novice":
		if level, ok := progress["level"].(float64); ok && level >= 5 {
			return true
		}
	case "pattern_addict":
		if playCount, ok := progress["playCount"].(float64); ok && playCount >= 20 {
			return true
		}
	}
	return false
}

func checkPongAchievements(achievement models.Achievement, progress map[string]interface{}) bool {
	// Example implementation
	switch achievement.Code {
	case "pong_champion":
		if score, ok := progress["score"].(float64); ok && score >= 50 {
			return true
		}
	case "pong_rally":
		if rallyLength, ok := progress["rallyLength"].(float64); ok && rallyLength >= 20 {
			return true
		}
	case "pong_novice":
		if score, ok := progress["score"].(float64); ok && score >= 1 {
			return true
		}
	case "pong_comeback":
		if comeback, ok := progress["comeback"].(bool); ok && comeback {
			if deficitOvercome, ok := progress["deficitOvercome"].(float64); ok && deficitOvercome >= 5 {
				return true
			}
		}
	}
	return false
}

func checkQuickMathAchievements(achievement models.Achievement, progress map[string]interface{}) bool {
	// Example implementation
	switch achievement.Code {
	case "math_genius":
		if streak, ok := progress["streak"].(float64); ok && streak >= 15 {
			return true
		}
	case "speed_calculator":
		if questionsAnswered, ok := progress["questionsAnswered"].(float64); ok && questionsAnswered >= 10 {
			if timeSpent, ok := progress["timeSpent"].(float64); ok && timeSpent < 20 {
				return true
			}
		}
	case "math_novice":
		if completed, ok := progress["completed"].(bool); ok && completed {
			return true
		}
	case "math_addict":
		if playCount, ok := progress["playCount"].(float64); ok && playCount >= 30 {
			return true
		}
	}
	return false
}

func checkSimonSaysAchievements(achievement models.Achievement, progress map[string]interface{}) bool {
	// Example implementation
	switch achievement.Code {
	case "simon_master":
		if level, ok := progress["level"].(float64); ok && level >= 15 {
			return true
		}
	case "simon_streak":
		if streak, ok := progress["streak"].(float64); ok && streak >= 5 {
			return true
		}
	case "simon_novice":
		if level, ok := progress["level"].(float64); ok && level >= 5 {
			return true
		}
	case "simon_says_dance":
		if perfectTiming, ok := progress["perfectTiming"].(bool); ok && perfectTiming {
			return true
		}
	}
	return false
}

func checkTypingAchievements(achievement models.Achievement, progress map[string]interface{}) bool {
	// Example implementation
	switch achievement.Code {
	case "typing_master":
		if wpm, ok := progress["wpm"].(float64); ok && wpm >= 80 {
			return true
		}
	case "perfect_typist":
		if errors, ok := progress["errors"].(float64); ok && errors == 0 {
			if completed, ok := progress["completed"].(bool); ok && completed {
				return true
			}
		}
	case "typing_novice":
		if completed, ok := progress["completed"].(bool); ok && completed {
			return true
		}
	case "typing_marathon":
		if totalWords, ok := progress["totalWords"].(float64); ok && totalWords >= 1000 {
			return true
		}
	}
	return false
}

func checkWhackAMoleAchievements(achievement models.Achievement, progress map[string]interface{}) bool {
	// Example implementation
	switch achievement.Code {
	case "mole_hunter":
		if molesWhacked, ok := progress["molesWhacked"].(float64); ok && molesWhacked >= 50 {
			return true
		}
	case "quick_reflexes":
		if streak, ok := progress["streak"].(float64); ok && streak >= 10 {
			return true
		}
	case "mole_novice":
		if molesWhacked, ok := progress["molesWhacked"].(float64); ok && molesWhacked >= 1 {
			return true
		}
	case "mole_frenzy":
		if frenzy, ok := progress["frenzy"].(bool); ok && frenzy {
			return true
		}
	}
	return false
}

func checkGlobalAchievements(achievement models.Achievement, progress map[string]interface{}, gameCode string, userID primitive.ObjectID) bool {
	// Example implementation
	switch achievement.Code {
	case "night_owl":
		// Prefer a client-supplied local hour (0-23) so the achievement reflects
		// the player's local time; fall back to server time when absent.
		currentHour := time.Now().Hour()
		if lh, ok := progress["localHour"].(float64); ok && lh >= 0 && lh <= 23 {
			currentHour = int(lh)
		}
		if currentHour >= 0 && currentHour < 4 {
			return true
		}
	case "game_hopper":
		distinctGames, err := db.ScoreColl.Distinct(
			context.Background(), "game", bson.M{"owner": userID},
		)
		if err != nil {
			return false
		}
		return len(distinctGames) >= 10
	case "achievement_hunter":
		count, err := db.UserAchievementColl.CountDocuments(
			context.Background(), bson.M{"user_id": userID},
		)
		if err != nil {
			return false
		}
		return count >= 20
	}
	return false
}
