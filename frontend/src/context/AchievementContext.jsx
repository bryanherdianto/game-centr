import React, { createContext, useState, useContext, useEffect } from "react";
import { useCookies } from "react-cookie";
import AchievementNotification from "../components/AchievementNotification";
import { checkAchievementProgress } from "../actions/Achievement.actions";

// Create context
const AchievementContext = createContext();

/**
 * Achievement Provider Component
 * Manages achievement state and notifications across the application
 */
export const AchievementProvider = ({ children }) => {
	const [cookies] = useCookies(["user_id"]);
	const [notifications, setNotifications] = useState([]);
	const [achievementQueue, setAchievementQueue] = useState([]);

	// Process the achievement queue
	useEffect(() => {
		if (achievementQueue.length > 0 && notifications.length < 3) {
			// Take the first achievement from the queue
			const nextAchievement = achievementQueue[0];

			// Remove it from the queue
			setAchievementQueue((prev) => prev.slice(1));

			// Add it to notifications
			setNotifications((prev) => [
				...prev,
				{
					id: Date.now(),
					achievement: nextAchievement,
				},
			]);
		}
	}, [achievementQueue, notifications]);

	/**
	 * Check for achievements based on game progress
	 * @param {string} gameCode - The game code
	 * @param {Object} progress - The game progress data
	 */
	const checkAchievements = async (gameCode, progress) => {
		if (!cookies.user_id) return;

		try {
			const response = await checkAchievementProgress(
				cookies.user_id,
				gameCode,
				progress,
			);

			if (response.success && response.data.achievementsAwarded > 0) {
				// Add new achievements to the queue
				setAchievementQueue((prev) => [...prev, ...response.data.achievements]);
			}
		} catch (error) {
			console.error("Error checking achievements:", error);
		}
	};

	/**
	 * Remove a notification by ID
	 * @param {number} id - The notification ID to remove
	 */
	const removeNotification = (id) => {
		setNotifications((prev) =>
			prev.filter((notification) => notification.id !== id),
		);
	};

	// Value to be provided by the context
	const value = {
		checkAchievements,
	};

	return (
		<AchievementContext.Provider value={value}>
			{children}

			{/* Render achievement notifications */}
			{notifications.map(({ id, achievement }) => (
				<AchievementNotification
					key={id}
					achievement={achievement}
					onClose={() => removeNotification(id)}
				/>
			))}
		</AchievementContext.Provider>
	);
};

/**
 * Custom hook to use the achievement context
 */
export const useAchievements = () => {
	const context = useContext(AchievementContext);
	if (context === undefined) {
		throw new Error(
			"useAchievements must be used within an AchievementProvider",
		);
	}
	return context;
};

export default AchievementContext;
