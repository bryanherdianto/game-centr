import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Game data (module scope so it isn't rebuilt on every render)
const games = [
	{
		id: "guess",
		title: "Guess the Number",
		description: "Try to guess the secret number between 1 and 100.",
		path: "/game/guess",
		color: "from-blue-500 to-indigo-700",
	},
	{
		id: "hangman",
		title: "Hangman",
		description:
			"Guess the word one letter at a time before the hangman is complete.",
		path: "/game/hang-man",
		color: "from-green-500 to-emerald-700",
	},
	{
		id: "pong",
		title: "Pong",
		description:
			"Classic paddle game where you compete against each other. Use WASD for player 1 and arrow keys for player 2.",
		path: "/game/pong",
		color: "from-red-500 to-rose-700",
	},
	{
		id: "typing",
		title: "Typing Game",
		description:
			"Test your typing speed and accuracy with this challenging game.",
		path: "/game/typing",
		color: "from-amber-500 to-orange-700",
	},
	{
		id: "simonsays",
		title: "Simon Says",
		description: "Pattern memory game. Repeat the sequence!",
		path: "/game/simon-says",
		color: "from-fuchsia-500 to-indigo-700",
	},
	{
		id: "memorymatch",
		title: "Memory Match",
		description: "Flip cards to match pairs. Test your memory!",
		path: "/game/memory-match",
		color: "from-yellow-500 to-amber-700",
	},
	{
		id: "whackamole",
		title: "Whack-a-Mole",
		description: "Moles pop up randomly. Click to score! Test your reflexes.",
		path: "/game/whack-a-mole",
		color: "from-lime-500 to-green-700",
	},
	{
		id: "colorguess",
		title: "Color Guess",
		description: "Match the correct color! Options increase as you progress.",
		path: "/game/color-guess",
		color: "from-[rgb(0,245,255)] to-[rgb(255,0,255)]",
	},
	{
		id: "patternrepeater",
		title: "Pattern Repeater",
		description:
			"Repeat the sequence of arrows using your arrow keys. Gets faster and longer!",
		path: "/game/pattern-repeater",
		color: "from-cyan-400 to-blue-600",
	},
	{
		id: "quickmath",
		title: "Quick Math Challenge",
		description:
			"Solve math equations under time pressure. 7 seconds per round!",
		path: "/game/quick-math",
		color: "from-pink-400 to-yellow-400",
	},
];

function Game() {
	const navigate = useNavigate();

	return (
		<>
			<Navbar />
			<div className="min-h-[640px] bg-background py-20 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<div className="text-center">
						<h1 className="font-serif text-4xl text-ink tracking-tight sm:text-5xl md:text-6xl">
							GameCentr
						</h1>
						<p className="mt-4 max-w-md mx-auto text-lg text-text-secondary md:max-w-3xl">
							Choose from our selection of fun and challenging games.
						</p>
					</div>

					<div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{games.map((game) => {
							return (
								<div
									key={game.id}
									onClick={() => navigate(game.path)}
									className="bg-background border border-border-subtle p-9 cursor-pointer transition-colors hover:border-border-medium hover:bg-surface"
								>
									<div className="h-full flex flex-col">
										<h3 className="font-serif text-2xl text-ink mb-3">
											{game.title}
										</h3>
										<p className="text-text-secondary text-[15px] mb-8 flex-grow">
											{game.description}
										</p>
										<div className="inline-flex items-center text-primary font-semibold text-[15px]">
											Play Now
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-4 w-4 ml-2"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path
													fillRule="evenodd"
													d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
			<Footer />
		</>
	);
}

export default Game;
