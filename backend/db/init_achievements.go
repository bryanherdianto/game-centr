package db

import (
	"context"
	"log"
	"netgames-go-server/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// InitAchievements initializes the achievements collection with predefined achievements
func InitAchievements(client *mongo.Client, dbName string) error {
	collection := client.Database(dbName).Collection("achievements")

	// Create indexes
	indexModels := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "game_code", Value: 1}, {Key: "code", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
	}

	_, err := collection.Indexes().CreateMany(context.Background(), indexModels)
	if err != nil {
		log.Printf("Error creating indexes on achievements: %v", err)
		return err
	}

	// Define achievements for each game
	achievements := []models.Achievement{
		// Color Guess Achievements
		{
			GameCode:    "colorguess",
			Code:        "sharp_eyes",
			Title:       "Sharp Eyes",
			Description: "Get all 20 questions correct without any mistakes",
			Icon:        "👁️",
			Difficulty:  "hard",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "colorguess",
			Code:        "quick_colors",
			Title:       "Quick Colors",
			Description: "Complete the game in under 30 seconds",
			Icon:        "⏱️",
			Difficulty:  "medium",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "colorguess",
			Code:        "color_novice",
			Title:       "Color Novice",
			Description: "Complete your first Color Guess game",
			Icon:        "🎨",
			Difficulty:  "easy",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "colorguess",
			Code:        "rainbow_master",
			Title:       "Rainbow Master",
			Description: "Play Color Guess 50 times",
			Icon:        "🌈",
			Difficulty:  "medium",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},

		// Number Guess Achievements
		{
			GameCode:    "guess",
			Code:        "lucky_guess",
			Title:       "Lucky Guess",
			Description: "Guess the correct number on your first try",
			Icon:        "🍀",
			Difficulty:  "hard",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "guess",
			Code:        "close_call",
			Title:       "Close Call",
			Description: "Guess within 2 of the correct number",
			Icon:        "🎯",
			Difficulty:  "medium",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "guess",
			Code:        "persistence",
			Title:       "Persistence",
			Description: "Make 10 guesses in a single game",
			Icon:        "🔄",
			Difficulty:  "easy",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "guess",
			Code:        "binary_search",
			Title:       "Binary Search",
			Description: "Find the number in 7 or fewer guesses",
			Icon:        "🔍",
			Difficulty:  "medium",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},

		// Hangman Achievements
		{
			GameCode:    "hangman",
			Code:        "word_wizard",
			Title:       "Word Wizard",
			Description: "Solve a hangman puzzle with no incorrect guesses",
			Icon:        "🧙",
			Difficulty:  "hard",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "hangman",
			Code:        "last_chance",
			Title:       "Last Chance",
			Description: "Solve the puzzle with only one guess remaining",
			Icon:        "😅",
			Difficulty:  "medium",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "hangman",
			Code:        "vowel_master",
			Title:       "Vowel Master",
			Description: "Correctly guess all vowels in a puzzle",
			Icon:        "🅰️",
			Difficulty:  "easy",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "hangman",
			Code:        "hangman_savior",
			Title:       "Hangman Savior",
			Description: "Win 10 games of Hangman",
			Icon:        "🦸",
			Difficulty:  "medium",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},

		// Memory Match Achievements
		{
			GameCode:    "memorymatch",
			Code:        "photographic_memory",
			Title:       "Photographic Memory",
			Description: "Complete the game with no incorrect matches",
			Icon:        "📸",
			Difficulty:  "hard",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "memorymatch",
			Code:        "speed_matcher",
			Title:       "Speed Matcher",
			Description: "Complete the game in under 30 seconds",
			Icon:        "⚡",
			Difficulty:  "medium",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "memorymatch",
			Code:        "memory_novice",
			Title:       "Memory Novice",
			Description: "Complete your first Memory Match game",
			Icon:        "🧠",
			Difficulty:  "easy",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "memorymatch",
			Code:        "memory_streak",
			Title:       "Memory Streak",
			Description: "Find 5 matches in a row without mistakes",
			Icon:        "🔥",
			Difficulty:  "medium",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},

		// Pattern Repeater Achievements
		{
			GameCode:    "patternrepeater",
			Code:        "pattern_master",
			Title:       "Pattern Master",
			Description: "Reach level 20 in Pattern Repeater",
			Icon:        "🧩",
			Difficulty:  "hard",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "patternrepeater",
			Code:        "rhythm_king",
			Title:       "Rhythm King",
			Description: "Complete a pattern with perfect timing",
			Icon:        "🎵",
			Difficulty:  "medium",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "patternrepeater",
			Code:        "pattern_novice",
			Title:       "Pattern Novice",
			Description: "Reach level 5 in Pattern Repeater",
			Icon:        "🔄",
			Difficulty:  "easy",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "patternrepeater",
			Code:        "pattern_addict",
			Title:       "Pattern Addict",
			Description: "Play Pattern Repeater 20 times",
			Icon:        "🎮",
			Difficulty:  "medium",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},

		// Pong Achievements
		{
			GameCode:    "pong",
			Code:        "pong_champion",
			Title:       "Pong Champion",
			Description: "Score 50 points in a single game",
			Icon:        "🏆",
			Difficulty:  "hard",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "pong",
			Code:        "pong_rally",
			Title:       "Pong Rally",
			Description: "Keep a rally going for 20 consecutive hits",
			Icon:        "🏓",
			Difficulty:  "medium",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "pong",
			Code:        "pong_novice",
			Title:       "Pong Novice",
			Description: "Score your first point in Pong",
			Icon:        "🎮",
			Difficulty:  "easy",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "pong",
			Code:        "pong_comeback",
			Title:       "Comeback King",
			Description: "Win after being down by 5 points",
			Icon:        "🔄",
			Difficulty:  "hard",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},

		// Quick Math Achievements
		{
			GameCode:    "quickmath",
			Code:        "math_genius",
			Title:       "Math Genius",
			Description: "Answer 15 questions correctly in a row",
			Icon:        "🧮",
			Difficulty:  "hard",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "quickmath",
			Code:        "speed_calculator",
			Title:       "Speed Calculator",
			Description: "Answer 10 questions in under 20 seconds",
			Icon:        "⏱️",
			Difficulty:  "medium",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "quickmath",
			Code:        "math_novice",
			Title:       "Math Novice",
			Description: "Complete your first Quick Math game",
			Icon:        "🔢",
			Difficulty:  "easy",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "quickmath",
			Code:        "math_addict",
			Title:       "Math Addict",
			Description: "Play Quick Math 30 times",
			Icon:        "📊",
			Difficulty:  "medium",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},

		// Simon Says Achievements
		{
			GameCode:    "simonsays",
			Code:        "simon_master",
			Title:       "Simon Master",
			Description: "Reach level 15 in Simon Says",
			Icon:        "🎯",
			Difficulty:  "hard",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "simonsays",
			Code:        "simon_streak",
			Title:       "Simon Streak",
			Description: "Complete 5 games of Simon Says in a row",
			Icon:        "🔥",
			Difficulty:  "medium",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "simonsays",
			Code:        "simon_novice",
			Title:       "Simon Novice",
			Description: "Reach level 5 in Simon Says",
			Icon:        "🎮",
			Difficulty:  "easy",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "simonsays",
			Code:        "simon_says_dance",
			Title:       "Simon Says Dance",
			Description: "Complete a level with perfect timing",
			Icon:        "💃",
			Difficulty:  "medium",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},

		// Typing Game Achievements
		{
			GameCode:    "typing",
			Code:        "typing_master",
			Title:       "Typing Master",
			Description: "Type at a speed of 80 WPM or higher",
			Icon:        "⌨️",
			Difficulty:  "hard",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "typing",
			Code:        "perfect_typist",
			Title:       "Perfect Typist",
			Description: "Complete a sentence with no errors",
			Icon:        "✅",
			Difficulty:  "medium",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "typing",
			Code:        "typing_novice",
			Title:       "Typing Novice",
			Description: "Complete your first Typing game",
			Icon:        "📝",
			Difficulty:  "easy",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "typing",
			Code:        "typing_marathon",
			Title:       "Typing Marathon",
			Description: "Type 1000 words across all games",
			Icon:        "🏃",
			Difficulty:  "medium",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},

		// Whack-a-Mole Achievements
		{
			GameCode:    "whackamole",
			Code:        "mole_hunter",
			Title:       "Mole Hunter",
			Description: "Whack 50 moles in a single game",
			Icon:        "🔨",
			Difficulty:  "hard",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "whackamole",
			Code:        "quick_reflexes",
			Title:       "Quick Reflexes",
			Description: "Whack 10 moles in a row without missing",
			Icon:        "⚡",
			Difficulty:  "medium",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "whackamole",
			Code:        "mole_novice",
			Title:       "Mole Novice",
			Description: "Whack your first mole",
			Icon:        "🐹",
			Difficulty:  "easy",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "whackamole",
			Code:        "mole_frenzy",
			Title:       "Mole Frenzy",
			Description: "Whack 5 moles in 3 seconds",
			Icon:        "🌪️",
			Difficulty:  "medium",
			IsHidden:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},

		// Easter Egg Achievements
		{
			GameCode:    "all",
			Code:        "night_owl",
			Title:       "Night Owl",
			Description: "Play a game between 12 AM and 4 AM",
			Icon:        "🦉",
			Difficulty:  "medium",
			IsHidden:    true,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "all",
			Code:        "game_hopper",
			Title:       "Game Hopper",
			Description: "Play all 10 games in a single day",
			Icon:        "🦘",
			Difficulty:  "hard",
			IsHidden:    true,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			GameCode:    "all",
			Code:        "achievement_hunter",
			Title:       "Achievement Hunter",
			Description: "Earn 20 achievements",
			Icon:        "🏅",
			Difficulty:  "hard",
			IsHidden:    true,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
	}

	// Skip re-seeding if the collection is already fully populated. The unique
	// index above is always (re)created since it is idempotent.
	count, err := collection.CountDocuments(context.Background(), bson.M{})
	if err != nil {
		log.Printf("Error counting achievements: %v", err)
		return err
	}
	if count >= int64(len(achievements)) {
		log.Println("Achievements already seeded, skipping upserts")
		return nil
	}

	// Insert achievements using upsert to avoid duplicates
	for _, achievement := range achievements {
		filter := bson.M{"game_code": achievement.GameCode, "code": achievement.Code}
		update := bson.M{"$set": achievement}
		opts := options.Update().SetUpsert(true)

		_, err := collection.UpdateOne(context.Background(), filter, update, opts)
		if err != nil {
			log.Printf("Error upserting achievement %s: %v", achievement.Code, err)
			return err
		}
	}

	log.Println("Achievements initialized successfully")
	return nil
}

// InitAchievementIndexes creates indexes for the user_achievements collection
func InitAchievementIndexes(client *mongo.Client, dbName string) error {
	collection := client.Database(dbName).Collection("user_achievements")

	// Create indexes
	indexes := []mongo.IndexModel{
		{
			Keys: bson.D{{Key: "user_id", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "achievement_id", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "game_code", Value: 1}},
		},
		{
			Keys: bson.D{
				{Key: "user_id", Value: 1},
				{Key: "achievement_id", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
	}

	_, err := collection.Indexes().CreateMany(context.Background(), indexes)
	if err != nil {
		log.Printf("Error creating indexes on user_achievements: %v", err)
		return err
	}

	log.Println("User achievement indexes created successfully")
	return nil
}
