const storageKey = "neon-casino-state-v1";

const reels = [
	document.getElementById("reel1"),
	document.getElementById("reel2"),
	document.getElementById("reel3")
];

const homeCoins = document.getElementById("homeCoins");
const slotCoins = document.getElementById("slotCoins");
const jackpotCoins = document.getElementById("jackpotCoins");

const slotMessage = document.getElementById("slotMessage");
const jackpotMessage = document.getElementById("jackpotMessage");

const spinSlotBtn = document.getElementById("spinSlotBtn");
const spinJackpotBtn = document.getElementById("spinJackpotBtn");

const betButtons = Array.from(document.querySelectorAll(".bet-btn"));
const gameCards = Array.from(document.querySelectorAll(".game-card"));
const backButtons = Array.from(document.querySelectorAll("[data-back]"));

const views = Array.from(document.querySelectorAll(".view"));

const jackpotGrid = document.getElementById("jackpotGrid");

const symbols = [
	{ icon: "🍒", name: "Cereza", weight: 10, payout: 8 },
	{ icon: "🍋", name: "Lima", weight: 10, payout: 8 },
	{ icon: "🔔", name: "Campana", weight: 8, payout: 12 },
	{ icon: "💎", name: "Diamante", weight: 5, payout: 18 },
	{ icon: "7️⃣", name: "Siete", weight: 3, payout: 30 },
	{ icon: "🍀", name: "Suerte", weight: 8, payout: 10 },
	{ icon: "⭐", name: "Estrella", weight: 6, payout: 14 }
];

const jackpotPrizes = [
	0, 0, 0, 10, 20, 25, 50, 80, 100, 150, 250, 500, 1000
];

const state = loadState();

let slotBusy = false;
let jackpotBusy = false;
let selectedBet = state.selectedBet || 10;
let currentView = "homeView";
let currentReels = state.currentReels || ["🍒", "🍋", "💎"];

renderJackpotGrid();
renderAll();
showView("homeView");
syncBetUI();

gameCards.forEach(card => {
	card.addEventListener("click", () => {
		showView(card.dataset.view);
	});
});

backButtons.forEach(btn => {
	btn.addEventListener("click", () => {
		showView("homeView");
	});
});

betButtons.forEach(button => {
	button.addEventListener("click", () => {
		selectedBet = Number(button.dataset.bet);
		state.selectedBet = selectedBet;
		saveState();
		syncBetUI();
	});
});

spinSlotBtn.addEventListener("click", spinSlot);
spinJackpotBtn.addEventListener("click", spinJackpot);

function showView(viewId) {
	currentView = viewId;
	views.forEach(view => {
		view.classList.toggle("active", view.id === viewId);
	});
	renderAll();
}

function renderAll() {
	updateBalanceUI();
	renderSlotReels();
	renderSlotMessage();
	renderJackpotMessage();
}

function updateBalanceUI() {
	homeCoins.textContent = formatCoins(state.coins);
	slotCoins.textContent = formatCoins(state.coins);
	jackpotCoins.textContent = formatCoins(state.coins);
}

function renderSlotReels() {
	reels.forEach((reel, index) => {
		reel.textContent = currentReels[index] || "❔";
	});
}

function renderSlotMessage(text) {
	if (typeof text === "string") {
		slotMessage.textContent = text;
		return;
	}

	if (!state.lastSlotMessage) {
		slotMessage.textContent = "Elegí una apuesta y girá.";
		return;
	}

	slotMessage.textContent = state.lastSlotMessage;
}

function renderJackpotMessage(text) {
	if (typeof text === "string") {
		jackpotMessage.textContent = text;
		return;
	}

	if (!state.lastJackpotMessage) {
		jackpotMessage.textContent = "Tocá “Abrir jackpot”.";
		return;
	}

	jackpotMessage.textContent = state.lastJackpotMessage;
}

function syncBetUI() {
	betButtons.forEach(button => {
		button.classList.toggle(
			"active",
			Number(button.dataset.bet) === selectedBet
		);
	});
}

async function spinSlot() {
	if (slotBusy) return;

	if (state.coins < selectedBet) {
		renderSlotMessage("No tenés monedas suficientes.");
		return;
	}

	slotBusy = true;
	state.coins -= selectedBet;
	state.lastSlotMessage = "Girando...";
	saveState();
	updateBalanceUI();
	renderSlotMessage("Girando...");
	spinSlotBtn.disabled = true;

	const duration = 900;
	const interval = 70;
	const cycles = Math.floor(duration / interval);

	let lastFrame = ["", "", ""];

	for (let i = 0; i < cycles; i++) {
		const frame = [
			pickDifferentSymbol(lastFrame[0]),
			pickDifferentSymbol(lastFrame[1]),
			pickDifferentSymbol(lastFrame[2])
		];

		lastFrame = frame;
		currentReels = frame;
		renderSlotReels();
		await wait(interval);
	}

	const final = [
		pickWeightedSymbol(),
		pickWeightedSymbol(),
		pickWeightedSymbol()
	];

	currentReels = final;
	renderSlotReels();

	const result = evaluateSlot(final, selectedBet);

	state.coins += result.payout;
	state.lastSlotMessage = result.message;
	saveState();
	updateBalanceUI();
	renderSlotMessage(result.message);

	spinSlotBtn.disabled = false;
	slotBusy = false;
}

