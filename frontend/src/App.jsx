import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import GuessGame from "./pages/GuessGame";
import HangmanGame from "./pages/HangmanGame";
import Game from "./pages/Game";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Post from "./pages/Post";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import PongGame from "./pages/PongGame";
import TypingGame from "./pages/TypingGame";
import SimonSays from "./pages/SimonSays";
import MemoryMatch from "./pages/MemoryMatch";
import WhackAMole from "./pages/WhackAMole";
import ColorGuess from "./pages/ColorGuess";
import PatternRepeater from "./pages/PatternRepeater";
import QuickMathChallenge from "./pages/QuickMathChallenge";
import { AchievementProvider } from "./context/AchievementContext";

export default function App() {
	const [cookies] = useCookies(["isLoggedIn"]);

	return (
		<AchievementProvider>
			<BrowserRouter>
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
					<Route path="*" element={<Navigate to="/login" />} />
				</Routes>
			</BrowserRouter>
		</AchievementProvider>
	);
}
