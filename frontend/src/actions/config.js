import axios from "axios";
import { Cookies } from "react-cookie";

export const backend_URI =
	window.location.hostname === "localhost"
		? "http://localhost:8080"
		: "https://sbd-numbrhunt.jpmd53.easypanel.host";

const cookies = new Cookies();

// Shared axios instance used by every action. A request interceptor attaches
// the JWT from the `token` cookie as a Bearer header; a response interceptor
// clears the session and bounces to /login when the server rejects an expired
// or invalid token (401).
export const api = axios.create({ baseURL: backend_URI });

api.interceptors.request.use((config) => {
	const token = cookies.get("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		const status = error.response && error.response.status;
		const url = (error.config && error.config.url) || "";
		const isAuthEndpoint =
			url.includes("/user/login") || url.includes("/user/addUser");

		// Only treat 401s as session expiry when we actually had a token and the
		// failing request wasn't the login/register attempt itself (so a bad
		// login still shows its inline error instead of redirecting).
		if (status === 401 && cookies.get("token") && !isAuthEndpoint) {
			const opts = { path: "/" };
			cookies.remove("token", opts);
			cookies.remove("user_id", opts);
			cookies.remove("username", opts);
			cookies.remove("isLoggedIn", opts);
			cookies.remove("score", opts);
			if (window.location.pathname !== "/login") {
				window.location.assign("/login");
			}
		}
		return Promise.reject(error);
	},
);