function evaluateSlot(final, bet) {
	const a = final[0];
	const b = final[1];
	const c = final[2];

	const sameThree = a === b && b === c;
	const sameTwo = a === b || a === c || b === c;

	if (sameThree) {
		const multiplier = a === "7️⃣" ? 30 : a === "💎" ? 18 : a === "🔔" ? 12 : 10;
		const payout = bet * multiplier;
		return {
			payout,
			message: `¡Triple ${a}! Ganaste ${formatCoins(payout)} monedas.`
		};
	}

	if (sameTwo) {
		const payout = bet * 3;
		return {
			payout,
			message: `¡Doble combinación! Ganaste ${formatCoins(payout)} monedas.`
		};
	}

	return {
		payout: 0,
		message: "Sin combinación. Probá otra vez."
	};
}

function pickWeightedSymbol() {
	const pool = [];
	symbols.forEach(symbol => {
		for (let i = 0; i < symbol.weight; i++) {
			pool.push(symbol.icon);
		}
	});
	return pool[Math.floor(Math.random() * pool.length)];
}

function pickDifferentSymbol(last) {
	if (symbols.length === 0) return "❔";
	if (symbols.length === 1) return symbols[0].icon;

	let choice = pickWeightedSymbol();
	let guard = 0;

	while (choice === last && guard < 12) {
		choice = pickWeightedSymbol();
		guard++;
	}

	return choice;
}

function buildJackpotTile(index, prize) {
	const tile = document.createElement("button");
	tile.className = "jackpot-tile";
	tile.type = "button";
	tile.dataset.index = String(index);
	tile.textContent = "❔";
	return tile;
}

function renderJackpotGrid() {
	jackpotGrid.innerHTML = "";

	jackpotPrizes.forEach((prize, index) => {
		jackpotGrid.appendChild(buildJackpotTile(index, prize));
	});
}

async function spinJackpot() {
	if (jackpotBusy) return;

	const cost = 50;

	if (state.coins < cost) {
		renderJackpotMessage("No tenés monedas suficientes.");
		return;
	}

	jackpotBusy = true;
	state.coins -= cost;
	state.lastJackpotMessage = "Abriendo jackpot...";
	saveState();
	updateBalanceUI();
	renderJackpotMessage("Abriendo jackpot...");
	spinJackpotBtn.disabled = true;

	const tiles = Array.from(document.querySelectorAll(".jackpot-tile"));

	let active = 0;
	let duration = 1400;
	let interval = 55;

	for (let elapsed = 0; elapsed < duration; elapsed += interval) {
		tiles.forEach(tile => tile.classList.remove("active"));
		tiles[active].classList.add("active");
		active = (active + 1) % tiles.length;

		await wait(interval);
		if (elapsed > 900) interval = 85;
		if (elapsed > 1120) interval = 120;
	}

	const finalIndex = Math.floor(Math.random() * jackpotPrizes.length);
	const prize = jackpotPrizes[finalIndex];

	tiles.forEach(tile => tile.classList.remove("active"));
	tiles[finalIndex].classList.add("active");

	state.coins += prize;
	state.lastJackpotMessage =
		prize > 0
			? `Ganaste ${formatCoins(prize)} monedas.`
			: "Esta vez no salió premio.";

	saveState();
	updateBalanceUI();
	renderJackpotMessage(state.lastJackpotMessage);

	spinJackpotBtn.disabled = false;
	jackpotBusy = false;
}

function formatCoins(value) {
	return new Intl.NumberFormat("es-AR").format(value);
}

function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function saveState() {
	localStorage.setItem(storageKey, JSON.stringify(state));
}

function loadState() {
	const fallback = {
		coins: 1000,
		selectedBet: 10,
		currentReels: ["🍒", "🍋", "💎"],
		lastSlotMessage: "",
		lastJackpotMessage: ""
	};

	try {
		const raw = localStorage.getItem(storageKey);
		if (!raw) return fallback;

		const parsed = JSON.parse(raw);

		return {
			...fallback,
			...parsed,
			coins: Number.isFinite(parsed.coins) ? parsed.coins : fallback.coins,
			selectedBet: [10, 25, 50, 100].includes(parsed.selectedBet) ? parsed.selectedBet : fallback.selectedBet,
			currentReels: Array.isArray(parsed.currentReels) && parsed.currentReels.length === 3
				? parsed.currentReels
				: fallback.currentReels
		};
	} catch {
		return fallback;
	}
}
