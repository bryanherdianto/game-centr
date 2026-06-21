FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o app

FROM alpine:3.20
WORKDIR /app
# Run as a non-root user for security
RUN adduser -D -u 10001 appuser
COPY --from=builder /app/app .
# Env vars (e.g. MONGODB_URI) are injected at runtime via docker-compose env_file / -e.
# The app uses godotenv with fallback to system env, so no .env is baked into the image.
USER appuser
EXPOSE 8080
CMD ["./app"]
