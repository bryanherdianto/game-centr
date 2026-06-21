import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { signUpUser } from "../actions/User.actions";

export default function SignUp() {
	const navigate = useNavigate();
	const [cookies] = useCookies(["isLoggedIn"]);

	useEffect(() => {
		if (cookies.isLoggedIn) {
			navigate("/game");
		}
	}, [cookies.isLoggedIn, navigate]);

	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const [error, setError] = useState("");

	const change = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const submitData = (event) => {
		event.preventDefault();
		setError("");

		signUpUser(formData)
			.then((response) => {
				if (response.data != null) {
					navigate("/login");
				} else {
					setError("Could not create account. Please try again.");
				}
			})
			.catch((err) => {
				console.error(err.message);
				setError("Could not create account. Please try again.");
			});
	};

	return (
		<>
			<div className="min-h-[640px] flex items-center justify-center bg-background py-16 px-4 sm:px-6 lg:px-8">
				<div className="max-w-md w-full bg-background border border-border-subtle p-9">
					<h2 className="text-center text-3xl font-serif text-ink mb-10">
						Create an Account
					</h2>

					<form onSubmit={submitData} className="space-y-6">
						{error && (
							<div className="bg-error-bg text-error border border-error-border text-[15px] px-4 py-3">
								{error}
							</div>
						)}
						<div>
							<label
								htmlFor="username"
								className="block text-[13px] font-semibold text-text-secondary mb-2"
							>
								Username
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-tertiary">
									<i className="fas fa-user"></i>
								</div>
								<input
									id="username"
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
							<label
								htmlFor="password"
								className="block text-[13px] font-semibold text-text-secondary mb-2"
							>
								Password
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-tertiary">
									<i className="fas fa-lock"></i>
								</div>
								<input
									id="password"
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
								Register
							</button>
						</div>

						<div className="text-center text-[15px] text-text-secondary">
							Already have an account?{" "}
							<a
								href="/login"
								className="text-primary hover:text-primary-hover font-medium"
							>
								Login
							</a>
						</div>
					</form>
				</div>
			</div>
		</>
	);
}
