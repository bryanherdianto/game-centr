import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getUserAchievements } from "../actions/Achievement.actions";

const Profile = () => {
	const [cookies] = useCookies(["user_id", "username"]);
	const [userProfile, setUserProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchUserProfile = async () => {
			try {
				setLoading(true);
				const response = await getUserAchievements(cookies.user_id);
				setUserProfile(response.data);
				setLoading(false);
			} catch (err) {
				console.error("Error fetching user profile:", err);
				setError("Failed to load profile data. Please try again later.");
				setLoading(false);
			}
		};

		if (cookies.user_id) {
			fetchUserProfile();
		} else {
			navigate("/login");
		}
	}, [cookies.user_id, navigate]);

	// Function to format date
	const formatDate = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Function to get background color based on difficulty
	const getDifficultyColor = (difficulty) => {
		switch (difficulty) {
			case "easy":
				return "bg-success-bg border-success-border";
			case "medium":
				return "bg-warning-bg border-warning-border";
			case "hard":
				return "bg-error-bg border-error-border";
			default:
				return "bg-surface border-border-subtle";
		}
	};

	return (
		<div className="min-h-screen flex flex-col bg-background">
			<Navbar />

			<div className="container mx-auto px-4 py-12 flex-grow">
				{loading ? (
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
					</div>
				) : error ? (
					<div
						className="bg-error-bg border border-error-border text-error px-4 py-3"
						role="alert"
					>
						<strong className="font-semibold">Error!</strong>
						<span className="block sm:inline"> {error}</span>
					</div>
				) : userProfile ? (
					<div>
						{/* User Profile Header */}
						<div className="bg-background border border-border-subtle p-9 mb-8">
							<h1 className="text-3xl font-serif text-ink mb-2">
								{userProfile.user.username}'s Profile
							</h1>
							<div className="text-text-secondary">
								<p>Member since: {formatDate(userProfile.user.createdAt)}</p>
								<div className="mt-6">
									<h2 className="text-xl font-serif text-ink">Stats</h2>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
										<div className="bg-surface border border-border-subtle p-6">
											<p className="text-text-secondary text-[13px] font-semibold">
												Total Achievements
											</p>
											<p className="text-2xl font-serif text-ink mt-1">
												{userProfile.stats.totalAchievements || 0}
											</p>
										</div>
										<div className="bg-surface border border-border-subtle p-6">
											<p className="text-text-secondary text-[13px] font-semibold">
												Games Played
											</p>
											<p className="text-2xl font-serif text-ink mt-1">
												{userProfile.stats.totalGamesPlayed || 0}
											</p>
										</div>
										<div className="bg-surface border border-border-subtle p-6">
											<p className="text-text-secondary text-[13px] font-semibold">
												Highest Score
											</p>
											<p className="text-2xl font-serif text-ink mt-1">
												{userProfile.stats.highestScore || 0}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Achievements Section */}
						<div className="bg-background border border-border-subtle p-9">
							<h2 className="text-2xl font-serif text-ink mb-6">
								Achievements
							</h2>

							{userProfile.achievements.length === 0 ? (
								<p className="text-text-secondary">
									No achievements yet. Start playing games to earn achievements!
								</p>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
									{userProfile.achievements.map((achievement) => (
										<div
											key={achievement.id}
											className={`border p-9 flex flex-col gap-4 transition-colors duration-300 ${
												achievement.isUnlocked
													? `${getDifficultyColor(achievement.difficulty)} hover:border-border-medium`
													: "bg-surface border-border-subtle opacity-50"
											}`}
										>
											{/* Icon + difficulty chip row */}
											<div className="flex items-center justify-between">
												<span className="text-5xl leading-none">
													{achievement.isUnlocked ? achievement.icon : "❓"}
												</span>
												<span
													className={`text-[11px] font-semibold uppercase tracking-widest px-3 py-1 border ${
														achievement.difficulty === "easy"
															? "bg-success-bg text-success border-success-border"
															: achievement.difficulty === "medium"
																? "bg-warning-bg text-warning border-warning-border"
																: "bg-error-bg text-error border-error-border"
													}`}
												>
													{achievement.difficulty}
												</span>
											</div>

											{/* Text block */}
											<div className="flex flex-col gap-1">
												<h3 className="font-serif text-xl text-ink">
													{achievement.title}
												</h3>
												<p className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide">
													{achievement.gameName}
												</p>
												<p className="text-[15px] text-text-secondary leading-relaxed mt-1">
													{achievement.description}
												</p>
											</div>

											{/* Unlocked date */}
											{achievement.isUnlocked && (
												<p className="text-[13px] text-text-tertiary border-t border-border-subtle pt-3 mt-auto">
													Unlocked {formatDate(achievement.awardedAt)}
												</p>
											)}
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				) : (
					<div
						className="bg-warning-bg border border-warning-border text-warning px-4 py-3"
						role="alert"
					>
						<strong className="font-semibold">No profile data found.</strong>
						<span className="block sm:inline"> Please log in again.</span>
					</div>
				)}
			</div>

			<Footer />
		</div>
	);
};

export default Profile;
