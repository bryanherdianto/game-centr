package middleware

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// tokenTTL is how long an issued JWT remains valid.
const tokenTTL = 7 * 24 * time.Hour

var (
	secretOnce sync.Once
	jwtSecret  []byte
)

// getSecret lazily loads the JWT signing secret from the JWT_SECRET env var. It
// is read lazily (not at package init) so that godotenv.Load() in main() has
// already populated the environment before the first token is signed/verified.
func getSecret() []byte {
	secretOnce.Do(func() {
		s := os.Getenv("JWT_SECRET")
		if s == "" {
			log.Println("WARNING: JWT_SECRET is not set; using an insecure development secret. Set JWT_SECRET in your environment for production.")
			s = "dev-insecure-secret-change-me"
		}
		jwtSecret = []byte(s)
	})
	return jwtSecret
}

type jwtHeader struct {
	Alg string `json:"alg"`
	Typ string `json:"typ"`
}

type jwtClaims struct {
	Sub      string `json:"sub"` // user id (hex)
	Username string `json:"username"`
	Iat      int64  `json:"iat"`
	Exp      int64  `json:"exp"`
}

func b64(b []byte) string {
	return base64.RawURLEncoding.EncodeToString(b)
}

// sign returns the base64url HMAC-SHA256 signature of the signing input.
func sign(signingInput string) string {
	mac := hmac.New(sha256.New, getSecret())
	mac.Write([]byte(signingInput))
	return b64(mac.Sum(nil))
}

// GenerateToken creates a signed HS256 JWT for the given user.
func GenerateToken(userID, username string) (string, error) {
	header := jwtHeader{Alg: "HS256", Typ: "JWT"}
	now := time.Now()
	claims := jwtClaims{
		Sub:      userID,
		Username: username,
		Iat:      now.Unix(),
		Exp:      now.Add(tokenTTL).Unix(),
	}

	headerJSON, err := json.Marshal(header)
	if err != nil {
		return "", err
	}
	claimsJSON, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}

	signingInput := b64(headerJSON) + "." + b64(claimsJSON)
	return signingInput + "." + sign(signingInput), nil
}

// parseToken validates the signature and expiry and returns the claims.
func parseToken(token string) (*jwtClaims, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, errors.New("malformed token")
	}

	signingInput := parts[0] + "." + parts[1]
	expectedSig := sign(signingInput)
	// Constant-time comparison guards against signature timing attacks.
	if !hmac.Equal([]byte(expectedSig), []byte(parts[2])) {
		return nil, errors.New("invalid signature")
	}

	claimsJSON, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, errors.New("malformed claims")
	}
	var claims jwtClaims
	if err := json.Unmarshal(claimsJSON, &claims); err != nil {
		return nil, errors.New("malformed claims")
	}
	if claims.Exp != 0 && time.Now().Unix() > claims.Exp {
		return nil, errors.New("token expired")
	}
	return &claims, nil
}

// AuthRequired is gin middleware that requires a valid Bearer token. It stores
// the authenticated user's id (both as the hex string "userId" and the parsed
// primitive.ObjectID "userObjectID") and "username" in the request context, and
// aborts with 401 when the token is missing, malformed, or expired.
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Unauthorized",
			})
			return
		}

		token := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
		claims, err := parseToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Unauthorized",
			})
			return
		}

		oid, err := primitive.ObjectIDFromHex(claims.Sub)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Unauthorized",
			})
			return
		}

		c.Set("userId", claims.Sub)
		c.Set("userObjectID", oid)
		c.Set("username", claims.Username)
		c.Next()
	}
}

// AuthUserID returns the authenticated user's ObjectID from the request context.
// The boolean is false when no authenticated user is present (i.e. the route was
// not protected by AuthRequired).
func AuthUserID(c *gin.Context) (primitive.ObjectID, bool) {
	v, ok := c.Get("userObjectID")
	if !ok {
		return primitive.NilObjectID, false
	}
	oid, ok := v.(primitive.ObjectID)
	return oid, ok
}
