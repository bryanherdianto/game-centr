export default function CommentCard({ username, text }) {
	return (
		<div className="border-t border-border-subtle pt-3">
			<div className="flex items-start space-x-3">
				<div className="flex-shrink-0">
					<div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-background text-xl font-bold leading-none">
						{username.charAt(0).toUpperCase()}
					</div>
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-sm font-semibold text-ink">{username}</p>
					<p className="text-sm text-text-secondary">{text}</p>
				</div>
			</div>
		</div>
	);
}
