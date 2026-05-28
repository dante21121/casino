const reels = [
	document.getElementById("reel1"),
	document.getElementById("reel2"),
	document.getElementById("reel3")
];

const homeCoins =
	document.getElementById("homeCoins");

const slotCoins =
	document.getElementById("slotCoins");

const jackpotCoins =
	document.getElementById("jackpotCoins");

const slotMessage =
	document.getElementById("slotMessage");

const jackpotMessage =
	document.getElementById("jackpotMessage");

const spinSlotBtn =
	document.getElementById("spinSlotBtn");

const spinJackpotBtn =
	document.getElementById("spinJackpotBtn");

const betButtons =
	Array.from(
		document.querySelectorAll(".bet-btn")
	);

const gameCards =
	Array.from(
		document.querySelectorAll(".game-card")
	);

const backButtons =
	Array.from(
		document.querySelectorAll("[data-back]")
	);

const views =
	Array.from(
		document.querySelectorAll(".view")
	);

const jackpotGrid =
	document.getElementById("jackpotGrid");

const symbols = [
	"🍒",
	"🍋",
	"🔔",
	"💎",
	"7️⃣",
	"🍀",
	"⭐"
];

const jackpotPrizes = [
	0,
	0,
	0,
	10,
	20,
	25,
	50,
	100,
	250,
	500
];

const state =
	getCasinoState();

let slotBusy = false;

let jackpotBusy = false;

let selectedBet =
	state.selectedBet || 10;

let currentReels =
	state.currentReels || [
		"🍒",
		"🍋",
		"💎"
	];

renderJackpotGrid();

renderAll();

showView("homeView");

syncBetUI();





gameCards.forEach(card => {

	card.addEventListener(
		"click",
		() => {

			showView(
				card.dataset.view
			);
		}
	);
});





backButtons.forEach(btn => {

	btn.addEventListener(
		"click",
		() => {

			showView("homeView");
		}
	);
});





betButtons.forEach(button => {

	button.addEventListener(
		"click",
		() => {

			selectedBet =
				Number(
					button.dataset.bet
				);

			state.selectedBet =
				selectedBet;

			saveCasinoState(state);

			syncBetUI();
		}
	);
});





spinSlotBtn.addEventListener(
	"click",
	spinSlot
);

spinJackpotBtn.addEventListener(
	"click",
	spinJackpot
);





function showView(viewId) {

	views.forEach(view => {

		view.classList.toggle(
			"active",
			view.id === viewId
		);
	});

	renderAll();
}





function renderAll() {

	updateBalanceUI();

	renderSlotReels();
}





function updateBalanceUI() {

	const formatted =
		formatCoins(state.coins);

	homeCoins.textContent =
		formatted;

	slotCoins.textContent =
		formatted;

	jackpotCoins.textContent =
		formatted;
}





function renderSlotReels() {

	reels.forEach(
		(reel, index) => {

			reel.textContent =
				currentReels[index];
		}
	);
}





function syncBetUI() {

	betButtons.forEach(button => {

		button.classList.toggle(
			"active",

			Number(
				button.dataset.bet
			) === selectedBet
		);
	});
}





async function spinSlot() {

	if (slotBusy) return;

	if (
		state.coins < selectedBet
	) {

		slotMessage.textContent =
			"No tenés monedas suficientes.";

		return;
	}

	slotBusy = true;

	spinSlotBtn.disabled = true;

	state.coins -= selectedBet;

	updateBalanceUI();

	saveCasinoState(state);

	const duration = 1200;

	const interval = 80;

	const loops =
		Math.floor(
			duration / interval
		);

	let lastFrame = [
		"",
		"",
		""
	];

	for (
		let i = 0;
		i < loops;
		i++
	) {

		const frame = [

			getDifferentSymbol(
				lastFrame[0]
			),

			getDifferentSymbol(
				lastFrame[1]
			),

			getDifferentSymbol(
				lastFrame[2]
			)
		];

		lastFrame = frame;

		currentReels = frame;

		renderSlotReels();

		await wait(interval);
	}

	const final = [

		getRandomSymbol(),

		getRandomSymbol(),

		getRandomSymbol()
	];

	currentReels = final;

	state.currentReels =
		final;

	renderSlotReels();

	checkSlotWin(final);

	saveCasinoState(state);

	spinSlotBtn.disabled = false;

	slotBusy = false;
}





function checkSlotWin(result) {

	const [
		a,
		b,
		c
	] = result;

	if (
		a === b &&
		b === c
	) {

		const reward =
			selectedBet * 10;

		state.coins += reward;

		slotMessage.textContent =
			`JACKPOT +${reward}`;

		updateBalanceUI();

		return;
	}

	if (
		a === b ||
		a === c ||
		b === c
	) {

		const reward =
			selectedBet * 2;

		state.coins += reward;

		slotMessage.textContent =
			`Ganaste +${reward}`;

		updateBalanceUI();

		return;
	}

	slotMessage.textContent =
		"Perdiste";
}





function getRandomSymbol() {

	return symbols[
		Math.floor(
			Math.random() *
			symbols.length
		)
	];
}





function getDifferentSymbol(last) {

	if (
		symbols.length <= 1
	) {

		return symbols[0];
	}

	let symbol =
		getRandomSymbol();

	while (
		symbol === last
	) {

		symbol =
			getRandomSymbol();
	}

	return symbol;
}





function renderJackpotGrid() {

	jackpotGrid.innerHTML = "";

	jackpotPrizes.forEach(
		(prize, index) => {

			const tile =
				document.createElement(
					"button"
				);

			tile.className =
				"jackpot-tile";

			tile.textContent =
				"❔";

			tile.dataset.index =
				index;

			jackpotGrid.appendChild(
				tile
			);
		}
	);
}





async function spinJackpot() {

	if (jackpotBusy) return;

	const cost = 50;

	if (
		state.coins < cost
	) {

		jackpotMessage.textContent =
			"No tenés monedas suficientes.";

		return;
	}

	jackpotBusy = true;

	spinJackpotBtn.disabled = true;

	state.coins -= cost;

	updateBalanceUI();

	saveCasinoState(state);

	const tiles =
		Array.from(
			document.querySelectorAll(
				".jackpot-tile"
			)
		);

	let active = 0;

	for (
		let i = 0;
		i < 25;
		i++
	) {

		tiles.forEach(tile => {

			tile.classList.remove(
				"active"
			);
		});

		tiles[
			active
		].classList.add(
			"active"
		);

		active =
			(active + 1) %
			tiles.length;

		await wait(60);
	}

	const winner =
		Math.floor(
			Math.random() *
			jackpotPrizes.length
		);

	const reward =
		jackpotPrizes[winner];

	tiles.forEach(tile => {

		tile.classList.remove(
			"active"
		);
	});

	tiles[
		winner
	].classList.add(
		"active"
	);

	state.coins += reward;

	updateBalanceUI();

	saveCasinoState(state);

	if (reward > 0) {

		jackpotMessage.textContent =
			`Ganaste +${reward}`;

	} else {

		jackpotMessage.textContent =
			"No ganaste nada";
	}

	spinJackpotBtn.disabled = false;

	jackpotBusy = false;
}





function formatCoins(value) {

	return new Intl.NumberFormat(
		"es-AR"
	).format(value);
}





function wait(ms) {

	return new Promise(resolve => {

		setTimeout(
			resolve,
			ms
		);
	});
}
