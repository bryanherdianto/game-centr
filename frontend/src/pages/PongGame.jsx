import React, { useState, useEffect, useRef } from "react";
import "./PongGame.css"; // Import the CSS file for styling
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCookies } from "react-cookie";
import { createScorePost } from "../actions/Score.action";

const PongGame = () => {
	const getInitialBallState = () => ({
		x: 290,
		y: 190,
		speedX: (Math.random() > 0.5 ? 1 : -1) * 5,
		speedY: (Math.random() > 0.5 ? 1 : -1) * 5,
	});

	const [ball, setBall] = useState(getInitialBallState());
	const [gameOver, setGameOver] = useState(false);
	const [gameRunning, setGameRunning] = useState(false);
	const ballRef = useRef(null);
	const leftPaddleRef = useRef(150);
	const rightPaddleRef = useRef(150);
	const [bounces, setBounces] = useState(0);
	const [cookies] = useCookies(["user_id"]);
	const [scorePosted, setScorePosted] = useState(false);

	useEffect(() => {
		if (gameOver && !scorePosted) {
			handleSubmitScore();
		}
		// eslint-disable-next-line
	}, [gameOver]);

	const handleSubmitScore = async () => {
		await createScorePost({
			value: bounces,
			text: `Bounces: ${bounces}`,
			owner: cookies.user_id,
			game: "pong",
		});
		setScorePosted(true);
	};

	useEffect(() => {
		if (gameRunning) {
			const handleKeyPress = (e) => {
				switch (e.key) {
					case "ArrowUp":
						e.preventDefault();
						rightPaddleRef.current = Math.max(rightPaddleRef.current - 10, 0);
						break;
					case "ArrowDown":
						e.preventDefault();
						rightPaddleRef.current = Math.min(rightPaddleRef.current + 10, 300);
						break;
					case "w":
						leftPaddleRef.current = Math.max(leftPaddleRef.current - 10, 0);
						break;
					case "s":
						leftPaddleRef.current = Math.min(leftPaddleRef.current + 10, 300);
						break;
				}
			};

			const updateGame = () => {
				setBall((prevBall) => {
					let newX = prevBall.x + prevBall.speedX;
					let newY = prevBall.y + prevBall.speedY;

					const ballBox = {
						left: newX,
						right: newX + 20,
						top: newY,
						bottom: newY + 20,
					};

					// Get paddle positions from refs
					const paddleLeft = {
						left: 0,
						right: 10,
						top: leftPaddleRef.current,
						bottom: leftPaddleRef.current + 100,
					};
					const paddleRight = {
						left: 590,
						right: 600,
						top: rightPaddleRef.current,
						bottom: rightPaddleRef.current + 100,
					};

					// Paddle collision
					if (
						(ballBox.left <= paddleLeft.right &&
							ballBox.right >= paddleLeft.left &&
							ballBox.top <= paddleLeft.bottom &&
							ballBox.bottom >= paddleLeft.top) ||
						(ballBox.right >= paddleRight.left &&
							ballBox.left <= paddleRight.right &&
							ballBox.top <= paddleRight.bottom &&
							ballBox.bottom >= paddleRight.top)
					) {
						// Increase both X and Y speeds for more challenge
						const speedIncrease = 0.1; // Adjust this value to control difficulty progression

						// Maintain direction but increase speed
						const directionX = prevBall.speedX > 0 ? 1 : -1;
						const directionY = prevBall.speedY > 0 ? 1 : -1;

						const newSpeedX =
							(Math.abs(prevBall.speedX) + speedIncrease) * -directionX; // Reverse X direction
						const newSpeedY =
							(Math.abs(prevBall.speedY) + speedIncrease) * directionY; // Keep Y direction

						prevBall.speedX = newSpeedX;
						prevBall.speedY = newSpeedY;

						newX += prevBall.speedX; // Apply new speed immediately
						setBounces((b) => b + 1);
					}

					// Wall bounce
					if (newY <= -10 || newY >= 390) {
						// Increase both X and Y speeds for more challenge
						const speedIncrease = 0.1; // Adjust this value to control difficulty progression

						// Maintain X direction but increase speed
						const directionX = prevBall.speedX > 0 ? 1 : -1;
						const directionY = prevBall.speedY > 0 ? 1 : -1;

						// Increase X speed slightly
						prevBall.speedX =
							(Math.abs(prevBall.speedX) + speedIncrease) * directionX;

						// Reverse Y direction and increase speed
						prevBall.speedY =
							(Math.abs(prevBall.speedY) + speedIncrease) * -directionY;

						newY += prevBall.speedY; // Apply new speed immediately
					}

					// Game over
					if (newX < 0 || newX > 600) {
						setGameOver(true);
						pauseGame();
					}

					return { ...prevBall, x: newX, y: newY };
				});
			};

			const intervalId = setInterval(updateGame, 50);
			window.addEventListener("keydown", handleKeyPress);

			return () => {
				clearInterval(intervalId);
				window.removeEventListener("keydown", handleKeyPress);
			};
		}
	}, [gameRunning]);

	useEffect(() => {
		if (gameOver) {
			setBounces(0);
		}
	}, [gameOver]);

	const startGame = () => {
		setGameRunning(true);
	};

	const restartGame = () => {
		setBall(getInitialBallState());
		leftPaddleRef.current = 150;
		rightPaddleRef.current = 150;
		setGameOver(false);
		setGameRunning(false);
	};

	const pauseGame = () => {
		setGameRunning(false);
	};

	return (
		<>
			<Navbar />
			<div className="min-h-screen bg-background flex flex-col items-center py-16 px-4">
				<h1 className="text-3xl font-serif text-ink mb-3">Pong</h1>
				<p className="text-text-secondary text-center max-w-md mb-2">
					Left paddle: Click "W" to move up and "S" to move down. Right paddle:
					Click "Up Arrow" to move up and "Down Arrow" to move down. Keep the
					ball in play!
				</p>
				<div className="controls">
					<button onClick={startGame}>Start</button>
					<button onClick={restartGame}>Restart</button>
					<button onClick={pauseGame}>Pause</button>
				</div>
				<div className="ping-pong-container" tabIndex="0">
					<div
						className={`paddle paddle-left ${gameRunning ? "" : "paused"}`}
						id="paddle-left"
						style={{ top: `${leftPaddleRef.current}px` }}
					/>
					<div
						className={`paddle paddle-right ${gameRunning ? "" : "paused"}`}
						id="paddle-right"
						style={{ top: `${rightPaddleRef.current}px` }}
					/>
					<div
						className={`ball ${gameRunning ? "" : "paused"}`}
						ref={ballRef}
						style={{ top: `${ball.y}px`, left: `${ball.x}px` }}
					/>
					{gameOver && <div className="game-over">Game Over</div>}
				</div>
			</div>
			<Footer />
		</>
	);
};

export default PongGame;
