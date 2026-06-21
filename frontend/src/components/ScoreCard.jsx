import CommentCard from "./CommentCard";
import { useState } from "react";
import { addComment } from "../actions/Score.action";
import { useCookies } from "react-cookie";

export default function ScoreCard({
	score_id,
	username,
	score,
	text,
	comments,
	game,
}) {
	const [commentText, setCommentText] = useState("");
	const [localComments, setLocalComments] = useState(comments || []);
	const [cookies] = useCookies(["user_id", "username"]);

	const postComment = () => {
		const text = commentText.trim();
		if (!text) return;

		addComment({
			game,
			scoreId: score_id,
			author: cookies.user_id,
			text,
		})
			.then((response) => {
				if (response.data != null) {
					// Use the created comment if it has a populated author,
					// otherwise build it from the current user + input text.
					const created = response.data;
					const newComment =
						created && created.author && created.author.username
							? created
							: {
									_id: (created && created._id) || `temp-${Date.now()}`,
									text,
									author: { username: cookies.username },
								};
					setLocalComments((prev) => [...prev, newComment]);
					setCommentText("");
				} else {
					console.error("Failed to post comment");
				}
			})
			.catch((error) => {
				console.error(error.message);
			});
	};

	return (
		<div className="bg-background border border-border-subtle hover:border-border-medium overflow-hidden">
			<div className="p-9">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold text-ink">{username}</h2>
					<span className="inline-flex items-center px-3 py-1 text-[11px] font-semibold uppercase bg-surface text-text-secondary border border-border-medium">
						Score: {score}
					</span>
				</div>

				<p className="text-text-secondary mb-6">{text}</p>

				<div className="mt-6 border-t border-border-subtle pt-6">
					<div className="flex space-x-2">
						<input
							type="text"
							placeholder="Add a comment"
							value={commentText}
							onChange={(e) => setCommentText(e.target.value)}
							className="block w-full bg-background border border-border-medium text-ink placeholder:text-text-tertiary focus:border-primary focus-ring text-[15px] px-4 py-3"
						/>
						<button
							onClick={postComment}
							className="inline-flex justify-center bg-primary text-background border border-primary px-6 py-3 text-[15px] font-semibold hover:bg-primary-hover active:bg-primary-active"
						>
							Comment
						</button>
					</div>
				</div>

				{localComments && localComments.length > 0 && (
					<div className="mt-6 space-y-3 pt-3">
						<h3 className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
							Comments
						</h3>
						{localComments.map((comment) => (
							<CommentCard
								key={comment._id}
								username={comment.author.username}
								text={comment.text}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
