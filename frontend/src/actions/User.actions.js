import { api, backend_URI } from "./config";

const baseApiResponse = (data, isSuccess) => {
	return {
		success: isSuccess,
		data: data || null,
	};
};

// login
export const loginUser = async (input) => {
	try {
		const response = await api.post(`${backend_URI}/user/login`, input);

		return {
			success: true,
			data: response.data.data,
			token: response.data.token,
		};
	} catch (error) {
		console.error(error);
		return baseApiResponse(null, false);
	}
};

// sign up
export const signUpUser = async (input) => {
	try {
		const response = await api.post(`${backend_URI}/user/addUser`, input);

		return {
			success: true,
			data: response.data.data,
			token: response.data.token,
		};
	} catch (error) {
		console.error(error);
		return baseApiResponse(null, false);
	}
};
