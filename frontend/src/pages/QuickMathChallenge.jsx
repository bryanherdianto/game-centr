import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCookies } from "react-cookie";
import { createScorePost } from "../actions/Score.action";

const OPERATORS = [
	{ op: "+", fn: (a, b) => a + b },
	{ op: "-", fn: (a, b) => a - b },
	{ op: "×", fn: (a, b) => a * b },
	{ op: "÷", fn: (a, b) => Math.floor(a / b) },
];

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEquation(round) {
	// Increase difficulty as rounds progress
	let a, b, op;
	if (round < 5) {
		a = getRandomInt(1, 10);
		b = getRandomInt(1, 10);
		op = OPERATORS[getRandomInt(0, 1)]; // + or -
	} else if (round < 10) {
		a = getRandomInt(5, 20);
		b = getRandomInt(1, 15);
		op = OPERATORS[getRandomInt(0, 2)]; // +, -, ×
	} else {
		op = OPERATORS[getRandomInt(0, 3)];
		if (op.op === "÷") {
			b = getRandomInt(2, 12);
			a = b * getRandomInt(2, 12); // ensure integer division
		} else {
			a = getRandomInt(10, 99);
			b = getRandomInt(2, 99);
		}
	}
	return {
		a,
		b,
		op: op.op,
		answer: op.fn(a, b),
	};
}

const MAX_ROUNDS = 15;
const TIME_LIMIT = 7; // seconds

const QuickMathChallenge = () => {
	const [round, setRound] = useState(1);
	const [score, setScore] = useState(0);
	const [mistakes, setMistakes] = useState(0);
	const [equation, setEquation] = useState(generateEquation(1));
	const [input, setInput] = useState("");
	const [timer, setTimer] = useState(TIME_LIMIT);
	const [gameOver, setGameOver] = useState(false);
	const [win, setWin] = useState(false);
	const [anim, setAnim] = useState(false);
	const [inputDisabled, setInputDisabled] = useState(false);
	const timerRef = useRef();
	const inputRef = useRef();
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
			value: score,
			text: `Score: ${score}`,
			owner: cookies.user_id,
			game: "quickmath",
		});
		setScorePosted(true);
	};

	useEffect(() => {
		if (gameOver || win) return;
		setTimer(TIME_LIMIT);
		setAnim(false);
		timerRef.current = setInterval(() => {
			setTimer((t) => {
				if (t <= 1) {
					clearInterval(timerRef.current);
					handleTimeout();
					return 0;
				}
				return t - 1;
			});
		}, 1000);
		return () => clearInterval(timerRef.current);
		// eslint-disable-next-line
	}, [round, equation, gameOver, win]);

	const handleTimeout = () => {
		if (gameOver || win) return;
		setInputDisabled(true);
		setMistakes((m) => m + 1);
		setAnim(true);
		setTimeout(() => {
			if (round === MAX_ROUNDS) {
				setGameOver(true);
			} else {
				setRound((r) => r + 1);
				setEquation(generateEquation(round + 1));
				setInput("");
				setInputDisabled(false);
			}
		}, 1000);
	};

	const handleInput = (e) => {
		setInput(e.target.value.replace(/[^0-9\-]/g, ""));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (gameOver || win || inputDisabled) return;
		setInputDisabled(true);
		if (parseInt(input) === equation.answer) {
			setScore((s) => s + 1);
			setAnim(true);
			setTimeout(() => {
				if (round === MAX_ROUNDS) {
					setWin(true);
				} else {
					setRound((r) => r + 1);
					setEquation(generateEquation(round + 1));
					setInput("");
					setInputDisabled(false);
				}
			}, 500);
		} else {
			setMistakes((m) => m + 1);
			setAnim(true);
			setTimeout(() => {
				if (round === MAX_ROUNDS) {
					setGameOver(true);
				} else {
					setRound((r) => r + 1);
					setEquation(generateEquation(round + 1));
					setInput("");
					setInputDisabled(false);
				}
			}, 1000);
		}
	};

	// Re-focus the input whenever it becomes enabled (new round or restart).
	useEffect(() => {
		if (!inputDisabled && !gameOver && !win && !anim) {
			inputRef.current?.focus();
		}
	}, [inputDisabled, gameOver, win, anim]);

	const handleRestart = () => {
		setRound(1);
		setScore(0);
		setMistakes(0);
		setEquation(generateEquation(1));
		setInput("");
		setGameOver(false);
		setWin(false);
		setAnim(false);
		setTimer(TIME_LIMIT);
	};

	return (
		<>
			<Navbar />
			<div className="min-h-screen flex flex-col items-center justify-center bg-background py-16 px-4">
				<div className="max-w-md w-full bg-background border border-border-subtle p-9 flex flex-col items-center">
					<h1 className="text-3xl font-serif text-ink mb-3">
						Quick Math Challenge
					</h1>
					<p className="mb-3 text-text-secondary text-center">
						Solve each equation within{" "}
						<span className="font-semibold text-ink">{TIME_LIMIT} seconds</span>
						! The challenge gets harder as you progress.
					</p>
					<div className="mb-2 font-mono text-ink">
						Round: {round} / {MAX_ROUNDS}
					</div>
					<div className="mb-2 font-mono text-text-secondary">
						Score: {score} | Mistakes: {mistakes}
					</div>
					<div className="mb-6 flex flex-col items-center">
						<div
							className={`text-4xl font-mono font-bold mb-2 transition-all duration-300 ${anim ? (parseInt(input) === equation.answer ? "text-success scale-110" : "text-error animate-shake") : "text-ink"}`}
							onAnimationEnd={() => setAnim(false)}
						>
							{equation.a} {equation.op} {equation.b} = ?
						</div>
						<div className="w-40 h-2 bg-surface overflow-hidden mb-3 border border-border-subtle">
							<div
								className="h-full bg-primary transition-all duration-500"
								style={{ width: `${(timer / TIME_LIMIT) * 100}%` }}
							/>
						</div>
						<form onSubmit={handleSubmit} className="flex gap-2 mt-2">
							<input
								type="text"
								inputMode="numeric"
								className="bg-background border border-border-medium px-4 text-xl w-28 text-center text-ink placeholder-text-tertiary focus:border-primary focus-ring"
								ref={inputRef}
								value={input}
								onChange={handleInput}
								disabled={gameOver || win || anim || inputDisabled}
							/>
							<button
								type="submit"
								className="bg-primary text-background px-6 py-3 font-semibold text-[15px] border border-primary hover:bg-primary-hover active:bg-primary-active disabled:opacity-40"
								disabled={
									gameOver || win || anim || inputDisabled || input === ""
								}
							>
								Go
							</button>
						</form>
					</div>
					{(gameOver || win) && (
						<>
							<div
								className={`font-semibold mb-4 ${win ? "text-success" : "text-error"}`}
							>
								{win ? "You Win!" : "Game Over!"}
							</div>
							<div className="mb-2 text-text-secondary">
								Final Score: {score} / {MAX_ROUNDS}
							</div>
							<div className="mb-4 text-text-secondary">
								Total Mistakes: {mistakes}
							</div>
							<button
								onClick={handleRestart}
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

export default QuickMathChallenge;
