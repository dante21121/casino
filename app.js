const state = getCasinoState();

const views = Array.from(document.querySelectorAll(".view"));
const gameCards = Array.from(document.querySelectorAll(".game-card"));
const backButtons = Array.from(document.querySelectorAll("[data-back]"));
const betButtons = Array.from(document.querySelectorAll(".bet-btn"));

const homeCoins = document.getElementById("homeCoins");
const slotCoins = document.getElementById("slotCoins");
const jackpotCoins = document.getElementById("jackpotCoins");
const blackjackCoins = document.getElementById("blackjackCoins");

const homeSelectedBet = document.getElementById("homeSelectedBet");
const slotBetLabel = document.getElementById("slotBetLabel");
const blackjackBetLabel = document.getElementById("blackjackBetLabel");

const reels = [
	document.getElementById("reel1"),
	document.getElementById("reel2"),
	document.getElementById("reel3")
];

const slotMessage = document.getElementById("slotMessage");
const jackpotMessage = document.getElementById("jackpotMessage");
const blackjackMessage = document.getElementById("blackjackMessage");

const spinSlotBtn = document.getElementById("spinSlotBtn");
const spinJackpotBtn = document.getElementById("spinJackpotBtn");
const bjNewRoundBtn = document.getElementById("bjNewRoundBtn");
const bjHitBtn = document.getElementById("bjHitBtn");
const bjStandBtn = document.getElementById("bjStandBtn");

const jackpotGrid = document.getElementById("jackpotGrid");

const dealerHandEl = document.getElementById("dealerHand");
const playerHandEl = document.getElementById("playerHand");
const dealerScoreEl = document.getElementById("dealerScore");
const playerScoreEl = document.getElementById("playerScore");

const blackjackActions =
	document.getElementById(
		"blackjackActions"
	);

const symbols = ["🍒", "🍋", "🔔", "💎", "7️⃣", "🍀", "⭐"];
const jackpotPool = [0, 0, 10, 10, 25, 25, 50, 100, 250, 500];

const slotSymbolMeta = {
	"🍒": { name: "Cereza", mult: 10 },
	"🍋": { name: "Lima", mult: 10 },
	"🔔": { name: "Campana", mult: 12 },
	"💎": { name: "Diamante", mult: 18 },
	"7️⃣": { name: "Siete", mult: 30 },
	"🍀": { name: "Suerte", mult: 10 },
	"⭐": { name: "Estrella", mult: 14 }
};

let selectedBet = state.selectedBet;
let slotBusy = false;
let jackpotBusy = false;
let currentReels = state.currentReels;
let jackpotBoard = createJackpotBoard();

let blackjack = createBlackjackState();

renderJackpotGrid();
renderBlackjack();
renderAll();
syncBetUI();
showView("homeView");

gameCards.forEach(card => {
	card.addEventListener("click", () => showView(card.dataset.view));
});

backButtons.forEach(btn => {
	btn.addEventListener("click", () => showView("homeView"));
});

betButtons.forEach(button => {
	button.addEventListener("click", () => {
		selectedBet = Number(button.dataset.bet);
		state.selectedBet = selectedBet;
		saveCasinoState(state);
		syncBetUI();
		renderBalance();
		renderBetLabels();
	});
});

spinSlotBtn.addEventListener("click", spinSlot);
spinJackpotBtn.addEventListener("click", spinJackpot);
bjNewRoundBtn.addEventListener("click", startBlackjackRound);
bjHitBtn.addEventListener("click", blackjackHit);
bjStandBtn.addEventListener("click", blackjackStand);

function showView(viewId) {
	views.forEach(view => view.classList.toggle("active", view.id === viewId));
	All();
}

function All() {
	Balance();
	BetLabels();
	SlotReels();
	SlotMessage();
	JackpotMessage();
	JackpotGrid();
	Blackjack();
}

function renderBalance() {
	const coins = formatCoins(state.coins);
	homeCoins.textContent = coins;
	slotCoins.textContent = coins;
	jackpotCoins.textContent = coins;
	blackjackCoins.textContent = coins;
}

function renderBetLabels() {
	homeSelectedBet.textContent = selectedBet;
	slotBetLabel.textContent = selectedBet;
	blackjackBetLabel.textContent = selectedBet;
}

