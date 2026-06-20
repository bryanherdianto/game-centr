import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { loginUser } from "../actions/User.actions";

export default function Login() {
	const navigate = useNavigate();

	const [cookies, setCookies] = useCookies([
		"user_id",
		"username",
		"isLoggedIn",
		"score",
	]);
	const [formData, setFormData] = useState({
		username: cookies.username || "",
		password: "",
	});

	useEffect(() => {
		if (cookies.isLoggedIn) {
			navigate("/game");
		}
	}, [cookies.isLoggedIn, navigate]);

	const change = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const submitData = (event) => {
		event.preventDefault();
		console.log("formData:", formData);

		loginUser(formData)
			.then((response) => {
				if (response.data) {
					console.log(response);
					setCookies("user_id", response.data._id, { path: "/" });
					setCookies("username", response.data.username, { path: "/" });
					setCookies("isLoggedIn", true, { path: "/" });
					setCookies("score", 0, { path: "/" });
					navigate("/game");
				} else {
					console.error("Failed to login");
				}
			})
			.catch((error) => {
				console.error("Login failed:", error.message);
			});
	};

	return (
		<>
			<div className="min-h-screen flex items-center justify-center bg-background py-16 px-4 sm:px-6 lg:px-8">
				<div className="max-w-md w-full bg-background border border-border-subtle p-9">
					<h2 className="text-center text-3xl font-serif text-ink mb-10">
						Login to GameCentr
					</h2>

					<form onSubmit={submitData} className="space-y-6">
						<div>
							<label className="block text-[13px] font-semibold text-text-secondary mb-2">
								Username
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-tertiary">
									<i className="fas fa-user"></i>
								</div>
								<input
									name="username"
									type="text"
									onChange={change}
									value={formData.username}
									placeholder="Username"
									required
									className="h-12 w-full bg-background border border-border-medium pl-11 pr-4 text-[15px] text-ink placeholder-text-tertiary focus:border-primary focus-ring"
								/>
							</div>
						</div>

						<div>
							<label className="block text-[13px] font-semibold text-text-secondary mb-2">
								Password
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-tertiary">
									<i className="fas fa-lock"></i>
								</div>
								<input
									name="password"
									type="password"
									onChange={change}
									value={formData.password}
									placeholder="Password"
									required
									className="h-12 w-full bg-background border border-border-medium pl-11 pr-4 text-[15px] text-ink placeholder-text-tertiary focus:border-primary focus-ring"
								/>
							</div>
						</div>

						<div>
							<button
								type="submit"
								className="w-full bg-primary text-background px-6 py-3 font-semibold text-[15px] border border-primary hover:bg-primary-hover active:bg-primary-active"
							>
								Login
							</button>
						</div>

						<div className="text-center text-[15px] text-text-secondary">
							Not a member?{" "}
							<a
								href="/signup"
								className="text-primary hover:text-primary-hover font-medium"
							>
								Sign up
							</a>
						</div>
					</form>
				</div>
			</div>
		</>
	);
}
