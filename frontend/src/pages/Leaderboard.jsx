import { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
	getGameLeaderboard,
	getAllGameTypes,
	getGlobalLeaderboard,
} from "../actions/Score.action";

export default function Leaderboard() {
	const [leaderboardData, setLeaderboardData] = useState([]);
	const [gameTypes, setGameTypes] = useState([]);
	const [selectedGame, setSelectedGame] = useState("");
	const [gameInfo, setGameInfo] = useState(null);
	const [stats, setStats] = useState(null);
	const [sortField, setSortField] = useState("score");
	const [sortDirection, setSortDirection] = useState("desc");
	const [timeFrame, setTimeFrame] = useState("all");
	const [limit, setLimit] = useState(10);
	const [loading, setLoading] = useState(false);
	const [viewMode, setViewMode] = useState("game"); // "game" or "global"

	// Score filtering
	const [minScore, setMinScore] = useState("");
	const [maxScore, setMaxScore] = useState("");
	const [useMinScore, setUseMinScore] = useState(false);
	const [useMaxScore, setUseMaxScore] = useState(false);

	// Fetch game types on component mount
	useEffect(() => {
		getAllGameTypes()
			.then((response) => {
				if (response.data) {
					setGameTypes(response.data);
					if (response.data.length > 0) {
						setSelectedGame(response.data[0].game_code);
					}
				} else {
					console.error("Failed to get game types");
				}
			})
			.catch((error) => {
				console.error("Error fetching game types:", error.message);
			});
	}, []);

	// Fetch leaderboard data when selected game or view mode changes
	useEffect(() => {
		if (viewMode === "game" && selectedGame) {
			fetchLeaderboardData();
		} else if (viewMode === "global") {
			fetchGlobalLeaderboardData();
		}
	}, [selectedGame, timeFrame, limit, viewMode]);

	const fetchLeaderboardData = () => {
		setLoading(true);
		getGameLeaderboard(selectedGame, { timeFrame, limit })
			.then((response) => {
				if (response.data) {
					setLeaderboardData(response.data);
					setGameInfo(response.gameInfo);
					setStats(response.stats);
				} else {
					console.error("Failed to get leaderboard data");
					setLeaderboardData([]);
					setGameInfo(null);
					setStats(null);
				}
				setLoading(false);
			})
			.catch((error) => {
				console.error("Error fetching leaderboard:", error.message);
				setLoading(false);
			});
	};

	const fetchGlobalLeaderboardData = () => {
		setLoading(true);
		getGlobalLeaderboard({ limit })
			.then((response) => {
				if (response.data) {
					setLeaderboardData(response.data);
					setGameInfo(null);
					setStats(null);
				} else {
					console.error("Failed to get global leaderboard data");
					setLeaderboardData([]);
					setGameInfo(null);
					setStats(null);
				}
				setLoading(false);
			})
			.catch((error) => {
				console.error("Error fetching global leaderboard:", error.message);
				setLoading(false);
			});
	};

	const handleGameChange = (e) => {
		setSelectedGame(e.target.value);
	};

	const handleTimeFrameChange = (e) => {
		setTimeFrame(e.target.value);
	};

	const handleLimitChange = (e) => {
		setLimit(parseInt(e.target.value));
	};

	const handleSort = (field) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("desc");
		}
	};

	// Filter the leaderboard data based on score filters
	const filteredData = useMemo(() => {
		return leaderboardData.filter((entry) => {
			let passesFilter = true;

			if (useMinScore && minScore !== "") {
				passesFilter = passesFilter && entry.score >= parseInt(minScore);
			}

			if (useMaxScore && maxScore !== "") {
				passesFilter = passesFilter && entry.score <= parseInt(maxScore);
			}

			return passesFilter;
		});
	}, [leaderboardData, useMinScore, minScore, useMaxScore, maxScore]);

	// Sort the filtered leaderboard data
	const sortedData = useMemo(() => {
		return [...filteredData].sort((a, b) => {
			let valueA, valueB;

			if (sortField === "user") {
				valueA = a.user.username.toLowerCase();
				valueB = b.user.username.toLowerCase();
				return sortDirection === "asc"
					? valueA.localeCompare(valueB)
					: valueB.localeCompare(valueA);
			} else if (sortField === "score") {
				valueA = a.score;
				valueB = b.score;
				return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
			} else if (sortField === "rank") {
				valueA = a.rank;
				valueB = b.rank;
				return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
			}
			return 0;
		});
	}, [filteredData, sortField, sortDirection]);

	// Get the selected game type
	const selectedGameType = gameTypes.find(
		(game) => game.game_code === selectedGame,
	);

	return (
		<>
			<Navbar />
			<div className="min-h-[640px] bg-background py-20 px-4 sm:px-6 lg:px-8">
				<div className="max-w-5xl mx-auto">
					<h1 className="font-serif text-4xl text-center text-ink mb-12">
						Leaderboards
					</h1>

					{/* View Mode Selector */}
					<div className="bg-background border border-border-subtle p-6">
						<div className="flex justify-center gap-3">
							<button
								onClick={() => setViewMode("game")}
								className={`px-3.5 py-1.5 text-[13px] border ${
									viewMode === "game"
										? "bg-primary text-background border-primary"
										: "bg-transparent text-text-secondary border-border-medium hover:bg-surface"
								}`}
							>
								Game
							</button>
							<button
								onClick={() => setViewMode("global")}
								className={`px-3.5 py-1.5 text-[13px] border ${
									viewMode === "global"
										? "bg-primary text-background border-primary"
										: "bg-transparent text-text-secondary border-border-medium hover:bg-surface"
								}`}
							>
								Global
							</button>
						</div>

						{/* Score Filtering */}
						<div className="mt-6 pt-6 border-t border-border-subtle">
							<h3 className="text-[13px] font-semibold text-text-secondary mb-3">
								Score Filter
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Min Score Filter */}
								<div className="flex items-center space-x-2">
									<input
										type="checkbox"
										id="useMinScore"
										checked={useMinScore}
										onChange={(e) => setUseMinScore(e.target.checked)}
										className="h-[18px] w-[18px] accent-primary border-border-medium"
									/>
									<label
										htmlFor="useMinScore"
										className="text-[15px] text-text-secondary"
									>
										Greater Than
									</label>
									<input
										type="number"
										value={minScore}
										onChange={(e) => setMinScore(e.target.value)}
										disabled={!useMinScore}
										className="p-2 block w-full bg-background border border-border-medium text-ink placeholder:text-text-tertiary focus:border-primary focus:outline-none text-[15px] disabled:bg-surface disabled:opacity-50"
										placeholder="Min score"
									/>
								</div>

								{/* Max Score Filter */}
								<div className="flex items-center space-x-2">
									<input
										type="checkbox"
										id="useMaxScore"
										checked={useMaxScore}
										onChange={(e) => setUseMaxScore(e.target.checked)}
										className="h-[18px] w-[18px] accent-primary border-border-medium"
									/>
									<label
										htmlFor="useMaxScore"
										className="text-[15px] text-text-secondary"
									>
										Less Than
									</label>
									<input
										type="number"
										value={maxScore}
										onChange={(e) => setMaxScore(e.target.value)}
										disabled={!useMaxScore}
										className="p-2 block w-full bg-background border border-border-medium text-ink placeholder:text-text-tertiary focus:border-primary focus:outline-none text-[15px] disabled:bg-surface disabled:opacity-50"
										placeholder="Max score"
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Filters and Controls */}
					<div className="mt-8 bg-background border border-border-subtle p-6 mb-8">
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							{/* Game Type Selector - Only show in game mode */}
							{viewMode === "game" && (
								<div>
									<label
										htmlFor="gameType"
										className="block text-[13px] font-semibold text-text-secondary mb-2"
									>
										Game Type
									</label>
									<select
										id="gameType"
										value={selectedGame}
										onChange={handleGameChange}
										className="p-2 block w-full bg-background border border-border-medium text-ink focus:border-primary focus:outline-none text-[15px]"
									>
										{gameTypes.map((game) => (
											<option key={game.game_code} value={game.game_code}>
												{game.name}
											</option>
										))}
									</select>
								</div>
							)}

							{/* Time Frame Selector - Only show in game mode */}
							{viewMode === "game" && (
								<div>
									<label
										htmlFor="timeFrame"
										className="block text-[13px] font-semibold text-text-secondary mb-2"
									>
										Time Frame
									</label>
									<select
										id="timeFrame"
										value={timeFrame}
										onChange={handleTimeFrameChange}
										className="p-2 block w-full bg-background border border-border-medium text-ink focus:border-primary focus:outline-none text-[15px]"
									>
										<option value="all">All Time</option>
										<option value="daily">Today</option>
										<option value="weekly">This Week</option>
										<option value="monthly">This Month</option>
									</select>
								</div>
							)}

							{/* Empty div for spacing in global mode */}
							{viewMode === "global" && <div></div>}
							{viewMode === "global" && <div></div>}

							{/* Limit Selector */}
							<div>
								<label
									htmlFor="limit"
									className="block text-[13px] font-semibold text-text-secondary mb-2"
								>
									Show Top
								</label>
								<select
									id="limit"
									value={limit}
									onChange={handleLimitChange}
									className="p-2 block w-full bg-background border border-border-medium text-ink focus:border-primary focus:outline-none text-[15px]"
								>
									<option value={5}>5</option>
									<option value={10}>10</option>
									<option value={25}>25</option>
									<option value={50}>50</option>
									<option value={100}>100</option>
								</select>
							</div>

							{/* Refresh Button */}
							<div className="flex items-end">
								<button
									onClick={
										viewMode === "game"
											? fetchLeaderboardData
											: fetchGlobalLeaderboardData
									}
									disabled={loading}
									className="w-full inline-flex justify-center bg-primary text-background border border-primary py-3 px-6 text-[15px] font-semibold hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
								>
									{loading ? "Loading..." : "Refresh"}
								</button>
							</div>
						</div>
					</div>

					{/* Global Leaderboard Title */}
					{viewMode === "global" && (
						<div className="bg-background border border-border-subtle p-9 mb-8">
							<h2 className="font-serif text-2xl text-ink mb-3">
								Global Leaderboard
							</h2>
							<p className="text-text-secondary">
								Top players across all games. Scores are normalized based on
								each game's scoring system.
							</p>
						</div>
					)}

					{/* Game Info and Stats */}
					{viewMode === "game" && gameInfo && (
						<div className="bg-background border border-border-subtle p-9 mb-8">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-9">
								<div>
									<h2 className="font-serif text-2xl text-ink mb-3">
										{gameInfo.name}
									</h2>
									<p className="text-text-secondary mb-3">
										{gameInfo.description}
									</p>
									<p className="text-[13px] text-text-tertiary">
										<span className="font-semibold text-text-secondary">
											Scoring Type:
										</span>{" "}
										{gameInfo.scoringType}
										{gameInfo.maxScore && ` (Max: ${gameInfo.maxScore})`}
									</p>
								</div>
								{stats && (
									<div className="grid grid-cols-2 gap-px bg-border-subtle border border-border-subtle">
										<div className="bg-surface p-5">
											<p className="text-[13px] text-text-secondary">
												Total Plays
											</p>
											<p className="font-mono text-2xl font-semibold text-ink">
												{stats.totalPlays}
											</p>
										</div>
										<div className="bg-surface p-5">
											<p className="text-[13px] text-text-secondary">
												Average Score
											</p>
											<p className="font-mono text-2xl font-semibold text-ink">
												{Math.round(stats.averageScore * 10) / 10}
											</p>
										</div>
										<div className="bg-surface p-5">
											<p className="text-[13px] text-text-secondary">
												Highest Score
											</p>
											<p className="font-mono text-2xl font-semibold text-ink">
												{stats.highestScore}
											</p>
										</div>
										<div className="bg-surface p-5">
											<p className="text-[13px] text-text-secondary">
												Lowest Score
											</p>
											<p className="font-mono text-2xl font-semibold text-ink">
												{stats.lowestScore}
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Filter Status */}
					{(useMinScore || useMaxScore) && (
						<div className="bg-surface border border-border-subtle p-4 mb-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 text-primary mr-2"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
											clipRule="evenodd"
										/>
									</svg>
									<span className="text-[13px] font-semibold text-text-secondary">
										Showing {sortedData.length} of {leaderboardData.length}{" "}
										scores
										{leaderboardData.length - sortedData.length > 0 &&
											` (${leaderboardData.length - sortedData.length} filtered out)`}
									</span>
								</div>
								<button
									onClick={() => {
										setUseMinScore(false);
										setUseMaxScore(false);
										setMinScore("");
										setMaxScore("");
									}}
									className="text-[13px] text-primary hover:text-primary-hover"
								>
									Clear Filters
								</button>
							</div>
						</div>
					)}

					{/* Leaderboard Table */}
					<div className="bg-background border border-border-subtle overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full">
								<thead className="bg-surface border-b border-border-subtle">
									<tr>
										<th
											scope="col"
											className="px-6 py-4 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider cursor-pointer"
											onClick={() => handleSort("rank")}
										>
											<div className="flex items-center">
												Rank
												{sortField === "rank" && (
													<span className="ml-1">
														{sortDirection === "asc" ? "↑" : "↓"}
													</span>
												)}
											</div>
										</th>
										<th
											scope="col"
											className="px-6 py-4 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider cursor-pointer"
											onClick={() => handleSort("user")}
										>
											<div className="flex items-center">
												Player
												{sortField === "user" && (
													<span className="ml-1">
														{sortDirection === "asc" ? "↑" : "↓"}
													</span>
												)}
											</div>
										</th>
										<th
											scope="col"
											className="px-6 py-4 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider cursor-pointer"
											onClick={() => handleSort("score")}
										>
											<div className="flex items-center">
												Score
												{sortField === "score" && (
													<span className="ml-1">
														{sortDirection === "asc" ? "↑" : "↓"}
													</span>
												)}
											</div>
										</th>
										<th
											scope="col"
											className="px-6 py-4 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider"
										>
											Date
										</th>
									</tr>
								</thead>
								<tbody>
									{loading ? (
										<tr>
											<td
												colSpan="4"
												className="px-6 py-4 text-center text-[15px] text-text-tertiary"
											>
												Loading...
											</td>
										</tr>
									) : sortedData.length === 0 ? (
										<tr>
											<td
												colSpan="4"
												className="px-6 py-4 text-center text-[15px] text-text-tertiary"
											>
												No scores to display yet. Play the game to be the first!
											</td>
										</tr>
									) : (
										sortedData.map((entry) => (
											<tr
												key={entry.user._id}
												className="border-b border-border-subtle hover:bg-surface"
											>
												<td className="px-6 py-4 whitespace-nowrap text-[15px] font-semibold text-ink font-mono">
													{entry.rank}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-[15px] text-text-secondary">
													<div className="flex items-center">
														<div className="text-[15px] font-medium text-ink">
															{entry.user.username}
														</div>
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-[15px] text-text-secondary">
													<span className="px-3 py-1 inline-flex text-[13px] font-semibold font-mono bg-surface border border-border-medium text-ink">
														{entry.score}
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-[13px] text-text-tertiary">
													{new Date(entry.createdAt).toLocaleDateString()}
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>

					{/* Scoring Type Info - Only show in game mode */}
					{viewMode === "game" && selectedGameType && (
						<div className="mt-8 bg-background border border-border-subtle p-9">
							<h3 className="font-serif text-xl text-ink mb-3">
								About {selectedGameType.name} Scoring
							</h3>
							<p className="text-text-secondary mb-4">
								{getScoringTypeDescription(selectedGameType.scoring_type)}
							</p>
							{selectedGameType.max_score && (
								<p className="text-[13px] text-text-tertiary">
									Maximum possible score:{" "}
									<span className="font-semibold text-text-secondary">
										{selectedGameType.max_score}
									</span>
								</p>
							)}
						</div>
					)}
				</div>
			</div>
			<Footer />
		</>
	);
}

// Helper function to get scoring type descriptions
function getScoringTypeDescription(scoringType) {
	switch (scoringType) {
		case "points":
			return "Points are awarded based on correct answers or successful actions in the game. Higher points indicate better performance.";
		case "rounds":
			return "Scores represent the number of rounds or levels completed. The more rounds completed, the higher the score.";
		case "binary":
			return "This game uses a win/lose scoring system. A score of 100 indicates a win, while 0 indicates a loss.";
		case "sentences":
			return "Scores represent the number of sentences successfully completed. More sentences completed means a higher score.";
		case "bounces":
			return "Scores are based on the number of successful ball bounces. More bounces indicate longer gameplay and higher skill.";
		default:
			return "Scores represent your performance in the game. Higher scores indicate better performance.";
	}
}
