import axios from "axios";

const backend_URI =
	window.location.hostname === "localhost"
		? "http://localhost:8080"
		: "https://sbd-numbrhunt.jpmd53.easypanel.host";

const baseApiResponse = (data, isSuccess) => {
	return {
		success: isSuccess,
		data: data || null,
	};
};

/**
 * Get all achievements
 * @param {string} gameCode - Optional game code to filter achievements
 * @param {boolean} showHidden - Whether to show hidden achievements
 * @returns {Promise} - Promise with the response
 */

export const getAllAchievements = async (gameCode = "", showHidden = false) => {
	try {
		const response = await axios.get(`${backend_URI}/achievement`, {
			params: {
				gameCode,
				showHidden,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching achievements:", error);
		throw error;
	}
};

/**
 * Get achievements for a specific user
 * @param {string} userId - The user ID
 * @param {string} gameCode - Optional game code to filter achievements
 * @param {boolean} showHidden - Whether to show hidden achievements
 * @returns {Promise} - Promise with the response
 */
export const getUserAchievements = async (
	userId,
	gameCode = "",
	showHidden = false,
) => {
	try {
		const response = await axios.get(
			`${backend_URI}/achievement/user/${userId}`,
			{
				params: {
					gameCode,
					showHidden,
				},
			},
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching user achievements:", error);
		throw error;
	}
};

/**
 * Award an achievement to a user
 * @param {string} userId - The user ID
 * @param {string} gameCode - The game code
 * @param {string} achievementCode - The achievement code
 * @returns {Promise} - Promise with the response
 */
export const awardAchievement = async (userId, gameCode, achievementCode) => {
	try {
		const response = await axios.post(`${backend_URI}/achievement/award`, {
			userId,
			gameCode,
			achievementCode,
		});
		return response.data;
	} catch (error) {
		console.error("Error awarding achievement:", error);
		throw error;
	}
};

/**
 * Check if a user has earned any achievements based on their game progress
 * @param {string} userId - The user ID
 * @param {string} gameCode - The game code
 * @param {Object} progress - The game progress data
 * @returns {Promise} - Promise with the response
 */
export const checkAchievementProgress = async (userId, gameCode, progress) => {
	try {
		const response = await axios.post(
			`${backend_URI}/achievement/check-progress`,
			{
				userId,
				gameCode,
				progress,
			},
		);
		return response.data;
	} catch (error) {
		console.error("Error checking achievement progress:", error);
		throw error;
	}
};
