import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
	return (
		<>
			<Navbar />
			<div className="min-h-[640px] flex flex-col items-center justify-center bg-background py-16 px-4 text-center">
				<h1 className="font-serif text-6xl text-ink mb-4">404</h1>
				<h2 className="text-2xl font-serif text-ink mb-3">Page Not Found</h2>
				<p className="text-text-secondary max-w-md mb-8">
					The page you are looking for doesn't exist or has been moved.
				</p>
				<Link
					to="/game"
					className="bg-primary text-background px-6 py-3 font-semibold text-[15px] border border-primary hover:bg-primary-hover active:bg-primary-active"
				>
					Back to Games
				</Link>
			</div>
			<Footer />
		</>
	);
}
