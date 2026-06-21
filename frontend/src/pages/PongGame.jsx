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
	// Paddle positions live in state so they render reliably; refs mirror them
	// for the animation loop to read without stale closures.
	const [leftPaddle, setLeftPaddle] = useState(150);
	const [rightPaddle, setRightPaddle] = useState(150);
	const leftPaddleRef = useRef(150);
	const rightPaddleRef = useRef(150);
	const [bounces, setBounces] = useState(0);
	// Responsive scaling: the game canvas stays 600×400 internally; a CSS
	// transform scales it down to fit narrower viewports (e.g. mobile).
	const [scale, setScale] = useState(1);
	const wrapperRef = useRef(null);
	const containerRef = useRef(null);
	// Maps each active touch identifier → which paddle side it controls.
	const touchSideRef = useRef({});
	const [cookies] = useCookies(["user_id"]);
	const [scorePosted, setScorePosted] = useState(false);
	const [scoreMessage, setScoreMessage] = useState("");

	useEffect(() => {
		if (gameOver && !scorePosted) {
			handleSubmitScore();
		}
		// eslint-disable-next-line
	}, [gameOver]);

	const handleSubmitScore = async () => {
		const result = await createScorePost({
			value: bounces,
			text: `Bounces: ${bounces}`,
			owner: cookies.user_id,
			game: "pong",
		});
		setScorePosted(true);
		setScoreMessage(
			result && result.success
				? "Score posted!"
				: "Could not post score. Please try again.",
		);
	};

	useEffect(() => {
		if (gameRunning) {
			const handleKeyPress = (e) => {
				switch (e.key) {
					case "ArrowUp":
						e.preventDefault();
						rightPaddleRef.current = Math.max(rightPaddleRef.current - 10, 0);
						setRightPaddle(rightPaddleRef.current);
						break;
					case "ArrowDown":
						e.preventDefault();
						rightPaddleRef.current = Math.min(rightPaddleRef.current + 10, 300);
						setRightPaddle(rightPaddleRef.current);
						break;
					case "w":
						leftPaddleRef.current = Math.max(leftPaddleRef.current - 10, 0);
						setLeftPaddle(leftPaddleRef.current);
						break;
					case "s":
						leftPaddleRef.current = Math.min(leftPaddleRef.current + 10, 300);
						setLeftPaddle(leftPaddleRef.current);
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

			// Drive the loop with requestAnimationFrame but keep the original
			// ~50ms tick cadence via a time accumulator so game speed/logic
			// is unchanged.
			const TICK_MS = 50;
			let rafId;
			let lastTime = performance.now();
			let accumulator = 0;

			const loop = (now) => {
				accumulator += now - lastTime;
				lastTime = now;
				while (accumulator >= TICK_MS) {
					updateGame();
					accumulator -= TICK_MS;
				}
				rafId = requestAnimationFrame(loop);
			};

			rafId = requestAnimationFrame(loop);
			window.addEventListener("keydown", handleKeyPress);

			return () => {
				cancelAnimationFrame(rafId);
				window.removeEventListener("keydown", handleKeyPress);
			};
		}
	}, [gameRunning]);

	useEffect(() => {
		if (gameOver) {
			setBounces(0);
		}
	}, [gameOver]);

	// Scale the 600×400 canvas to fit the wrapper width on small screens.
	useEffect(() => {
		const el = wrapperRef.current;
		if (!el) return;
		const ro = new ResizeObserver(([entry]) => {
			setScale(Math.min(1, entry.contentRect.width / 600));
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	// Touch drag controls: left half of canvas → left paddle, right half → right paddle.
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const updatePaddleFromTouch = (touch, rect, side) => {
			const relY = (touch.clientY - rect.top) / scale;
			const paddleY = Math.max(0, Math.min(300, relY - 50));
			if (side === "left") {
				leftPaddleRef.current = paddleY;
				setLeftPaddle(paddleY);
			} else {
				rightPaddleRef.current = paddleY;
				setRightPaddle(paddleY);
			}
		};

		const handleTouchStart = (e) => {
			if (!gameRunning) return;
			const rect = el.getBoundingClientRect();
			Array.from(e.changedTouches).forEach((t) => {
				const side = (t.clientX - rect.left) / scale < 300 ? "left" : "right";
				touchSideRef.current[t.identifier] = side;
				updatePaddleFromTouch(t, rect, side);
			});
			e.preventDefault();
		};

		const handleTouchMove = (e) => {
			if (!gameRunning) return;
			const rect = el.getBoundingClientRect();
			Array.from(e.changedTouches).forEach((t) => {
				const side = touchSideRef.current[t.identifier];
				if (side) updatePaddleFromTouch(t, rect, side);
			});
			e.preventDefault();
		};

		const handleTouchEnd = (e) => {
			Array.from(e.changedTouches).forEach((t) => {
				delete touchSideRef.current[t.identifier];
			});
		};

		el.addEventListener("touchstart", handleTouchStart, { passive: false });
		el.addEventListener("touchmove", handleTouchMove, { passive: false });
		el.addEventListener("touchend", handleTouchEnd);

		return () => {
			el.removeEventListener("touchstart", handleTouchStart);
			el.removeEventListener("touchmove", handleTouchMove);
			el.removeEventListener("touchend", handleTouchEnd);
		};
	}, [gameRunning, scale]);

	const startGame = () => {
		setGameRunning(true);
	};

	const restartGame = () => {
		setBall(getInitialBallState());
		leftPaddleRef.current = 150;
		rightPaddleRef.current = 150;
		setLeftPaddle(150);
		setRightPaddle(150);
		setGameOver(false);
		setGameRunning(false);
		setScorePosted(false);
		setScoreMessage("");
	};

	const pauseGame = () => {
		setGameRunning(false);
	};

	return (
		<>
			<Navbar />
			<div className="min-h-[640px] bg-background flex flex-col items-center py-16 px-4">
				<h1 className="text-3xl font-serif text-ink mb-3">Pong</h1>
				<p className="text-text-secondary text-center max-w-md mb-2">
					Left paddle: W / S keys or touch left side. Right paddle: ↑ / ↓ keys
					or touch right side. Keep the ball in play!
				</p>
				<div className="controls">
					<button onClick={startGame}>Start</button>
					<button onClick={restartGame}>Restart</button>
					<button onClick={pauseGame}>Pause</button>
				</div>
				{/* Sizing wrapper reserves the scaled height so the page doesn't collapse */}
				<div
					ref={wrapperRef}
					className="w-full max-w-[600px]"
					style={{ height: `${400 * scale}px` }}
				>
					<div
						ref={containerRef}
						className="ping-pong-container"
						tabIndex="0"
						style={{
							transform: `scale(${scale})`,
							transformOrigin: "top left",
						}}
					>
						<div
							className={`paddle paddle-left ${gameRunning ? "" : "paused"}`}
							id="paddle-left"
							style={{ top: `${leftPaddle}px` }}
						/>
						<div
							className={`paddle paddle-right ${gameRunning ? "" : "paused"}`}
							id="paddle-right"
							style={{ top: `${rightPaddle}px` }}
						/>
						<div
							className={`ball ${gameRunning ? "" : "paused"}`}
							ref={ballRef}
							style={{ top: `${ball.y}px`, left: `${ball.x}px` }}
						/>
						{gameOver && <div className="game-over">Game Over</div>}
					</div>
				</div>
				{gameOver && scoreMessage && (
					<div className="mt-4 text-[15px] font-semibold text-text-secondary">
						{scoreMessage}
					</div>
				)}
			</div>
			<Footer />
		</>
	);
};

export default PongGame;