function syncBetUI() {
	betButtons.forEach(button => {
		button.classList.toggle("active", Number(button.dataset.bet) === selectedBet);
	});
}

function renderSlotReels() {
	reels.forEach((reel, index) => {
		reel.textContent = currentReels[index] || "❔";
	});
}

function renderSlotMessage(text) {
	if (typeof text === "string") {
		slotMessage.textContent = text;
		state.lastSlotMessage = text;
		saveCasinoState(state);
		return;
	}
	slotMessage.textContent = state.lastSlotMessage || "Elegí una apuesta y girá.";
}

function createJackpotBoard() {
	const board = Array.from({ length: 9 }, () => ({
		prize: pickJackpotPrize(),
		revealed: false
	}));

	const bigIndex = Math.floor(Math.random() * board.length);
	board[bigIndex].prize = 500;
	return board;
}

function pickJackpotPrize() {
	return jackpotPool[Math.floor(Math.random() * jackpotPool.length)];
}

function renderJackpotGrid() {
	jackpotGrid.innerHTML = "";
	jackpotBoard.forEach((tile, index) => {
		const btn = document.createElement("button");
		btn.className = "jackpot-tile";
		btn.type = "button";
		btn.dataset.index = String(index);
		btn.innerHTML = `<div><strong>?</strong><span class="tiny">jackpot</span></div>`;
		jackpotGrid.appendChild(btn);
	});
}

function paintJackpotGrid(activeIndex = -1, reveal = false, winnerIndex = -1) {
	const tiles = Array.from(document.querySelectorAll(".jackpot-tile"));
	tiles.forEach((tile, index) => {
		tile.classList.toggle("active", index === activeIndex);
		tile.classList.toggle("win", index === winnerIndex);
		const prize = jackpotBoard[index].prize;
		if (reveal) {
			tile.innerHTML = `<div><strong>${prize > 0 ? "+" + prize : "0"}</strong><span class="tiny">${index + 1}</span></div>`;
		} else {
			tile.innerHTML = `<div><strong>?</strong><span class="tiny">premio</span></div>`;
		}
	});
}

function renderJackpotMessage(text) {
	if (typeof text === "string") {
		jackpotMessage.textContent = text;
		state.lastJackpotMessage = text;
		saveCasinoState(state);
		return;
	}
	jackpotMessage.textContent = state.lastJackpotMessage || "Tocá abrir jackpot.";
}

async function spinSlot() {
	if (slotBusy) return;
	if (state.coins < selectedBet) {
		renderSlotMessage("No tenés monedas suficientes.");
		return;
	}

	slotBusy = true;
	spinSlotBtn.disabled = true;
	state.coins -= selectedBet;
	saveCasinoState(state);
	renderBalance();
	renderSlotMessage("Girá...");
	const duration = 900;
	const interval = 75;
	const loops = Math.floor(duration / interval);

	let lastFrame = ["", "", ""];
	for (let i = 0; i < loops; i++) {
		const frame = [
			getDifferentSymbol(lastFrame[0]),
			getDifferentSymbol(lastFrame[1]),
			getDifferentSymbol(lastFrame[2])
		];
		lastFrame = frame;
		currentReels = frame;
		renderSlotReels();
		await wait(interval);
	}

	const final = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
	currentReels = final;
	state.currentReels = final;

	const { payout, message } = evaluateSlot(final, selectedBet);
	state.coins += payout;
	saveCasinoState(state);

	renderBalance();
	renderSlotReels();
	renderSlotMessage(message);
	spinSlotBtn.disabled = false;
	slotBusy = false;
}

function evaluateSlot(result, bet) {
	const [a, b, c] = result;
	const sameThree = a === b && b === c;
	const sameTwo = a === b || a === c || b === c;

	if (sameThree) {
		const mult = slotSymbolMeta[a]?.mult || 10;
		const payout = bet * mult;
		return { payout, message: `Triple ${a}. Ganaste ${formatCoins(payout)} monedas.` };
	}

	if (sameTwo) {
		const payout = bet * 2;
		return { payout, message: `Doble combinación. Ganaste ${formatCoins(payout)} monedas.` };
	}

	return { payout: 0, message: "Sin combinación. Probá otra vez." };
}

