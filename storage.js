const STORAGE_KEY = "neon-casino-state-v2";

function getCasinoState() {
	const defaultState = {
		coins: 1000,
		selectedBet: 10,
		currentReels: ["🍒", "🍋", "💎"],
		lastSlotMessage: "",
		lastJackpotMessage: "",
		lastBlackjackMessage: ""
	};

	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (!saved) return defaultState;

		const parsed = JSON.parse(saved);
		return {
			...defaultState,
			...parsed,
			coins: Number.isFinite(parsed.coins) ? parsed.coins : defaultState.coins,
			selectedBet: [10, 25, 50, 100].includes(parsed.selectedBet) ? parsed.selectedBet : defaultState.selectedBet,
			currentReels: Array.isArray(parsed.currentReels) && parsed.currentReels.length === 3 ? parsed.currentReels : defaultState.currentReels
		};
	} catch {
		return defaultState;
	}
}

function saveCasinoState(state) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
