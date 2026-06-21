import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCookies } from "react-cookie";
import { createScorePost } from "../actions/Score.action";

const MOLE_COUNT = 9;
const GAME_TIME = 30; // seconds
const MOLE_POPUP_MIN = 600; // ms
const MOLE_POPUP_MAX = 1200; // ms

const moleImg = "/mole.png";
const holeImg = "/hole.png";

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

const WhackAMole = () => {
	const [score, setScore] = useState(0);
	const [timeLeft, setTimeLeft] = useState(GAME_TIME);
	const [activeMole, setActiveMole] = useState(null);
	const [gameActive, setGameActive] = useState(false);
	const timerRef = useRef();
	// Track every scheduled mole timeout so they can all be cleared together.
	const moleTimeoutsRef = useRef([]);
	// Refs mirror state so the self-scheduling mole loop avoids stale closures.
	const gameActiveRef = useRef(false);
	const timeLeftRef = useRef(GAME_TIME);
	const activeMoleRef = useRef(null);
	const [cookies] = useCookies(["user_id"]);
	const [scorePosted, setScorePosted] = useState(false);
	const [scoreMessage, setScoreMessage] = useState("");

	const clearMoleTimeouts = () => {
		moleTimeoutsRef.current.forEach((t) => clearTimeout(t));
		moleTimeoutsRef.current = [];
	};

	const scheduleMoleTimeout = (cb, delay) => {
		const id = setTimeout(cb, delay);
		moleTimeoutsRef.current.push(id);
		return id;
	};

	// Keep refs in sync with state.
	useEffect(() => {
		gameActiveRef.current = gameActive;
	}, [gameActive]);
	useEffect(() => {
		timeLeftRef.current = timeLeft;
	}, [timeLeft]);
	useEffect(() => {
		activeMoleRef.current = activeMole;
	}, [activeMole]);

	// Clean up all timers on unmount.
	useEffect(() => {
		return () => {
			clearTimeout(timerRef.current);
			clearMoleTimeouts();
		};
	}, []);

	useEffect(() => {
		if (!gameActive && timeLeft === 0 && !scorePosted) {
			handleSubmitScore();
		}
		// eslint-disable-next-line
	}, [gameActive, timeLeft]);

	const handleSubmitScore = async () => {
		const result = await createScorePost({
			value: score,
			text: `Score: ${score}`,
			owner: cookies.user_id,
			game: "whackamole",
		});
		setScorePosted(true);
		setScoreMessage(
			result && result.success
				? "Score posted!"
				: "Could not post score. Please try again.",
		);
	};

	useEffect(() => {
		if (gameActive && timeLeft > 0) {
			timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
		} else if (timeLeft === 0) {
			setGameActive(false);
			setActiveMole(null);
			clearTimeout(timerRef.current);
			clearMoleTimeouts();
		}
		return () => {
			clearTimeout(timerRef.current);
		};
	}, [gameActive, timeLeft]);

	useEffect(() => {
		if (gameActive && timeLeft > 0) {
			popUpMole();
		} else {
			setActiveMole(null);
			clearMoleTimeouts();
		}
		// eslint-disable-next-line
	}, [gameActive]);

	const popUpMole = () => {
		const nextIdx = getRandomInt(MOLE_COUNT);
		setActiveMole(nextIdx);
		const nextTime =
			Math.random() * (MOLE_POPUP_MAX - MOLE_POPUP_MIN) + MOLE_POPUP_MIN;
		scheduleMoleTimeout(() => {
			setActiveMole(null);
			if (gameActiveRef.current && timeLeftRef.current > 0) {
				scheduleMoleTimeout(popUpMole, 300);
			}
		}, nextTime);
	};

	const handleWhack = (idx) => {
		if (gameActiveRef.current && idx === activeMoleRef.current) {
			setScore((s) => s + 1);
			setActiveMole(null);
			clearMoleTimeouts();
			scheduleMoleTimeout(popUpMole, 200);
		}
	};

	const startGame = () => {
		clearMoleTimeouts();
		setScore(0);
		setTimeLeft(GAME_TIME);
		setGameActive(true);
		setActiveMole(null);
		setScorePosted(false);
		setScoreMessage("");
	};

	return (
		<>
			<Navbar />
			<div className="min-h-[640px] flex flex-col items-center justify-center py-12 px-4">
				<div className="max-w-md w-full bg-background/95 border border-border-subtle p-9 flex flex-col items-center">
					<h1 className="text-3xl font-serif text-ink mb-3">Whack-a-Mole</h1>
					<p className="mb-3 text-text-secondary text-center">
						Click the moles as they pop up! Fast reflexes = high score!
					</p>
					<div className="mb-4 font-mono text-ink">
						Score: {score} | Time: {timeLeft}s
					</div>
					<div className="grid grid-cols-3 gap-4 mb-6">
						{Array.from({ length: MOLE_COUNT }).map((_, idx) => (
							<button
								key={idx}
								className="w-24 h-24 bg-transparent relative focus:outline-none"
								style={{ position: "relative" }}
								onClick={() => handleWhack(idx)}
								disabled={!gameActive}
								aria-label={activeMole === idx ? "Mole" : "Hole"}
							>
								<img
									src={holeImg}
									alt="Hole"
									className="absolute w-full h-full object-contain z-0 select-none pointer-events-none"
									style={{ left: 0, top: 0 }}
									draggable="false"
								/>
								{activeMole === idx && (
									<img
										src={moleImg}
										alt="Mole"
										className="absolute w-20 h-20 object-contain z-10 left-1 top-1 animate-bounce select-none pointer-events-none"
										draggable="false"
									/>
								)}
							</button>
						))}
					</div>
					{!gameActive || timeLeft === 0 ? (
						<button
							onClick={startGame}
							className="bg-primary text-background px-6 py-3 font-semibold text-[15px] border border-primary hover:bg-primary-hover active:bg-primary-active"
						>
							{timeLeft === 0 ? "Play Again" : "Start Game"}
						</button>
					) : null}
					{timeLeft === 0 && (
						<div className="text-success font-semibold mt-4">
							Time's up! Final Score: {score}
						</div>
					)}
					{timeLeft === 0 && scoreMessage && (
						<div className="text-[15px] font-semibold text-text-secondary mt-2">
							{scoreMessage}
						</div>
					)}
				</div>
			</div>
			<Footer />
		</>
	);
};

export default WhackAMole;
