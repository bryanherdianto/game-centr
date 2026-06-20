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

// login
export const loginUser = async (input) => {
	try {
		const response = await axios.post(`${backend_URI}/user/login`, input);

		console.log("Response from Backend");
		console.log(response.data);
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

		console.log("Response from Backend");
		console.log(response.data);
		return baseApiResponse(response.data.data, true);
	} catch (error) {
		console.error(error);
		return baseApiResponse(null, false);
	}
};
