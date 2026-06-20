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

// post score
export const createScorePost = async (input) => {
	try {
		const response = await axios.post(
			`${backend_URI}/game/${input.game}/score`,
			input,
		);

		console.log("Response from Backend");
		console.log(response.data);
		return baseApiResponse(response.data.data, true);
	} catch (error) {
		console.error(error);
		return baseApiResponse(null, false);
	}
};

// get all scores
export const getAllScores = async () => {
	try {
		const response = await axios.get(`${backend_URI}/score`);

		console.log("Response from Backend");
		console.log(response.data);
		return baseApiResponse(response.data.data, true);
	} catch (error) {
		console.error(error);
		return baseApiResponse(null, false);
	}
};

// get all scores for a game
export const getScoresByGame = async (game) => {
	try {
		const response = await axios.get(`${backend_URI}/game/${game}/score`);

		console.log("Response from Backend");
		console.log(response.data);
		return baseApiResponse(response.data.data, true);
	} catch (error) {
		console.error(error);
		return baseApiResponse(null, false);
	}
};

// add comment to score post
export const addComment = async (input) => {
	try {
		const { game, scoreId, author, text } = input;
		const response = await axios.post(
			`${backend_URI}/game/${game}/score/${scoreId}/comment`,
			{ author, text },
		);

		console.log("Response from Backend");
		console.log(response.data);
		return baseApiResponse(response.data.data, true);
	} catch (error) {
		console.error(error);
		return baseApiResponse(null, false);
	}
};

// get global leaderboard
export const getGlobalLeaderboard = async (options = {}) => {
	try {
		const { limit = 10 } = options;
		const response = await axios.get(
			`${backend_URI}/game/leaderboard?limit=${limit}`,
		);

		console.log("Response from Backend");
		console.log(response.data);
		return baseApiResponse(response.data.data, true);
	} catch (error) {
		console.error(error);
		return baseApiResponse(null, false);
	}
};

// get game-specific leaderboard
export const getGameLeaderboard = async (gameCode, options = {}) => {
	try {
		const { timeFrame = "all", limit = 10 } = options;
		const response = await axios.get(
			`${backend_URI}/game/${gameCode}/leaderboard?timeFrame=${timeFrame}&limit=${limit}`,
		);

		console.log("Response from Backend");
		console.log(response.data);
		return {
			success: true,
			data: response.data.data,
			gameInfo: response.data.gameInfo,
			stats: response.data.stats,
		};
	} catch (error) {
		console.error(error);
		return baseApiResponse(null, false);
	}
};

// get all game types
export const getAllGameTypes = async () => {
	try {
		const response = await axios.get(`${backend_URI}/game-types`);

		console.log("Response from Backend");
		console.log(response.data);
		return baseApiResponse(response.data.data, true);
	} catch (error) {
		console.error(error);
		return baseApiResponse(null, false);
	}
};

// get game type by code
export const getGameTypeByCode = async (gameCode) => {
	try {
		const response = await axios.get(`${backend_URI}/game-types/${gameCode}`);

		console.log("Response from Backend");
		console.log(response.data);
		return baseApiResponse(response.data.data, true);
	} catch (error) {
		console.error(error);
		return baseApiResponse(null, false);
	}
};

// get user game stats
export const getUserGameStats = async (userId) => {
	try {
		const response = await axios.get(`${backend_URI}/user/${userId}/stats`);

		console.log("Response from Backend");
		console.log(response.data);
		return {
			success: true,
			user: response.data.user,
			overall: response.data.overall,
			games: response.data.games,
		};
	} catch (error) {
		console.error(error);
		return baseApiResponse(null, false);
	}
};
