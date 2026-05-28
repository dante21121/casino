const STORAGE_KEY =
	"neon-casino-state-v1";

function getCasinoState() {

	const defaultState = {

		coins: 1000,

		selectedBet: 10,

		currentReels: [
			"🍒",
			"🍋",
			"💎"
		],

		lastSlotMessage: "",

		lastJackpotMessage: ""
	};

	try {

		const saved =
			localStorage.getItem(
				STORAGE_KEY
			);

		if (!saved) {

			return defaultState;
		}

		return {
			...defaultState,
			...JSON.parse(saved)
		};

	} catch {

		return defaultState;
	}
}

function saveCasinoState(state) {

	localStorage.setItem(
		STORAGE_KEY,
		JSON.stringify(state)
	);
}
