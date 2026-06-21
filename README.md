# GameCentr

![banner github](https://i.imgur.com/saEznWQ.png)

## About GameCentr

GameCentr is your ultimate destination for fun and excitement. Designed to be user-friendly and easy to navigate, this game center offers a variety of games to challenge your skills and keep you entertained. As a player, you can enjoy:

🎯 **Random Number Guesser** – Test your luck and intuition.  
🏓 **Pong Game** – A classic arcade challenge.  
🔤 **Hangman Game** – Guess the word before it's too late!  
⌨️ **Typing Game** – Improve your speed and accuracy.  
🟢 **Simon Says Game** – Follow the pattern and stay sharp.  
🎨 **Color Guesser Game** – Can you name that color?  
🔨 **Whack a Mole Game** – Quick reflexes win here.  
🧠 **Memory Match** – Flip and match pairs to win.  
🔁 **Pattern Repeater** – Remember and repeat sequences.  
➕ **Quick Math Challenge** – Solve math problems under pressure.

Whether you're here for a quick break or a longer gaming session, GameCentr has something for everyone!

## Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GCP](https://img.shields.io/badge/Google%20Cloud-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)
![Golang](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

## Local Architecture

![local drawio](https://i.imgur.com/rJEJWUC.png)

## Remote Architecture

![remote drawio](https://i.imgur.com/oEZ8Aud.png)

## Docker Architecture

![docker drawio](https://i.imgur.com/IHAAXuK.png)

## Local Setup Instructions

In order to run the project locally, you need to have Node.js, npm, and Go installed on your machine.

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

**Backend:**

```bash
cd backend
go run main.go
```

The backend requires a `.env` file in `backend/`:

```env
MONGODB_URI=<your_mongodb_connection_string>
PORT=8080
JWT_SECRET=<strong_random_secret>
```

## Docker Setup Instructions

Create a `.env` file in `backend/` with the following content:

```env
MONGODB_URI=<your_mongodb_connection_string>
PORT=8080
JWT_SECRET=<strong_random_secret>
```

Then build and start both services:

```bash
git clone https://github.com/bryanherdianto/GameCentr.git
cd GameCentr
docker-compose up -d --build
```

Frontend will be available at `http://localhost:3000`, backend at `http://localhost:8080`.

## Remote Deployment Instructions (GCP Cloud Run)

### Prerequisites

Install the [gcloud CLI](https://cloud.google.com/sdk/docs/install), then authenticate:

```bash
gcloud auth login
gcloud auth configure-docker asia-southeast1-docker.pkg.dev
```

### 1. Set your project

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com artifactregistry.googleapis.com
```

### 2. Create an Artifact Registry repository

```bash
gcloud artifacts repositories create game-centr \
  --repository-format=docker \
  --location=asia-southeast1 \
  --description="GameCentr backend"
```

### 3. Build and push the image

```bash
# Run from backend/
docker build -t asia-southeast1-docker.pkg.dev/YOUR_PROJECT_ID/game-centr/backend:latest .
docker push asia-southeast1-docker.pkg.dev/YOUR_PROJECT_ID/game-centr/backend:latest
```

### 4. Deploy to Cloud Run

```bash
gcloud run deploy game-centr-backend \
  --image=asia-southeast1-docker.pkg.dev/YOUR_PROJECT_ID/game-centr/backend:latest \
  --platform=managed \
  --region=asia-southeast1 \
  --port=8080 \
  --allow-unauthenticated \
  --set-env-vars="MONGODB_URI=your_mongo_uri,JWT_SECRET=your_secret"
```

> **Note:** Do not include `PORT` in `--set-env-vars` — Cloud Run injects it automatically.

After deploy, Cloud Run gives you a URL like:
`https://game-centr-backend-xxxxxxxxx-as.a.run.app`

### 5. Allow Cloud Run to reach MongoDB Atlas

Cloud Run has no fixed IPs. In MongoDB Atlas, go to **Network Access → Add IP Address → Allow Access from Anywhere** (`0.0.0.0/0`).

### 6. Update the frontend

In `frontend/src/actions/config.js`, update the production URL:

```js
const backend_URI =
	window.location.hostname === "localhost"
		? "http://localhost:8080"
		: "https://game-centr-backend-xxxxxxxxx-as.a.run.app"; // your Cloud Run URL
```

Also update the CORS allowlist in `backend/main.go` if your frontend origin changed.

## References

- GeeksforGeeks, "Design a typing speed test game using JavaScript," GeeksforGeeks, Jul. 29, 2024. <https://www.geeksforgeeks.org/design-a-typing-speed-test-game-using-javascript/>
- GeeksforGeeks, "Ping Pong Game using React," GeeksforGeeks, Jul. 23, 2024. <https://www.geeksforgeeks.org/ping-pong-game-using-react/>
- GeeksforGeeks, "Hangman game using React," GeeksforGeeks, Jul. 25, 2024. <https://www.geeksforgeeks.org/hangman-game-using-react/>
- GeeksforGeeks, "Architecture of Docker," GeeksforGeeks, Jan. 04, 2025. <https://www.geeksforgeeks.org/architecture-of-docker/>
- M. D. Team, "Go Driver Quick start," Go Driver v2.2 - MongoDB Docs. <https://www.mongodb.com/docs/drivers/go/current/quick-start/>