function getRandomSymbol() {
	return symbols[Math.floor(Math.random() * symbols.length)];
}

function getDifferentSymbol(last) {
	if (symbols.length <= 1) return symbols[0];
	let choice = getRandomSymbol();
	let guard = 0;
	while (choice === last && guard < 12) {
		choice = getRandomSymbol();
		guard++;
	}
	return choice;
}

async function spinJackpot() {
	if (jackpotBusy) return;
	const cost = 50;
	if (state.coins < cost) {
		renderJackpotMessage("No tenés monedas suficientes.");
		return;
	}

	jackpotBusy = true;
	spinJackpotBtn.disabled = true;
	state.coins -= cost;
	saveCasinoState(state);
	renderBalance();
	renderJackpotMessage("Abriendo jackpot...");

	jackpotBoard = createJackpotBoard();
	renderJackpotGrid();

	const tiles = Array.from(document.querySelectorAll(".jackpot-tile"));
	let active = 0;

	for (let i = 0; i < 26; i++) {
		paintJackpotGrid(active, false, -1);
		active = (active + 1) % tiles.length;
		await wait(i < 12 ? 55 : i < 20 ? 80 : 110);
	}

	const winnerIndex = Math.floor(Math.random() * jackpotBoard.length);
	const prize = jackpotBoard[winnerIndex].prize;

	paintJackpotGrid(-1, true, winnerIndex);

	state.coins += prize;
	saveCasinoState(state);
	renderBalance();
	renderJackpotMessage(prize > 0 ? `Ganaste ${formatCoins(prize)} monedas.` : "Esta vez no salió premio.");

	spinJackpotBtn.disabled = false;
	jackpotBusy = false;
}

function createBlackjackState() {
	return {
		deck: [],
		player: [],
		dealer: [],
		inRound: false,
		revealDealer: false,
		message: state.lastBlackjackMessage || "Elegí una apuesta y tocá “Nueva ronda”."
	};
}

function buildDeck() {
	const suits = ["♠", "♥", "♦", "♣"];
	const ranks = [
		{ rank: "A", value: 11 },
		{ rank: "2", value: 2 },
		{ rank: "3", value: 3 },
		{ rank: "4", value: 4 },
		{ rank: "5", value: 5 },
		{ rank: "6", value: 6 },
		{ rank: "7", value: 7 },
		{ rank: "8", value: 8 },
		{ rank: "9", value: 9 },
		{ rank: "10", value: 10 },
		{ rank: "J", value: 10 },
		{ rank: "Q", value: 10 },
		{ rank: "K", value: 10 }
	];

	const deck = [];
	suits.forEach(suit => {
		ranks.forEach(card => {
			deck.push({ ...card, suit });
		});
	});

	for (let i = deck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[deck[i], deck[j]] = [deck[j], deck[i]];
	}

	return deck;
}

function drawCard() {
	return blackjack.deck.pop();
}

function scoreHand(hand) {
	let total = hand.reduce((sum, card) => sum + card.value, 0);
	let aces = hand.filter(card => card.rank === "A").length;

	while (total > 21 && aces > 0) {
		total -= 10;
		aces--;
	}
	return total;
}

function renderCard(card, hidden = false) {
	const el = document.createElement("div");
	el.className = "bj-card" + (hidden ? " back" : "");
	if (hidden) {
		el.textContent = "★";
		return el;
	}
	el.classList.toggle("red", card.suit === "♥" || card.suit === "♦");
	el.innerHTML = `<span class="rank">${card.rank}</span><span class="suit">${card.suit}</span>`;
	return el;
}

