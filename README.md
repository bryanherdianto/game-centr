# GameCentr

![banner github](https://i.imgur.com/saEznWQ.png)

## About GameCentr

GameCentr is your ultimate destination for fun and excitement. Designed to be user-friendly and easy to navigate, this game center offers a variety of games to challenge your skills and keep you entertained. As a player, you can enjoy:

🎯 **Random Number Guesser** – Test your luck and intuition.  
🏓 **Pong Game** – A classic arcade challenge.  
🔤 **Hangman Game** – Guess the word before it’s too late!  
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
![Alibaba Cloud](https://img.shields.io/badge/Alibaba%20Cloud-FF6A00?style=for-the-badge&logo=alibabacloud&logoColor=white)
![Golang](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

## Local Architecture

![local drawio](https://i.imgur.com/rJEJWUC.png)

## Remote Architecture

![remote drawio](https://i.imgur.com/oEZ8Aud.png)

## Docker Architecture

![docker drawio](https://i.imgur.com/IHAAXuK.png)

## Setup Instructions

Before you start, ensure you prepare a .env file in the root directory of the project with the following content:

```env
MONGODB_URI={your_mongodb_uri}
PORT=8080
```

This project is built using Docker, so you need to have Docker installed on your machine. Follow these steps to set up the project:

```bash
git clone https://github.com/bryanherdianto/GameCentr.git
cd GameCentr
docker-compose up -d --build
```

## Referensi

- GeeksforGeeks, “Design a typing speed test game using JavaScript,” GeeksforGeeks, Jul. 29, 2024. <https://www.geeksforgeeks.org/design-a-typing-speed-test-game-using-javascript/>
- GeeksforGeeks, “Ping Pong Game using React,” GeeksforGeeks, Jul. 23, 2024. <https://www.geeksforgeeks.org/ping-pong-game-using-react/>
- GeeksforGeeks, “Hangman game using React,” GeeksforGeeks, Jul. 25, 2024. <https://www.geeksforgeeks.org/hangman-game-using-react/>
- GeeksforGeeks, “Architecture of Docker,” GeeksforGeeks, Jan. 04, 2025. <https://www.geeksforgeeks.org/architecture-of-docker/>
- M. D. Team, “Go Driver Quick start,” Go Driver v2.2 - MongoDB Docs. <https://www.mongodb.com/docs/drivers/go/current/quick-start/>
