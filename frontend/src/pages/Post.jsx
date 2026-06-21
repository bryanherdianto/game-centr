import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getAllScores } from "../actions/Score.action";
import ScoreCard from "../components/ScoreCard";

export default function Post() {
	const [scores, setScores] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		getAllScores()
			.then((response) => {
				if (response.data != null) {
					setScores(response.data);
				} else {
					console.error("Failed to get all scores");
				}
			})
			.catch((error) => {
				console.error("Error fetching scores:", error.message);
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	return (
		<>
			<Navbar />
			<div className="min-h-[640px] bg-background py-16 px-4 sm:px-6 lg:px-8">
				<div className="max-w-[680px] mx-auto">
					<h1 className="text-4xl font-serif text-center text-ink mb-12">
						Scores
					</h1>

					<div className="space-y-6">
						{loading ? (
							<div className="flex justify-center items-center h-64">
								<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
							</div>
						) : scores.length === 0 ? (
							<div className="bg-surface border border-border-subtle p-9 text-center">
								<p className="text-text-secondary">
									No scores to display yet. Play the game to be the first!
								</p>
							</div>
						) : (
							scores.map((score) => (
								<div key={score._id} className="transition-colors duration-300">
									<ScoreCard
										score_id={score._id}
										username={score.owner.username}
										score={score.value}
										text={score.text}
										comments={score.comments}
										game={score.game}
									/>
								</div>
							))
						)}
					</div>
				</div>
			</div>
			<Footer />
		</>
	);
}
