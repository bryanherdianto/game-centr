// HangmanCanvas.js

import React from "react";

const HangmanCanvas = ({ mistakes }) => {
	return (
		<div className="hangman-container-drawing">
			{/* Gallows */}
			<div className="gallows-base"></div>
			<div className="gallows-pole"></div>
			<div className="gallows-top"></div>
			<div className="gallows-rope"></div>

			{/* Hangman parts that appear based on mistakes */}
			{mistakes >= 1 && <div className="hangman-head"></div>}
			{mistakes >= 2 && <div className="hangman-body"></div>}
			{mistakes >= 3 && <div className="hangman-arm hangman-left-arm"></div>}
			{mistakes >= 4 && <div className="hangman-arm hangman-right-arm"></div>}
			{mistakes >= 5 && <div className="hangman-leg hangman-left-leg"></div>}
			{mistakes >= 6 && <div className="hangman-leg hangman-right-leg"></div>}
		</div>
	);
};

export default HangmanCanvas;
