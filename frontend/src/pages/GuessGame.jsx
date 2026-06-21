import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { createScorePost } from "../actions/Score.action";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAchievements } from "../context/AchievementContext";

export default function GuessGame() {
	const inputRef = useRef(null);
	const guessRef = useRef(null);
	const chancesRef = useRef(null);
	const scoreRef = useRef(null);
	const [randomNum, setRandomNum] = useState(Math.floor(Math.random() * 100));
	const [chance, setChance] = useState(10);
	const [disabled, setDisabled] = useState(false);
	const [buttonText, setButtonText] = useState("Check");
	const [cookies, setCookies] = useCookies(["score", "user_id"]);
	const [score, setScore] = useState(0);
	const [post, setPost] = useState(false);
	const [scoreText, setScoreText] = useState("");
	const [guessCount, setGuessCount] = useState(0);
	const [gameStats, setGameStats] = useState({
		gamesPlayed: 0,
		gamesWon: 0,
		totalGuesses: 0,
		bestGuessCount: Infinity,
	});
	const navigate = useNavigate();
	const { checkAchievements } = useAchievements();
	const cookieOptions = {
		path: "/",
		sameSite: "strict",
		secure: window.location.protocol === "https:",
	};

	useEffect(() => {
		inputRef.current.focus(); // Focus input on mount

		if (!cookies.score) {
			// initialize score
			setCookies("score", 0, cookieOptions);
			setScore(0);
		} else {
			setScore(Number(cookies.score));
		}
	}, []);

	useEffect(() => {
		if (scoreRef.current) {
			// update score
			scoreRef.current.textContent = `Current Score = ${score}`;
		}
	}, [score]);

	// Function to reset the game
	const resetGame = () => {
		setRandomNum(Math.floor(Math.random() * 100));
		setChance(10);
		inputRef.current.disabled = false;
		chancesRef.current.textContent = 10;
		guessRef.current.textContent = "";
		guessRef.current.style.color = "#57534e";
		inputRef.current.value = "";
		setButtonText("Check");
		setDisabled(false);
		setPost(false);
	};

	const handleCheck = () => {
		if (disabled) {
			// Reset game stats for a new game
			setGuessCount(0);
			setGameStats((prev) => ({
				...prev,
				gamesPlayed: prev.gamesPlayed + 1,
			}));
			resetGame();
			return;
		}

		let newChance;
		const inputValue = Number(inputRef.current.value);
		setPost(false);

		// Increment guess count for valid guesses
		if (inputValue > 0 && inputValue <= 100) {
			setGuessCount((prev) => prev + 1);
		}

		if (inputValue === randomNum) {
			// Player won the game
			const currentGuessCount = guessCount + 1;
			const newGameStats = {
				gamesPlayed: gameStats.gamesPlayed + 1,
				gamesWon: gameStats.gamesWon + 1,
				totalGuesses: gameStats.totalGuesses + currentGuessCount,
				bestGuessCount: Math.min(gameStats.bestGuessCount, currentGuessCount),
			};

			setGameStats(newGameStats);
			guessRef.current.textContent = "Congrats! You found the number.";
			guessRef.current.style.color = "#65a30d";
			setScore(score + 1);
			setCookies("score", score, cookieOptions);
			setButtonText("Replay");
			setDisabled(true);
			newChance = chance;
			inputRef.current.disabled = true;
			setPost(true);

			// Check for achievements
			checkAchievements("guess", {
				guessCount: currentGuessCount,
				correct: true,
				distance: 0,
				target: randomNum,
				gamesPlayed: newGameStats.gamesPlayed,
				gamesWon: newGameStats.gamesWon,
				bestGuessCount: newGameStats.bestGuessCount,
			});
		} else if (inputValue > randomNum && inputValue < 100) {
			guessRef.current.textContent = "Your guess is high";
			guessRef.current.style.color = "#57534e";
			newChance = chance - 1;
		} else if (inputValue < randomNum && inputValue > 0) {
			guessRef.current.textContent = "Your guess is low";
			guessRef.current.style.color = "#57534e";
			newChance = chance - 1;
		} else {
			guessRef.current.textContent = "Your number is invalid";
			guessRef.current.style.color = "#dc2626";
			newChance = chance;
		}

		setChance(newChance);
		chancesRef.current.textContent = newChance;

		if (newChance === 0 && inputValue !== randomNum) {
			// Player lost the game
			const newGameStats = {
				...gameStats,
				gamesPlayed: gameStats.gamesPlayed + 1,
			};

			setGameStats(newGameStats);
			guessRef.current.textContent = "You lost the game";
			guessRef.current.style.color = "#dc2626";
			setScore(0);
			setCookies("score", 0, cookieOptions);
			setButtonText("Replay");
			setDisabled(true);
			inputRef.current.disabled = true;
			setPost(true);

			// Check for achievements even on loss
			checkAchievements("guess", {
				guessCount: guessCount + 1,
				correct: false,
				distance: Math.abs(inputValue - randomNum),
				target: randomNum,
				gamesPlayed: newGameStats.gamesPlayed,
				gamesWon: newGameStats.gamesWon,
			});
		}
	};

	const postScore = () => {
		// Create metadata for the score post
		const metadata = {
			target: randomNum,
			attempts: 10 - chance,
			range: { min: 1, max: 100 },
			guessCount: guessCount,
		};

		createScorePost({
			value: score,
			text: scoreText,
			owner: cookies.user_id,
			game: "guess",
			metadata: metadata,
		})
			.then((response) => {
				if (response.data != null) {
					// Check for achievements related to posting scores
					checkAchievements("guess", {
						...metadata,
						scorePosted: true,
						scoreValue: score,
						gamesPlayed: gameStats.gamesPlayed,
						gamesWon: gameStats.gamesWon,
					});

					setScore(0);
					navigate("/post");
				} else {
					console.error("Failed to post score");
				}
			})
			.catch((error) => {
				console.error(error.message);
			});
	};

	return (
		<>
			<Navbar />
			<div className="min-h-[640px] bg-background py-16 px-4 sm:px-6 lg:px-8">
				<div className="max-w-md mx-auto bg-background border border-border-subtle">
					<div className="p-9">
						<h1 className="text-3xl font-serif text-center text-ink mb-8">
							Guess a number from 1 to 100
						</h1>
						<p
							className="text-xl text-center font-mono text-ink mb-4"
							ref={scoreRef}
						></p>
						<p
							className="text-lg text-center font-medium mb-8 h-6 text-text-secondary"
							ref={guessRef}
						></p>

						<div className="grid grid-cols-1 sm:grid-cols-[3fr_1fr] gap-3 mb-8">
							<input
								type="number"
								ref={inputRef}
								disabled={disabled}
								className="block w-full bg-background border border-border-medium px-4 text-ink placeholder-text-tertiary focus:border-primary focus-ring text-lg"
								placeholder="Enter your guess"
							/>
							<button
								onClick={handleCheck}
								className={`inline-flex justify-center items-center px-6 py-3 text-[15px] font-semibold border ${disabled ? "bg-success text-background border-success" : "bg-primary text-background border-primary hover:bg-primary-hover active:bg-primary-active"}`}
							>
								{buttonText}
							</button>
						</div>

						<p className="text-lg text-center text-text-secondary mb-4">
							You have{" "}
							<span className="font-mono font-bold text-ink" ref={chancesRef}>
								10
							</span>{" "}
							chances
						</p>

						{post && (
							<div className="mt-8 border-t pt-8 border-border-subtle">
								<h3 className="text-lg font-serif text-ink mb-4">
									Post your score
								</h3>
								<div className="space-y-4">
									<input
										type="text"
										placeholder="Enter comment"
										onChange={(e) => setScoreText(e.target.value)}
										className="block w-full h-12 bg-background border border-border-medium px-4 text-ink placeholder-text-tertiary focus:border-primary focus-ring"
									/>
									<button
										onClick={postScore}
										className="w-full inline-flex justify-center bg-primary text-background py-3 px-4 text-[15px] font-semibold border border-primary hover:bg-primary-hover active:bg-primary-active"
									>
										Post Score
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
			<Footer />
		</>
	);
}
