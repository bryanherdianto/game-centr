import { useState } from "react";
import { useCookies } from "react-cookie";
import { NavLink } from "react-router-dom";

export default function Navbar() {
	const [cookies, , removeCookie] = useCookies([
		"token",
		"user_id",
		"username",
		"isLoggedIn",
		"score",
	]);
	const [mobileOpen, setMobileOpen] = useState(false);

	const handleLogout = () => {
		const cookieOptions = { path: "/" };
		removeCookie("token", cookieOptions);
		removeCookie("user_id", cookieOptions);
		removeCookie("username", cookieOptions);
		removeCookie("isLoggedIn", cookieOptions);
		removeCookie("score", cookieOptions);
	};

	return (
		<nav className="bg-surface border-b border-border-subtle sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex items-center">
						<NavLink
							to="/game"
							className="font-serif text-ink text-xl font-bold mr-8 tracking-tight"
						>
							GameCentr
						</NavLink>
						<div className="hidden md:flex space-x-1">
							<NavLink
								to="/game"
								className={({ isActive }) =>
									isActive
										? "px-3 py-2 text-sm font-semibold text-ink border-b-2 border-primary"
										: "px-3 py-2 text-sm font-medium text-text-secondary border-b-2 border-transparent hover:text-ink hover:bg-surface-raised"
								}
							>
								Play
							</NavLink>
							<NavLink
								to="/post"
								className={({ isActive }) =>
									isActive
										? "px-3 py-2 text-sm font-semibold text-ink border-b-2 border-primary"
										: "px-3 py-2 text-sm font-medium text-text-secondary border-b-2 border-transparent hover:text-ink hover:bg-surface-raised"
								}
							>
								Scores
							</NavLink>
							<NavLink
								to="/leaderboard"
								className={({ isActive }) =>
									isActive
										? "px-3 py-2 text-sm font-semibold text-ink border-b-2 border-primary"
										: "px-3 py-2 text-sm font-medium text-text-secondary border-b-2 border-transparent hover:text-ink hover:bg-surface-raised"
								}
							>
								Leaderboards
							</NavLink>
							<NavLink
								to="/profile"
								className={({ isActive }) =>
									isActive
										? "px-3 py-2 text-sm font-semibold text-ink border-b-2 border-primary"
										: "px-3 py-2 text-sm font-medium text-text-secondary border-b-2 border-transparent hover:text-ink hover:bg-surface-raised"
								}
							>
								Achievements
							</NavLink>
						</div>
					</div>
					<div className="flex items-center">
						<span className="hidden sm:inline text-text-secondary text-sm mr-4">
							{cookies.username}
						</span>
						<NavLink
							to="/"
							onClick={handleLogout}
							className="px-4 py-2 text-sm font-semibold text-background bg-error border border-error hover:bg-error-hover"
						>
							Logout
						</NavLink>
						<button
							type="button"
							onClick={() => setMobileOpen((v) => !v)}
							aria-label="Toggle menu"
							aria-expanded={mobileOpen}
							className="md:hidden ml-2 p-2 text-ink border border-border-subtle bg-surface-raised hover:bg-surface-hover"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								{mobileOpen ? (
									<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
								) : (
									<path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
								)}
							</svg>
						</button>
					</div>
				</div>
			</div>
			{mobileOpen && (
				<div className="md:hidden border-t border-border-subtle bg-surface">
					<div className="px-4 pt-2 pb-3 space-y-1">
						{[
							{ to: "/game", label: "Play" },
							{ to: "/post", label: "Scores" },
							{ to: "/leaderboard", label: "Leaderboards" },
							{ to: "/profile", label: "Achievements" },
						].map((link) => (
							<NavLink
								key={link.to}
								to={link.to}
								onClick={() => setMobileOpen(false)}
								className={({ isActive }) =>
									isActive
										? "block px-3 py-2 text-sm font-semibold text-ink bg-surface-raised border-l-2 border-primary"
										: "block px-3 py-2 text-sm font-medium text-text-secondary border-l-2 border-transparent hover:text-ink hover:bg-surface-raised"
								}
							>
								{link.label}
							</NavLink>
						))}
						<span className="block sm:hidden px-3 pt-2 text-xs text-text-secondary">
							{cookies.username}
						</span>
					</div>
				</div>
			)}
		</nav>
	);
}
