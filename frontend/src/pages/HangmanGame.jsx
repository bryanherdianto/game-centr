import { useState, useEffect } from "react";
import HangmanCanvas from "./HangmanCanvas";
import "./HangmanGame.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCookies } from "react-cookie";
import { createScorePost } from "../actions/Score.action";

const words = ["REACT", "JAVASCRIPT", "DEVELOPER", "HANGMAN", "COMPONENT"];

const HangmanGame = () => {
	const [word, setWord] = useState("");
	const [guessedLetters, setGuessedLetters] = useState([]);
	const [mistakes, setMistakes] = useState(0);
	const [scorePosted, setScorePosted] = useState(false);
	const [cookies] = useCookies(["user_id"]);

	useEffect(() => {
		resetGame();
	}, []);

	useEffect(() => {
		if ((isGameWon() || isGameLost()) && !scorePosted) {
			handleSubmitScore();
		}
	}, [guessedLetters, mistakes]);

	const chooseRandomWord = () => {
		const randomIndex = Math.floor(Math.random() * words.length);
		return words[randomIndex].toUpperCase();
	};

	const handleGuess = (letter) => {
		if (!guessedLetters.includes(letter)) {
			setGuessedLetters([...guessedLetters, letter]);
			if (!word.includes(letter)) {
				setMistakes(mistakes + 1);
			}
		}
	};

	const isGameWon = () => {
		return word.split("").every((letter) => guessedLetters.includes(letter));
	};

	const isGameLost = () => {
		return mistakes >= 6;
	};

	const resetGame = () => {
		setWord(chooseRandomWord());
		setGuessedLetters([]);
		setMistakes(0);
		setScorePosted(false);
	};

	// Tambahkan fungsi ini:
	const handleSubmitScore = async () => {
		if (!scorePosted && (isGameWon() || isGameLost())) {
			const scoreValue = isGameWon() ? 100 : 0; // Atur sesuai logika skor
			const scoreText = isGameWon() ? "Menang Hangman!" : "Kalah Hangman!";
			await createScorePost({
				value: scoreValue,
				text: scoreText,
				owner: cookies.user_id,
				game: "hangman",
			});
			setScorePosted(true);
		}
	};

	return (
		<>
			<Navbar />
			<div className="hangman-container">
				<h1>Hangman Game</h1>
				<h5>
					Hangman is a word-guessing game. Start a new game, guess letters to
					reveal the word, and avoid drawing the hangman by making incorrect
					guesses. Win by guessing the word before the hangman is complete. Have
					fun!
				</h5>
				<HangmanCanvas mistakes={mistakes} />
				<div className="word-display">
					{word.split("").map((letter, index) => (
						<span key={index} className="letter">
							{guessedLetters.includes(letter) ? letter : "_"}
						</span>
					))}
				</div>
				<div className="m-5 grid grid-cols-3 sm:grid-cols-7 gap-2.5">
					{Array.from(Array(26)).map((_, index) => (
						<button
							key={index}
							onClick={() => handleGuess(String.fromCharCode(65 + index))}
							disabled={
								guessedLetters.includes(String.fromCharCode(65 + index)) ||
								isGameWon() ||
								isGameLost()
							}
							className="text-lg px-3.5 py-2 bg-primary text-background border border-primary font-semibold hover:bg-primary-hover active:bg-primary-active transition-all duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed"
						>
							{String.fromCharCode(65 + index)}
						</button>
					))}
				</div>
				{isGameWon() && <p className="result-message">You won!</p>}
				{isGameLost() && (
					<p className="result-message">You lost! The word was: {word}</p>
				)}
				<button className="new-game-button" onClick={resetGame}>
					New Game
				</button>
			</div>
			<Footer />
		</>
	);
};

export default HangmanGame;
