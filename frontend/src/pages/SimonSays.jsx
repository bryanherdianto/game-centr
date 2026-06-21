import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCookies } from "react-cookie";
import { createScorePost } from "../actions/Score.action";
import { useAchievements } from "../context/AchievementContext";

const COLORS = ["red", "green", "blue", "yellow"];

function getRandomColor() {
	return COLORS[Math.floor(Math.random() * COLORS.length)];
}

const SimonSays = () => {
	const { checkAchievements } = useAchievements();
	const [sequence, setSequence] = useState([]);
	const [userInput, setUserInput] = useState([]);
	const [round, setRound] = useState(1);
	const [isUserTurn, setIsUserTurn] = useState(false);
	const [message, setMessage] = useState("");
	const [activeColor, setActiveColor] = useState(null);
	const [gameOver, setGameOver] = useState(false);
	const [cooldown, setCooldown] = useState(false);
	const [cookies] = useCookies(["user_id"]);
	const [scorePosted, setScorePosted] = useState(false);
	const [scoreMessage, setScoreMessage] = useState("");
	const timeoutsRef = useRef([]);

	const trackTimeout = (cb, delay) => {
		const id = setTimeout(cb, delay);
		timeoutsRef.current.push(id);
		return id;
	};

	// Clear any pending timeouts on unmount.
	useEffect(() => {
		return () => {
			timeoutsRef.current.forEach((t) => clearTimeout(t));
			timeoutsRef.current = [];
		};
	}, []);

	useEffect(() => {
		if (gameOver && !scorePosted) {
			handleSubmitScore();
			checkAchievements("simonsays", {
				level: round,
				streak: round - 1,
				perfectTiming: false,
			});
		}
		// eslint-disable-next-line
	}, [gameOver]);

	const handleSubmitScore = async () => {
		const result = await createScorePost({
			value: round,
			text: `Round: ${round}`,
			owner: cookies.user_id,
			game: "simonsays",
		});
		setScorePosted(true);
		setScoreMessage(
			result && result.success
				? "Score posted!"
				: "Could not post score. Please try again.",
		);
	};

	useEffect(() => {
		if (!gameOver) startNewRound();
		// eslint-disable-next-line
	}, []);

	const startNewRound = () => {
		setMessage("Watch the pattern!");
		setUserInput([]);
		setIsUserTurn(false);
		setSequence((prev) => {
			const newSequence = [...prev, getRandomColor()];
			trackTimeout(() => {
				playSequence(newSequence);
			}, 800);
			return newSequence;
		});
	};

	const playSequence = async (seq) => {
		for (let i = 0; i < seq.length; i++) {
			setActiveColor(seq[i]);
			await new Promise((res) => setTimeout(res, 600));
			setActiveColor(null);
			await new Promise((res) => setTimeout(res, 200));
		}
		setMessage("Your turn!");
		setIsUserTurn(true);
	};

	const handleColorClick = (color) => {
		if (!isUserTurn || gameOver || cooldown) return;
		setCooldown(true);
		trackTimeout(() => setCooldown(false), 400);
		const newInput = [...userInput, color];
		setUserInput(newInput);
		setActiveColor(color);
		trackTimeout(() => setActiveColor(null), 200);
		if (sequence[newInput.length - 1] !== color) {
			setMessage("Wrong! Game Over.");
			setGameOver(true);
			setIsUserTurn(false);
			return;
		}
		if (newInput.length === sequence.length) {
			setMessage("Correct! Next round...");
			setIsUserTurn(false);
			trackTimeout(() => {
				setRound((r) => r + 1);
				startNewRound();
			}, 1000);
		}
	};

	const handleRestart = () => {
		setSequence([]);
		setUserInput([]);
		setRound(1);
		setIsUserTurn(false);
		setMessage("");
		setActiveColor(null);
		setGameOver(false);
		setScorePosted(false);
		setScoreMessage("");
		trackTimeout(() => {
			setSequence([]); // ensure sequence is cleared before new round
			startNewRound();
		}, 500);
	};

	return (
		<>
			<Navbar />
			<div className="min-h-[640px] flex flex-col items-center justify-center bg-background py-16 px-4">
				<div className="max-w-md w-full bg-background border border-border-subtle p-9 flex flex-col items-center">
					<h1 className="text-3xl font-serif text-ink mb-3">Simon Says</h1>
					<p className="mb-3 text-text-secondary text-center">
						Pattern memory game. Repeat the sequence!
					</p>
					<div className="mb-4 text-xl font-mono text-ink">Round: {round}</div>
					<div className="mb-6 text-center text-text-secondary min-h-[2em]">
						{message}
					</div>
					<div className="grid grid-cols-2 gap-4 mb-6">
						{COLORS.map((color) => (
							<button
								key={color}
								className={`w-24 h-24 border border-border-medium focus:outline-none transition-all duration-150 ${
									color === "red"
										? "bg-red-500"
										: color === "green"
											? "bg-green-500"
											: color === "blue"
												? "bg-blue-500"
												: "bg-yellow-400"
								} ${activeColor === color ? "ring-4 ring-ink scale-110" : ""}`}
								onClick={() => handleColorClick(color)}
								disabled={!isUserTurn || gameOver}
								aria-label={color}
							/>
						))}
					</div>
					{gameOver && (
						<>
							<div className="text-error font-semibold mb-4">
								Game Over! You reached round {round}.
							</div>
							{scoreMessage && (
								<div className="text-[15px] font-semibold text-text-secondary mb-4">
									{scoreMessage}
								</div>
							)}
							<button
								onClick={handleRestart}
								className="bg-primary text-background px-6 py-3 font-semibold text-[15px] border border-primary hover:bg-primary-hover active:bg-primary-active"
							>
								Restart
							</button>
						</>
					)}
				</div>
			</div>
			<Footer />
		</>
	);
};

export default SimonSays;
