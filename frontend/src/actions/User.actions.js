import axios from "axios";
import { backend_URI } from "./config";

const baseApiResponse = (data, isSuccess) => {
	return {
		success: isSuccess,
		data: data || null,
	};
};

// login
export const loginUser = async (input) => {
	try {
		const response = await axios.post(`${backend_URI}/user/login`, input);

		return baseApiResponse(response.data.data, true);
	} catch (error) {
		console.error(error);
		return baseApiResponse(null, false);
	}
};

// sign up
export const signUpUser = async (input) => {
	try {
		const response = await axios.post(`${backend_URI}/user/addUser`, input);

		return baseApiResponse(response.data.data, true);
	} catch (error) {
		console.error(error);
		return baseApiResponse(null, false);
	}
};
