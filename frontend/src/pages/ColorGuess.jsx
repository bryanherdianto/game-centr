import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCookies } from "react-cookie";
import { createScorePost } from "../actions/Score.action";

const COLORS = [
	{ name: "Red", hex: "#FF0000" },
	{ name: "Crimson", hex: "#DC143C" },
	{ name: "Dark Red", hex: "#8B0000" },
	{ name: "Indian Red", hex: "#CD5C5C" },
	{ name: "Light Coral", hex: "#F08080" },
	{ name: "Maroon", hex: "#800000" },
	{ name: "Tomato", hex: "#FF6347" },
	{ name: "Firebrick", hex: "#B22222" },
	{ name: "Pink", hex: "#FFC0CB" },
	{ name: "Deep Pink", hex: "#FF1493" },
	{ name: "Hot Pink", hex: "#FF69B4" },
	{ name: "Light Pink", hex: "#FFB6C1" },
	{ name: "Pale Violet Red", hex: "#DB7093" },
	{ name: "Orange", hex: "#FFA500" },
	{ name: "Dark Orange", hex: "#FF8C00" },
	{ name: "Coral", hex: "#FF7F50" },
	{ name: "Salmon", hex: "#FA8072" },
	{ name: "Light Salmon", hex: "#FFA07A" },
	{ name: "Sienna", hex: "#A0522D" },
	{ name: "Sandy Brown", hex: "#F4A460" },
	{ name: "Yellow", hex: "#FFFF00" },
	{ name: "Gold", hex: "#FFD700" },
	{ name: "Golden Rod", hex: "#DAA520" },
	{ name: "Dark Golden Rod", hex: "#B8860B" },
	{ name: "Khaki", hex: "#F0E68C" },
	{ name: "Pale Golden Rod", hex: "#EEE8AA" },
	{ name: "Lemon Chiffon", hex: "#FFFACD" },
	{ name: "Light Yellow", hex: "#FFFFE0" },
	{ name: "Beige", hex: "#F5F5DC" },
	{ name: "Green", hex: "#008000" },
	{ name: "Forest Green", hex: "#228B22" },
	{ name: "Sea Green", hex: "#2E8B57" },
	{ name: "Dark Green", hex: "#006400" },
	{ name: "Medium Sea Green", hex: "#3CB371" },
	{ name: "Light Sea Green", hex: "#20B2AA" },
	{ name: "Spring Green", hex: "#00FF7F" },
	{ name: "Olive Drab", hex: "#6B8E23" },
	{ name: "Lime Green", hex: "#32CD32" },
	{ name: "Chartreuse", hex: "#7FFF00" },
	{ name: "Dark Olive Green", hex: "#556B2F" },
	{ name: "Yellow Green", hex: "#9ACD32" },
	{ name: "Olive", hex: "#808000" },
	{ name: "Lawn Green", hex: "#7CFC00" },
	{ name: "Medium Spring Green", hex: "#00FA9A" },
	{ name: "Dark Sea Green", hex: "#8FBC8F" },
	{ name: "Aquamarine", hex: "#7FFFD4" },
	{ name: "Medium Aquamarine", hex: "#66CDAA" },
	{ name: "Mint Cream", hex: "#F5FFFA" },
	{ name: "Honeydew", hex: "#F0FFF0" },
	{ name: "Dark Slate Gray", hex: "#2F4F4F" },
	{ name: "Teal", hex: "#008080" },
	{ name: "Dark Cyan", hex: "#008B8B" },
	{ name: "Aqua", hex: "#00FFFF" },
	{ name: "Cyan", hex: "#00FFFF" },
	{ name: "Light Cyan", hex: "#E0FFFF" },
	{ name: "Turquoise", hex: "#40E0D0" },
	{ name: "Medium Turquoise", hex: "#48D1CC" },
	{ name: "Dark Turquoise", hex: "#00CED1" },
	{ name: "Cadet Blue", hex: "#5F9EA0" },
	{ name: "Steel Blue", hex: "#4682B4" },
	{ name: "Light Steel Blue", hex: "#B0C4DE" },
	{ name: "Powder Blue", hex: "#B0E0E6" },
	{ name: "Light Blue", hex: "#ADD8E6" },
	{ name: "Sky Blue", hex: "#87CEEB" },
	{ name: "Deep Sky Blue", hex: "#00BFFF" },
	{ name: "Dodger Blue", hex: "#1E90FF" },
	{ name: "Cornflower Blue", hex: "#6495ED" },
	{ name: "Royal Blue", hex: "#4169E1" },
	{ name: "Navy", hex: "#000080" },
	{ name: "Midnight Blue", hex: "#191970" },
	{ name: "Blue", hex: "#0000FF" },
	{ name: "Dark Blue", hex: "#00008B" },
	{ name: "Medium Blue", hex: "#0000CD" },
	{ name: "Medium Slate Blue", hex: "#7B68EE" },
	{ name: "Slate Blue", hex: "#6A5ACD" },
	{ name: "Dark Slate Blue", hex: "#483D8B" },
	{ name: "Indigo", hex: "#4B0082" },
	{ name: "Purple", hex: "#800080" },
	{ name: "Violet", hex: "#EE82EE" },
	{ name: "Orchid", hex: "#DA70D6" },
	{ name: "Plum", hex: "#DDA0DD" },
	{ name: "Thistle", hex: "#D8bfd8" },
	{ name: "Lavender", hex: "#E6E6FA" },
	{ name: "Lavender Blush", hex: "#FFF0F5" },
	{ name: "Magenta", hex: "#FF00FF" },
	{ name: "Fuchsia", hex: "#FF00FF" },
	{ name: "Dark Magenta", hex: "#8B008B" },
	{ name: "Rebecca Purple", hex: "#663399" },
	{ name: "Medium Violet Red", hex: "#C71585" },
	{ name: "Brown", hex: "#A52A2A" },
	{ name: "Chocolate", hex: "#D2691E" },
	{ name: "Saddle Brown", hex: "#8B4513" },
	{ name: "Peru", hex: "#CD853F" },
	{ name: "Rosy Brown", hex: "#BC8F8F" },
	{ name: "Tan", hex: "#D2B48C" },
	{ name: "Burlywood", hex: "#DEB887" },
	{ name: "Wheat", hex: "#F5DEB3" },
	{ name: "Navajo White", hex: "#FFDEAD" },
	{ name: "Bisque", hex: "#FFE4C4" },
	{ name: "Blanched Almond", hex: "#FFE4C4" },
	{ name: "Papaya Whip", hex: "#FFEFD5" },
	{ name: "Moccasin", hex: "#FFE4B5" },
	{ name: "Peach Puff", hex: "#FFDAB9" },
	{ name: "Antique White", hex: "#FAEBD7" },
	{ name: "Linen", hex: "#FAF0E6" },
	{ name: "Old Lace", hex: "#FDF5E6" },
	{ name: "White Smoke", hex: "#F5F5F5" },
	{ name: "Gainsboro", hex: "#DCDCDC" },
	{ name: "Light Gray", hex: "#D3D3D3" },
	{ name: "Silver", hex: "#C0C0C0" },
	{ name: "Gray", hex: "#808080" },
	{ name: "Dim Gray", hex: "#696969" },
	{ name: "Slate Gray", hex: "#708090" },
	{ name: "Light Slate Gray", hex: "#778899" },
	{ name: "Dark Gray", hex: "#A9A9A9" },
	{ name: "Black", hex: "#000000" },
	{ name: "White", hex: "#FFFFFF" },
];

