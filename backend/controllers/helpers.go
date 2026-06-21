package controllers

import (
	"context"
	"strconv"

	"netgames-go-server/db"
	"netgames-go-server/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	defaultListLimit = 50
	maxListLimit     = 100

	// Input validation / length limits
	maxScoreTextLen   = 280
	maxCommentTextLen = 500
	maxMetadataBytes  = 4096
)

// parsePagination reads optional `limit` and `skip` query params, clamping them
// to safe values. Invalid values are ignored and the defaults are used.
// Default limit is 50, hard-capped at 100; default skip is 0.
func parsePagination(c *gin.Context) (limit int64, skip int64) {
	limit = defaultListLimit
	skip = 0

	if v := c.Query("limit"); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil && parsed > 0 {
			if parsed > maxListLimit {
				parsed = maxListLimit
			}
			limit = int64(parsed)
		}
	}

	// Support either `skip` directly or `page` (1-based) to compute skip.
	if v := c.Query("skip"); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil && parsed > 0 {
			skip = int64(parsed)
		}
	} else if v := c.Query("page"); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil && parsed > 1 {
			skip = int64(parsed-1) * limit
		}
	}

	return limit, skip
}

// buildUserMap batch-fetches users for the given ids (deduped) and returns a
// map keyed by ObjectID. Missing users are simply absent from the map.
func buildUserMap(ctx context.Context, ids []primitive.ObjectID) (map[primitive.ObjectID]models.User, error) {
	users := make(map[primitive.ObjectID]models.User)
	if len(ids) == 0 {
		return users, nil
	}

	seen := make(map[primitive.ObjectID]struct{}, len(ids))
	deduped := make([]primitive.ObjectID, 0, len(ids))
	for _, id := range ids {
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		deduped = append(deduped, id)
	}

	cursor, err := db.UserColl.Find(ctx, bson.M{"_id": bson.M{"$in": deduped}})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var found []models.User
	if err := cursor.All(ctx, &found); err != nil {
		return nil, err
	}

	for _, u := range found {
		users[u.ID] = u
	}
	return users, nil
}

// buildCommentMap batch-fetches comments for the given ids (deduped) and returns
// a map keyed by ObjectID.
func buildCommentMap(ctx context.Context, ids []primitive.ObjectID) (map[primitive.ObjectID]models.Comment, error) {
	comments := make(map[primitive.ObjectID]models.Comment)
	if len(ids) == 0 {
		return comments, nil
	}

	seen := make(map[primitive.ObjectID]struct{}, len(ids))
	deduped := make([]primitive.ObjectID, 0, len(ids))
	for _, id := range ids {
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		deduped = append(deduped, id)
	}

	cursor, err := db.CommentColl.Find(ctx, bson.M{"_id": bson.M{"$in": deduped}})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var found []models.Comment
	if err := cursor.All(ctx, &found); err != nil {
		return nil, err
	}

	for _, cm := range found {
		comments[cm.ID] = cm
	}
	return comments, nil
}

// populateScores converts a slice of raw Score documents into
// *WithUserDetails response objects using ONE batch query per related
// collection (owners, comments, comment authors) to avoid N+1 lookups.
// Scores whose owner cannot be resolved are skipped, preserving the previous
// per-item "skip if owner not found" behaviour.
func populateScores(ctx context.Context, scores []models.Score) ([]models.ScoreWithUserDetails, error) {
	if len(scores) == 0 {
		return nil, nil
	}

	// Collect owner ids and all comment ids.
	ownerIDs := make([]primitive.ObjectID, 0, len(scores))
	commentIDs := make([]primitive.ObjectID, 0)
	for _, s := range scores {
		ownerIDs = append(ownerIDs, s.Owner)
		commentIDs = append(commentIDs, s.Comments...)
	}

	ownerMap, err := buildUserMap(ctx, ownerIDs)
	if err != nil {
		return nil, err
	}

	commentMap, err := buildCommentMap(ctx, commentIDs)
	if err != nil {
		return nil, err
	}

	// Collect comment author ids from the fetched comments.
	authorIDs := make([]primitive.ObjectID, 0, len(commentMap))
	for _, cm := range commentMap {
		authorIDs = append(authorIDs, cm.Author)
	}

	authorMap, err := buildUserMap(ctx, authorIDs)
	if err != nil {
		return nil, err
	}

	var result []models.ScoreWithUserDetails
	for _, score := range scores {
		owner, ok := ownerMap[score.Owner]
		if !ok {
			continue // Skip if owner not found (matches prior behaviour)
		}

		var commentsWithDetails []models.CommentWithUserDetails
		for _, cid := range score.Comments {
			comment, ok := commentMap[cid]
			if !ok {
				continue
			}
			author, ok := authorMap[comment.Author]
			if !ok {
				continue
			}
			commentsWithDetails = append(commentsWithDetails, models.CommentWithUserDetails{
				ID:        comment.ID,
				Score:     comment.Score,
				Author:    author.ToResponse(),
				Text:      comment.Text,
				CreatedAt: comment.CreatedAt,
				UpdatedAt: comment.UpdatedAt,
			})
		}

		result = append(result, models.ScoreWithUserDetails{
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

	return result, nil
}
