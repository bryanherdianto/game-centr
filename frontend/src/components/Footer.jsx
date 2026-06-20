export default function Footer() {
	return (
		<footer className="bg-surface border-t border-border-subtle text-text-secondary py-12 text-center">
			<p className="text-sm">© {new Date().getFullYear()} GameCentr</p>
			<p className="text-sm text-text-tertiary mt-2">
				Play all of the games and show off your skills!
			</p>
		</footer>
	);
}
