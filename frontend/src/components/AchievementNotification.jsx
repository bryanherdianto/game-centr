import React, { useState, useEffect } from "react";

/**
 * Component for displaying achievement notifications
 * @param {Object} achievement - The achievement object
 * @param {Function} onClose - Function to call when notification is closed
 * @param {number} autoCloseTime - Time in ms before auto-closing (default: 5000)
 */
const AchievementNotification = ({
	achievement,
	onClose,
	autoCloseTime = 5000,
}) => {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		// Show the notification with a slight delay for animation
		const showTimer = setTimeout(() => {
			setVisible(true);
		}, 100);

		// Auto-close the notification after specified time
		const closeTimer = setTimeout(() => {
			handleClose();
		}, autoCloseTime);

		return () => {
			clearTimeout(showTimer);
			clearTimeout(closeTimer);
		};
	}, [autoCloseTime]);

	const handleClose = () => {
		setVisible(false);
		// Wait for exit animation to complete before calling onClose
		setTimeout(() => {
			if (onClose) onClose();
		}, 500);
	};

	// Get accent border color based on difficulty (semantic status tokens)
	const getDifficultyColor = (difficulty) => {
		switch (difficulty) {
			case "easy":
				return "border-l-success";
			case "medium":
				return "border-l-warning";
			case "hard":
				return "border-l-error";
			default:
				return "border-l-primary";
		}
	};

	return (
		<div
			className={`fixed bottom-4 right-4 max-w-sm w-full border border-border-subtle border-l-4 transition-all duration-500 transform ${
				visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
			} ${getDifficultyColor(achievement?.difficulty)}`}
			style={{ zIndex: 1000 }}
		>
			<div className="p-4 bg-background flex items-start">
				<div className="text-4xl mr-4">{achievement?.icon || "🏆"}</div>
				<div className="flex-1">
					<div className="flex justify-between items-start">
						<div>
							<h3 className="font-bold text-lg text-ink">
								{achievement?.title || "Achievement Unlocked"}
							</h3>
							<p className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary mt-1">
								{achievement?.gameName || "Game"} •{" "}
								{achievement?.difficulty?.charAt(0).toUpperCase() +
									achievement?.difficulty?.slice(1) || "Unknown"}
							</p>
						</div>
						<button
							onClick={handleClose}
							className="text-text-tertiary hover:text-ink focus:outline-none"
						>
							✕
						</button>
					</div>
					<p className="text-sm mt-2 text-text-secondary">
						{achievement?.description || "You earned a new achievement!"}
					</p>
				</div>
			</div>
		</div>
	);
};

export default AchievementNotification;
