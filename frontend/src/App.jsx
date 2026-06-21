import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { AchievementProvider } from "./context/AchievementContext";

const GuessGame = lazy(() => import("./pages/GuessGame"));
const HangmanGame = lazy(() => import("./pages/HangmanGame"));
const Game = lazy(() => import("./pages/Game"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Login = lazy(() => import("./pages/Login"));
const Post = lazy(() => import("./pages/Post"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Profile = lazy(() => import("./pages/Profile"));
const PongGame = lazy(() => import("./pages/PongGame"));
const TypingGame = lazy(() => import("./pages/TypingGame"));
const SimonSays = lazy(() => import("./pages/SimonSays"));
const MemoryMatch = lazy(() => import("./pages/MemoryMatch"));
const WhackAMole = lazy(() => import("./pages/WhackAMole"));
const ColorGuess = lazy(() => import("./pages/ColorGuess"));
const PatternRepeater = lazy(() => import("./pages/PatternRepeater"));
const QuickMathChallenge = lazy(() => import("./pages/QuickMathChallenge"));
const NotFound = lazy(() => import("./pages/NotFound"));

function LoadingFallback() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
		</div>
	);
}

export default function App() {
	const [cookies] = useCookies(["isLoggedIn"]);

	return (
		<AchievementProvider>
			<BrowserRouter>
				<Suspense fallback={<LoadingFallback />}>
					<Routes>
					<Route path="/signup" element={<SignUp />} />
					<Route path="/login" element={<Login />} />
					<Route
						path="/game"
						element={cookies.isLoggedIn ? <Game /> : <Navigate to="/login" />}
					/>
					<Route
						path="/game/guess"
						element={
							cookies.isLoggedIn ? <GuessGame /> : <Navigate to="/login" />
						}
					/>
					<Route
						path="/game/hang-man"
						element={
							cookies.isLoggedIn ? <HangmanGame /> : <Navigate to="/login" />
						}
					/>
					<Route
						path="/game/pong"
						element={
							cookies.isLoggedIn ? <PongGame /> : <Navigate to="/login" />
						}
					/>
					<Route
						path="/game/typing"
						element={
							cookies.isLoggedIn ? <TypingGame /> : <Navigate to="/login" />
						}
					/>
					<Route
						path="/game/simon-says"
						element={
							cookies.isLoggedIn ? <SimonSays /> : <Navigate to="/login" />
						}
					/>
					<Route
						path="/game/memory-match"
						element={
							cookies.isLoggedIn ? <MemoryMatch /> : <Navigate to="/login" />
						}
					/>
					<Route
						path="/game/whack-a-mole"
						element={
							cookies.isLoggedIn ? <WhackAMole /> : <Navigate to="/login" />
						}
					/>
					<Route
						path="/game/color-guess"
						element={
							cookies.isLoggedIn ? <ColorGuess /> : <Navigate to="/login" />
						}
					/>
					<Route
						path="/game/pattern-repeater"
						element={
							cookies.isLoggedIn ? (
								<PatternRepeater />
							) : (
								<Navigate to="/login" />
							)
						}
					/>
					<Route
						path="/game/quick-math"
						element={
							cookies.isLoggedIn ? (
								<QuickMathChallenge />
							) : (
								<Navigate to="/login" />
							)
						}
					/>
					<Route
						path="/post"
						element={cookies.isLoggedIn ? <Post /> : <Navigate to="/login" />}
					/>
					<Route
						path="/leaderboard"
						element={
							cookies.isLoggedIn ? <Leaderboard /> : <Navigate to="/login" />
						}
					/>
					<Route
						path="/profile"
						element={
							cookies.isLoggedIn ? <Profile /> : <Navigate to="/login" />
						}
					/>
					<Route path="*" element={<NotFound />} />
					</Routes>
				</Suspense>
			</BrowserRouter>
		</AchievementProvider>
	);
}