function renderBlackjack() {

	dealerHandEl.innerHTML = "";
	playerHandEl.innerHTML = "";

	if (
		!blackjack.player.length &&
		!blackjack.dealer.length
	) {

		dealerScoreEl.textContent = "0";
		playerScoreEl.textContent = "0";

		blackjackMessage.textContent =
			blackjack.message;

		bjNewRoundBtn.style.display =
			"block";

		bjHitBtn.style.display =
			"none";

		bjStandBtn.style.display =
			"none";

		blackjackActions.classList.add(
			"single"
		);

		return;
	}

	const dealerScore =
		scoreHand(
			blackjack.dealer
		);

	const playerScore =
		scoreHand(
			blackjack.player
		);

	dealerScoreEl.textContent =
		blackjack.revealDealer
			? dealerScore
			: (
				blackjack.dealer.length
				? scoreHand([
					blackjack.dealer[0]
				])
				: 0
			);

	playerScoreEl.textContent =
		playerScore;

	blackjack.dealer.forEach(
		(card, index) => {

			const hidden =
				blackjack.inRound &&
				!blackjack.revealDealer &&
				index === 1;

			dealerHandEl.appendChild(
				renderCard(
					card,
					hidden
				)
			);
		}
	);

	blackjack.player.forEach(
		card => {

			playerHandEl.appendChild(
				renderCard(
					card,
					false
				)
			);
		}
	);

	blackjackMessage.textContent =
		blackjack.message;

	if (
		blackjack.inRound
	) {

		bjNewRoundBtn.style.display =
			"none";

		bjHitBtn.style.display =
			"block";

		bjStandBtn.style.display =
			"block";

		blackjackActions.classList.remove(
			"single"
		);

	} else {

		bjNewRoundBtn.style.display =
			"block";

		bjHitBtn.style.display =
			"none";

		bjStandBtn.style.display =
			"none";

		blackjackActions.classList.add(
			"single"
		);
	}
}

function startBlackjackRound() {
	const bet = selectedBet;
	if (state.coins < bet) {
		blackjack.message = "No tenés monedas suficientes.";
		renderBlackjack();
		return;
	}

	state.coins -= bet;
	saveCasinoState(state);
	renderBalance();

	blackjack.deck = buildDeck();
	blackjack.player = [drawCard(), drawCard()];
	blackjack.dealer = [drawCard(), drawCard()];
	blackjack.inRound = true;
	blackjack.revealDealer = false;
	blackjack.message = `Ronda en curso. Apuesta: ${formatCoins(bet)}.`;

	saveCasinoState(state);
	renderBlackjack();

	const playerScore = scoreHand(blackjack.player);
	if (playerScore === 21) {
		finishBlackjack(true, true);
	}
}

function blackjackHit() {
	if (!blackjack.inRound) return;

	blackjack.player.push(drawCard());
	const score = scoreHand(blackjack.player);

	if (score > 21) {
		blackjack.revealDealer = true;
		blackjack.inRound = false;
		blackjack.message = "Te pasaste de 21. Perdiste.";
		state.lastBlackjackMessage = blackjack.message;
		saveCasinoState(state);
		renderBlackjack();
		return;
	}

	blackjack.message = `Tu mano: ${score}. Podés pedir o plantarte.`;
	state.lastBlackjackMessage = blackjack.message;
	saveCasinoState(state);
	renderBlackjack();
}

function blackjackStand() {
	if (!blackjack.inRound) return;

	blackjack.revealDealer = true;

	let dealerScore = scoreHand(blackjack.dealer);
	const playerScore = scoreHand(blackjack.player);

	while (dealerScore < 17) {
		blackjack.dealer.push(drawCard());
		dealerScore = scoreHand(blackjack.dealer);
	}

	if (dealerScore > 21 || playerScore > dealerScore) {
		finishBlackjack(true, false);
		return;
	}

	if (dealerScore === playerScore) {
		finishBlackjack(false, false, true);
		return;
	}

	finishBlackjack(false, false);
}

function finishBlackjack(playerWon, natural = false, push = false) {
	const bet = selectedBet;
	blackjack.inRound = false;
	blackjack.revealDealer = true;

	if (push) {
		state.coins += bet;
		blackjack.message = "Empate. Se devolvió la apuesta.";
	} else if (playerWon && natural) {
		const payout = Math.floor(bet * 2.5);
		state.coins += payout;
		blackjack.message = `Blackjack natural. Ganaste ${formatCoins(payout)} monedas.`;
	} else if (playerWon) {
		const payout = bet * 2;
		state.coins += payout;
		blackjack.message = `Ganaste ${formatCoins(payout)} monedas.`;
	} else {
		blackjack.message = "Perdiste la ronda.";
	}

	state.lastBlackjackMessage = blackjack.message;
	saveCasinoState(state);
	renderBalance();
	renderBlackjack();
}

function formatCoins(value) {
	return new Intl.NumberFormat("es-AR").format(value);
}

function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