const MAX_ROUNDS = 20;

function getRandomColors(count) {
	const shuffled = COLORS.slice().sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

const ColorGuess = () => {
	const [round, setRound] = useState(1);
	const [score, setScore] = useState(0);
	const [mistakes, setMistakes] = useState(0);
	const [options, setOptions] = useState([]);
	const [target, setTarget] = useState(null);
	const [selected, setSelected] = useState([]); // indexes of wrong guesses
	const [gameOver, setGameOver] = useState(false);
	const [win, setWin] = useState(false);
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
		await createScorePost({
			value: score,
			text: `Score: ${score}`,
			owner: cookies.user_id,
			game: "colorguess",
		});
		setScorePosted(true);
	};

	useEffect(() => {
		if (!gameOver && !win) {
			startRound(round);
		}
		// eslint-disable-next-line
	}, [round, gameOver, win]);

	const startRound = (r) => {
		const optionCount = Math.min(4 + Math.floor((r - 1) / 2), 12);
		const opts = getRandomColors(optionCount);
		const tgt = opts[Math.floor(Math.random() * opts.length)];
		setOptions(opts);
		setTarget(tgt);
		setSelected([]);
	};

	const handleGuess = (idx) => {
		if (gameOver || win || selected.includes(idx) || cooldown) return;
		setCooldown(true);
		setTimeout(() => setCooldown(false), 700);
		if (options[idx].name === target.name) {
			setScore((s) => s + 1);
			if (round === MAX_ROUNDS) {
				setWin(true);
				setGameOver(true);
			} else {
				setTimeout(() => setRound((r) => r + 1), 600);
			}
		} else {
			setMistakes((m) => m + 1);
			setSelected((sel) => [...sel, idx]);
		}
	};

	const handleRestart = () => {
		setRound(1);
		setScore(0);
		setMistakes(0);
		setGameOver(false);
		setWin(false);
		setSelected([]);
	};

	return (
		<>
			<Navbar />
			<div className="min-h-screen flex flex-col items-center justify-center bg-background py-16 px-4">
				<div className="max-w-md w-full bg-background border border-border-subtle p-9 flex flex-col items-center">
					<h1 className="text-3xl font-serif text-ink mb-4">Color Guess</h1>
					<p className="mb-3 text-text-secondary text-center">
						Match the color with the correct option! Options increase as you
						progress.
					</p>
					<div className="mb-2 text-lg font-mono text-ink">
						Round: {round} / {MAX_ROUNDS}
					</div>
					<div className="mb-4 text-text-secondary font-mono">
						Score: {score} | Mistakes: {mistakes}
					</div>
					<div
						className="w-32 h-32 mb-8 border border-border-medium"
						style={{ background: target ? target.hex : "#fff" }}
					/>
					<div
						className={`mb-6 grid gap-4 ${
							options.length <= 2
								? "grid-cols-1"
								: options.length <= 4
									? "grid-cols-2"
									: "grid-cols-3"
						}`}
					>
						{options.map((opt, idx) => (
							<button
								key={opt.name}
								onClick={() => handleGuess(idx)}
								className={`flex items-center justify-center border transition-all duration-150 focus:outline-none focus-ring
                  h-16 w-full min-w-[80px] max-w-[140px] mx-auto
                  ${
										selected.includes(idx)
											? "opacity-40 border-border-medium cursor-not-allowed"
											: "border-border-medium hover:border-primary cursor-pointer"
									}
                `}
								style={{ background: opt.hex }}
								aria-label={opt.name}
								disabled={selected.includes(idx) || gameOver || win}
							>
								<span className="sr-only">{opt.name}</span>
							</button>
						))}
					</div>
					{(gameOver || win) && (
						<>
							<div
								className={`font-semibold mb-4 px-3 py-1 border ${win ? "bg-success-bg text-success border-success-border" : "bg-error-bg text-error border-error-border"}`}
							>
								{win
									? `Congratulations! You won all ${MAX_ROUNDS} rounds!`
									: `Game Over!`}
							</div>
							<div className="mb-2 font-mono text-ink">
								Final Score: {score} / {MAX_ROUNDS}
							</div>
							<div className="mb-4 font-mono text-text-secondary">
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

export default ColorGuess;
