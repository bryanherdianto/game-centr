import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCookies } from "react-cookie";
import { createScorePost } from "../actions/Score.action";

const CARD_PAIRS = ["🍎", "🍌", "🍇", "🍉", "🍒", "🍋", "🍓", "🥝"];

function shuffle(array) {
	let arr = array.slice();
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

const MemoryMatch = () => {
	const [cards, setCards] = useState([]);
	const [flipped, setFlipped] = useState([]); // indexes
	const [matched, setMatched] = useState([]); // indexes
	const [moves, setMoves] = useState(0);
	const [timer, setTimer] = useState(0);
	const [isRunning, setIsRunning] = useState(false);
	const [gameOver, setGameOver] = useState(false);
	const [cooldown, setCooldown] = useState(false);
	const [cookies] = useCookies(["user_id"]);
	const [scorePosted, setScorePosted] = useState(false);

	useEffect(() => {
		if (gameOver && !scorePosted) {
			handleSubmitScore();
		}
		// eslint-disable-next-line
	}, [gameOver]);

	const handleSubmitScore = async () => {
		// Contoh logika skor: makin sedikit moves & waktu makin tinggi skor
		const scoreValue = Math.max(1000 - (moves * 10 + timer * 5), 0);
		const scoreText = `Moves: ${moves}, Time: ${timer}s`;
		await createScorePost({
			value: scoreValue,
			text: scoreText,
			owner: cookies.user_id,
			game: "memorymatch",
		});
		setScorePosted(true);
	};

	useEffect(() => {
		startGame();
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		let interval;
		if (isRunning && !gameOver) {
			interval = setInterval(() => setTimer((t) => t + 1), 1000);
		}
		return () => clearInterval(interval);
	}, [isRunning, gameOver]);

	useEffect(() => {
		if (matched.length === cards.length && cards.length > 0) {
			setIsRunning(false);
			setGameOver(true);
		}
	}, [matched, cards]);

	const startGame = () => {
		const deck = shuffle([...CARD_PAIRS, ...CARD_PAIRS]).map((icon, i) => ({
			icon,
			id: i,
		}));
		setCards(deck);
		setFlipped([]);
		setMatched([]);
		setMoves(0);
		setTimer(0);
		setIsRunning(true);
		setGameOver(false);
	};

	const handleFlip = (idx) => {
		if (
			flipped.length === 2 ||
			flipped.includes(idx) ||
			matched.includes(idx) ||
			gameOver ||
			cooldown
		)
			return;
		setCooldown(true);
		setTimeout(() => setCooldown(false), 600);
		const newFlipped = [...flipped, idx];
		setFlipped(newFlipped);
		if (newFlipped.length === 2) {
			setMoves((m) => m + 1);
			const [first, second] = newFlipped;
			if (cards[first].icon === cards[second].icon) {
				setTimeout(() => {
					setMatched((prev) => [...prev, first, second]);
					setFlipped([]);
				}, 600);
			} else {
				setTimeout(() => setFlipped([]), 900);
			}
		}
	};

	return (
		<>
			<Navbar />
			<div className="min-h-screen flex flex-col items-center justify-center bg-background py-16 px-4">
				<div className="max-w-md w-full bg-background border border-border-subtle p-9 flex flex-col items-center">
					<h1 className="text-3xl font-serif text-ink mb-4">Memory Match</h1>
					<p className="mb-3 text-text-secondary text-center">
						Flip cards to match pairs. Try to finish fast!
					</p>
					<div className="mb-6 text-lg font-mono text-ink">
						Moves: {moves} | Time: {timer}s
					</div>
					<div className="grid grid-cols-4 gap-3 mb-8">
						{cards.map((card, idx) => {
							const isFaceUp = flipped.includes(idx) || matched.includes(idx);
							return (
								<button
									key={card.id}
									className={`w-16 h-16 border text-2xl text-center flex items-center justify-center transition-all duration-200 ${
										isFaceUp
											? "bg-surface border-border-medium"
											: "bg-primary border-primary"
									} ${matched.includes(idx) ? "opacity-60" : ""}`}
									onClick={() => handleFlip(idx)}
									disabled={isFaceUp || gameOver}
									aria-label={isFaceUp ? card.icon : "Hidden card"}
								>
									{isFaceUp ? card.icon : ""}
								</button>
							);
						})}
					</div>
					{gameOver && (
						<>
							<div className="bg-success-bg text-success border border-success-border font-semibold mb-4 px-3 py-1 text-center">
								You matched all pairs in {moves} moves and {timer} seconds!
							</div>
							<button
								onClick={startGame}
								className="bg-primary text-background px-6 py-3 font-semibold text-[15px] border border-primary hover:bg-primary-hover active:bg-primary-active"
							>
								Play Again
							</button>
						</>
					)}
				</div>
			</div>
			<Footer />
		</>
	);
};

export default MemoryMatch;
