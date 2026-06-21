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
						<span className="text-text-secondary text-sm mr-4">
							{cookies.username}
						</span>
						<NavLink
							to="/"
							onClick={handleLogout}
							className="px-4 py-2 text-sm font-semibold text-background bg-error border border-error hover:bg-error-hover"
						>
							Logout
						</NavLink>
					</div>
				</div>
			</div>
		</nav>
	);
}
