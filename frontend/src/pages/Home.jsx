import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import Footer from "../components/Footer";

// Shared button classes (DESIGN.md — sharp edges, flat, Inter 15px/600).
const primaryBtn =
	"inline-flex items-center justify-center px-6 py-3 text-[15px] font-semibold bg-primary text-background border border-primary hover:bg-primary-hover transition-colors";
const secondaryBtn =
	"inline-flex items-center justify-center px-6 py-3 text-[15px] font-semibold bg-transparent text-primary border border-border-medium hover:bg-surface transition-colors";

// A small, curated showcase for the landing page (full list lives on /game).
const featuredGames = [
	{
		title: "Guess the Number",
		description: "Track down the secret number between 1 and 100.",
		path: "/game/guess",
	},
	{
		title: "Pong",
		description: "The classic paddle duel. WASD versus the arrow keys.",
		path: "/game/pong",
	},
	{
		title: "Hangman",
		description: "Reveal the word one letter at a time before it's too late.",
		path: "/game/hang-man",
	},
	{
		title: "Typing Game",
		description: "Test your speed and accuracy against the clock.",
		path: "/game/typing",
	},
	{
		title: "Memory Match",
		description: "Flip the cards and pair them all from memory.",
		path: "/game/memory-match",
	},
	{
		title: "Quick Math",
		description: "Solve equations under pressure — 7 seconds a round.",
		path: "/game/quick-math",
	},
];

const features = [
	{
		label: "01 — Play",
		title: "Ten mini-games",
		description:
			"From Pong to Quick Math — quick to pick up, hard to put down.",
	},
	{
		label: "02 — Compete",
		title: "Climb the leaderboards",
		description:
			"Post your scores, comment on runs, and chase the top of every board.",
	},
	{
		label: "03 — Achieve",
		title: "Earn achievements",
		description: "Unlock hidden badges as you master each game in the arcade.",
	},
];

export default function Home() {
	const [cookies] = useCookies(["isLoggedIn"]);
	const isLoggedIn = Boolean(cookies.isLoggedIn);

	return (
		<div className="bg-background">
			{/* Minimal landing header — adapts to auth state. */}
			<header className="bg-surface border-b border-border-subtle">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
					<span className="font-serif text-ink text-xl font-bold tracking-tight">
						GameCentr
					</span>
					<nav className="flex items-center gap-2 sm:gap-3">
						{isLoggedIn ? (
							<Link to="/game" className={primaryBtn}>
								Enter Arcade
							</Link>
						) : (
							<>
								<Link to="/login" className={secondaryBtn}>
									Log In
								</Link>
								<Link to="/signup" className={primaryBtn}>
									Sign Up
								</Link>
							</>
						)}
					</nav>
				</div>
			</header>

			{/* Hero */}
			<section className="max-w-3xl mx-auto px-4 sm:px-6 text-center py-24 sm:py-32">
				<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary mb-6">
					A quiet little arcade
				</p>
				<h1 className="font-serif text-ink text-4xl sm:text-5xl md:text-6xl tracking-tight leading-tight">
					Ten games. One calm corner of the web.
				</h1>
				<p className="mt-6 text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
					GameCentr is a minimalist browser arcade — play classic mini-games,
					post your scores, climb the leaderboards, and earn achievements along
					the way.
				</p>
				<div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
					{isLoggedIn ? (
						<>
							<Link to="/game" className={primaryBtn}>
								Enter Arcade
							</Link>
							<Link to="/leaderboard" className={secondaryBtn}>
								View Leaderboards
							</Link>
						</>
					) : (
						<>
							<Link to="/signup" className={primaryBtn}>
								Start Playing
							</Link>
							<Link to="/login" className={secondaryBtn}>
								Log In
							</Link>
						</>
					)}
				</div>
			</section>

			{/* Features — three columns split by hairline borders. */}
			<section className="border-y border-border-subtle">
				<div className="max-w-7xl mx-auto grid sm:grid-cols-3 sm:divide-x divide-border-subtle">
					{features.map((feature) => (
						<div key={feature.label} className="p-12">
							<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary mb-3">
								{feature.label}
							</p>
							<h3 className="font-serif text-xl text-ink mb-2">
								{feature.title}
							</h3>
							<p className="text-text-secondary text-[15px]">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* Featured games */}
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
				<div className="flex items-end justify-between mb-12 flex-wrap gap-4">
					<div>
						<h2 className="font-serif text-3xl text-ink tracking-tight">
							Featured games
						</h2>
						<p className="mt-2 text-text-secondary">
							A taste of what's inside. There are ten in all.
						</p>
					</div>
					<Link
						to={isLoggedIn ? "/game" : "/signup"}
						className="inline-flex items-center text-primary font-semibold text-[15px] hover:text-primary-hover transition-colors"
					>
						View all games
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
					</Link>
				</div>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{featuredGames.map((game) => (
						<Link
							key={game.path}
							to={isLoggedIn ? game.path : "/login"}
							className="bg-background border border-border-subtle p-9 transition-colors hover:border-border-medium hover:bg-surface"
						>
							<div className="h-full flex flex-col">
								<h3 className="font-serif text-2xl text-ink mb-3">
									{game.title}
								</h3>
								<p className="text-text-secondary text-[15px] mb-8 flex-grow">
									{game.description}
								</p>
								<span className="inline-flex items-center text-primary font-semibold text-[15px]">
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
								</span>
							</div>
						</Link>
					))}
				</div>
			</section>

			{/* Closing call to action */}
			{!isLoggedIn && (
				<section className="border-t border-border-subtle bg-surface">
					<div className="max-w-3xl mx-auto px-4 sm:px-6 text-center py-24">
						<h2 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">
							Ready to play?
						</h2>
						<p className="mt-4 text-lg text-text-secondary">
							Create a free account and start climbing the boards.
						</p>
						<div className="mt-10">
							<Link to="/signup" className={primaryBtn}>
								Create Account
							</Link>
						</div>
					</div>
				</section>
			)}

			<Footer />
		</div>
	);
}
