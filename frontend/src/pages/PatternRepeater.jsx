import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCookies } from "react-cookie";
import { createScorePost } from "../actions/Score.action";

// One arrow shape, rotated per direction, so every arrow looks identical.
const ARROWS = [
	{ key: "ArrowUp", rotation: 0 },
	{ key: "ArrowRight", rotation: 90 },
	{ key: "ArrowDown", rotation: 180 },
	{ key: "ArrowLeft", rotation: 270 },
];

const MAX_ROUNDS = 20;
const BASE_SPEED = 600; // ms (faster)
const SPEED_STEP = 40; // ms per round (faster progression)

// Single up-arrow SVG; the `rotation` prop spins it to any direction.
const Arrow = ({ rotation, className = "" }) => (
	<svg
		viewBox="0 0 24 24"
		className={className}
		style={{ transform: `rotate(${rotation}deg)` }}
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<line x1="12" y1="20" x2="12" y2="5" />
		<polyline points="5 12 12 5 19 12" />
	</svg>
);

function getRandomArrow() {
	return ARROWS[Math.floor(Math.random() * ARROWS.length)];
}

const PatternRepeater = () => {
	const [pattern, setPattern] = useState([]);
	const [userInput, setUserInput] = useState([]);
	const [showing, setShowing] = useState(false);
	const [currentShow, setCurrentShow] = useState(-1);
	const [round, setRound] = useState(1);
	const [score, setScore] = useState(0);
	const [gameOver, setGameOver] = useState(false);
	const [win, setWin] = useState(false);
	const timeoutRef = useRef();
	const [cookies] = useCookies(["user_id"]);
	const [scorePosted, setScorePosted] = useState(false);

	useEffect(() => {
		if ((gameOver || win) && !scorePosted) {
			handleSubmitScore();
		}
		// eslint-disable-next-line
	}, [gameOver, win]);

	const handleSubmitScore = async () => {
		await createScorePost({
			value: score,
			text: win ? "Win!" : "Game Over",
			owner: cookies.user_id,
			game: "patternrepeater",
		});
		setScorePosted(true);
	};

	// Keep arrow keys from scrolling the page the whole time we're on this screen.
	useEffect(() => {
		const preventArrowScroll = (e) => {
			if (ARROWS.some((a) => a.key === e.key)) {
				e.preventDefault();
			}
		};
		window.addEventListener("keydown", preventArrowScroll);
		return () => window.removeEventListener("keydown", preventArrowScroll);
	}, []);

	useEffect(() => {
		if (round === 1) startNewGame();
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (showing) {
			setCurrentShow(-1);
			let i = 0;
			function showStep() {
				setCurrentShow(i);
				if (i < pattern.length) {
					timeoutRef.current = setTimeout(
						() => {
							setCurrentShow(-1);
							timeoutRef.current = setTimeout(() => {
								i++;
								if (i < pattern.length) showStep();
								else {
									setShowing(false);
									setCurrentShow(-1);
								}
							}, 200);
						},
						BASE_SPEED - (round - 1) * SPEED_STEP,
					);
				}
			}
			showStep();
			return () => clearTimeout(timeoutRef.current);
		}
		// eslint-disable-next-line
	}, [showing, pattern, round]);

	useEffect(() => {
		if (!showing && userInput.length > 0) {
			const idx = userInput.length - 1;
			if (userInput[idx] !== pattern[idx]) {
				setGameOver(true);
				return;
			}
			if (userInput.length === pattern.length) {
				setScore((s) => s + 1);
				if (round === MAX_ROUNDS) {
					setWin(true);
					setGameOver(true);
				} else {
					setTimeout(() => {
						setRound((r) => r + 1);
						nextRound(round + 1);
					}, 800);
				}
			}
		}
		// eslint-disable-next-line
	}, [userInput]);

	useEffect(() => {
		if (!showing && !gameOver && !win) {
			const handleKey = (e) => {
				if (ARROWS.some((a) => a.key === e.key)) {
					setUserInput((u) => [...u, e.key]);
				}
			};
			window.addEventListener("keydown", handleKey);
			return () => window.removeEventListener("keydown", handleKey);
		}
	}, [showing, gameOver, win]);

	const startNewGame = () => {
		setPattern([getRandomArrow().key]);
		setUserInput([]);
		setRound(1);
		setScore(0);
		setGameOver(false);
		setWin(false);
		setTimeout(() => setShowing(true), 500);
	};

	const nextRound = (r) => {
		setPattern((p) => [...p, getRandomArrow().key]);
		setUserInput([]);
		setTimeout(() => setShowing(true), 600);
	};

	const handleRestart = () => {
		startNewGame();
	};

	return (
		<>
			<Navbar />
			<div className="min-h-screen flex flex-col items-center justify-center bg-background py-16 px-4">
				<div className="max-w-md w-full bg-background border border-border-subtle p-9 flex flex-col items-center">
					<h1 className="text-3xl font-serif text-ink mb-3">
						Pattern Repeater
					</h1>
					<p className="mb-3 text-text-secondary text-center">
						Memorize the sequence of arrows and repeat them using your arrow
						keys. The pattern gets longer and faster each round!
					</p>
					<div className="mb-2 font-mono text-ink">
						Round: {round} / {MAX_ROUNDS}
					</div>
					<div className="mb-2 font-mono text-text-secondary">
						Score: {score}
					</div>
					{/* Pattern display: only show the current arrow during the show phase */}
					<div className="flex gap-2 mb-6 min-h-[4rem]">
						{showing && currentShow !== -1 ? (
							(() => {
								const arrowObj = ARROWS.find(
									(a) => a.key === pattern[currentShow],
								);
								return (
									<div className="w-16 h-16 flex items-center justify-center bg-ink text-background border border-ink">
										<Arrow rotation={arrowObj.rotation} className="w-8 h-8" />
									</div>
								);
							})()
						) : (
							<div />
						)}
					</div>
					<div className="flex gap-4 mb-6">
						{ARROWS.map((a) => (
							<div
								key={a.key}
								className="w-12 h-12 flex items-center justify-center border border-border-medium text-text-secondary"
							>
								<Arrow rotation={a.rotation} className="w-6 h-6" />
							</div>
						))}
					</div>
					{gameOver || win ? (
						<>
							<div
								className={`font-semibold mb-4 ${win ? "text-success" : "text-error"}`}
							>
								{win ? "You Win!" : "Game Over!"}
							</div>
							<div className="mb-2 text-text-secondary">
								Final Score: {score} / {MAX_ROUNDS}
							</div>
							<button
								onClick={handleRestart}
								className="bg-primary text-background px-6 py-3 font-semibold text-[15px] border border-primary hover:bg-primary-hover active:bg-primary-active"
							>
								Play Again
							</button>
						</>
					) : (
						<div className="text-text-secondary font-semibold mb-2 h-6">
							{showing ? "Watch the pattern..." : "Your turn! Use arrow keys."}
						</div>
					)}
				</div>
			</div>
			<Footer />
		</>
	);
};

export default PatternRepeater;
