const homeView =
	document.getElementById(
		"homeView"
	);

const slotView =
	document.getElementById(
		"slotView"
	);

const jackpotView =
	document.getElementById(
		"jackpotView"
	);

const blackjackView =
	document.getElementById(
		"blackjackView"
	);

const openSlotBtn =
	document.getElementById(
		"openSlotBtn"
	);

const openJackpotBtn =
	document.getElementById(
		"openJackpotBtn"
	);

const openBlackjackBtn =
	document.getElementById(
		"openBlackjackBtn"
	);

const balanceText =
	document.getElementById(
		"balanceText"
	);

const balanceMirrors =
	document.querySelectorAll(
		".balanceMirror"
	);

const reel1 =
	document.getElementById(
		"reel1"
	);

const reel2 =
	document.getElementById(
		"reel2"
	);

const reel3 =
	document.getElementById(
		"reel3"
	);

const spinBtn =
	document.getElementById(
		"spinBtn"
	);

const slotResult =
	document.getElementById(
		"slotResult"
	);

const betButtons =
	document.querySelectorAll(
		".bet-btn"
	);

const jackpotGrid =
	document.getElementById(
		"jackpotGrid"
	);

const jackpotBtn =
	document.getElementById(
		"jackpotBtn"
	);

const jackpotAmount =
	document.getElementById(
		"jackpotAmount"
	);

const dealerHandEl =
	document.getElementById(
		"dealerHand"
	);

const playerHandEl =
	document.getElementById(
		"playerHand"
	);

const dealerScoreEl =
	document.getElementById(
		"dealerScore"
	);

const playerScoreEl =
	document.getElementById(
		"playerScore"
	);

const blackjackMessage =
	document.getElementById(
		"blackjackMessage"
	);

const bjNewRoundBtn =
	document.getElementById(
		"bjNewRoundBtn"
	);

const bjHitBtn =
	document.getElementById(
		"bjHitBtn"
	);

const bjStandBtn =
	document.getElementById(
		"bjStandBtn"
	);

const blackjackActions =
	document.getElementById(
		"blackjackActions"
	);

const symbols = [
	"🍒",
	"🍋",
	"🔔",
	"⭐",
	"💎",
	"7️⃣"
];

const payouts = {
	"🍒":5,
	"🍋":8,
	"🔔":12,
	"⭐":14,
	"💎":18,
	"7️⃣":30
};

let balance = 1000;
let currentBet = 10;

let jackpotPrize = 5000;

const blackjack = {
	player:[],
	dealer:[],
	inRound:false,
	revealDealer:false,
	message:"Tocá nueva ronda."
};

function updateBalance() {

	balanceText.textContent =
		`$${balance}`;

	balanceMirrors.forEach(
		el => {

			el.textContent =
				`$${balance}`;
		}
	);
}

function showView(view) {

	document
		.querySelectorAll(".view")
		.forEach(v => {

			v.classList.remove(
				"active"
			);
		});

	view.classList.add(
		"active"
	);
}

openSlotBtn.addEventListener(
	"click",
	() => {

		showView(slotView);
	}
);

openJackpotBtn.addEventListener(
	"click",
	() => {

		showView(jackpotView);
	}
);

openBlackjackBtn.addEventListener(
	"click",
	() => {

		showView(blackjackView);
	}
);

document
	.querySelectorAll("[data-back]")
	.forEach(btn => {

		btn.addEventListener(
			"click",
			() => {

				showView(homeView);
			}
		);
	});

betButtons.forEach(btn => {

	btn.onclick = () => {

		betButtons.forEach(
			b =>
				b.classList.remove(
					"active"
				)
		);

		btn.classList.add(
			"active"
		);

		currentBet =
			Number(
				btn.dataset.bet
			);
	};
});

function randomSymbol() {

	return symbols[
		Math.floor(
			Math.random() *
			symbols.length
		)
	];
}

async function animateReel(
	element,
	duration = 700
) {

	return new Promise(resolve => {

		const interval =
			setInterval(() => {

				element.textContent =
					randomSymbol();

			}, 80);

		setTimeout(() => {

			clearInterval(
				interval
			);

			resolve();

		}, duration);
	});
}

spinBtn.onclick = async () => {

	if (
		balance < currentBet
	) {

		slotResult.textContent =
			"Saldo insuficiente.";

		return;
	}

	balance -= currentBet;

	updateBalance();

	spinBtn.disabled = true;

	await Promise.all([
		animateReel(reel1,700),
		animateReel(reel2,900),
		animateReel(reel3,1100)
	]);

	const s1 = randomSymbol();
	const s2 = randomSymbol();
	const s3 = randomSymbol();

	reel1.textContent = s1;
	reel2.textContent = s2;
	reel3.textContent = s3;

	if (
		s1 === s2 &&
		s2 === s3
	) {

		const multiplier =
			payouts[s1];

		const win =
			currentBet *
			multiplier;

		balance += win;

		slotResult.textContent =
			`GANASTE $${win}`;

	} else {

		slotResult.textContent =
			"Seguí intentando.";
	}

	updateBalance();

	spinBtn.disabled = false;
};

function createJackpotGrid() {

	jackpotGrid.innerHTML = "";

	for (
		let i = 0;
		i < 9;
		i++
	) {

		const tile =
			document.createElement(
				"div"
			);

		tile.className =
			"jackpot-tile";

		tile.innerHTML =
			`
			<div>
				<strong>?</strong>
				<span class="tiny">
					jackpot
				</span>
			</div>
			`;

		jackpotGrid.appendChild(
			tile
		);
	}
}

jackpotBtn.onclick = async () => {

	if (balance < 100) {
		return;
	}

	balance -= 100;

	updateBalance();

	const tiles =
		[
			...document.querySelectorAll(
				".jackpot-tile"
			)
		];

	tiles.forEach(tile => {

		tile.classList.remove(
			"active",
			"win"
		);
	});

	let current = 0;

	for (
		let i = 0;
		i < 18;
		i++
	) {

		tiles.forEach(t =>
			t.classList.remove(
				"active"
			)
		);

		tiles[current]
			.classList.add(
				"active"
			);

		current =
			(current + 1) % 9;

		await new Promise(r =>
			setTimeout(r,90)
		);
	}

	const winner =
		Math.floor(
			Math.random() * 9
		);

	tiles.forEach(t =>
		t.classList.remove(
			"active"
		)
	);

	tiles[winner]
		.classList.add(
			"win"
		);

	if (winner === 4) {

		balance += jackpotPrize;

		alert(
			`JACKPOT! +$${jackpotPrize}`
		);

		jackpotPrize = 5000;

	} else {

		jackpotPrize += 250;
	}

	jackpotAmount.textContent =
		`$${jackpotPrize}`;

	updateBalance();
};

const suits = [
	"♠",
	"♥",
	"♦",
	"♣"
];

const cards = [
	"A","2","3","4",
	"5","6","7","8",
	"9","10","J","Q","K"
];

function drawCard() {

	return {
		rank:
			cards[
				Math.floor(
					Math.random() *
					cards.length
				)
			],

		suit:
			suits[
				Math.floor(
					Math.random() *
					suits.length
				)
			]
	};
}

function cardValue(rank) {

	if (
		["J","Q","K"]
		.includes(rank)
	) {
		return 10;
	}

	if (rank === "A") {
		return 11;
	}

	return Number(rank);
}

function scoreHand(hand) {

	let total = 0;
	let aces = 0;

	hand.forEach(card => {

		total +=
			cardValue(
				card.rank
			);

		if (
			card.rank === "A"
		) {
			aces++;
		}
	});

	while (
		total > 21 &&
		aces > 0
	) {

		total -= 10;
		aces--;
	}

	return total;
}

function renderCard(
	card,
	hidden = false
) {

	const div =
		document.createElement(
			"div"
		);

	if (hidden) {

		div.className =
			"bj-card back";

		div.textContent = "🂠";

		return div;
	}

	const red =
		card.suit === "♥" ||
		card.suit === "♦";

	div.className =
		`bj-card ${red ? "red" : ""}`;

	div.innerHTML =
		`
		<div class="rank">
			${card.rank}
		</div>

		<div class="suit">
			${card.suit}
		</div>
		`;

	return div;
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
			: scoreHand([
				blackjack.dealer[0]
			]);

	playerScoreEl.textContent =
		playerScore;

	blackjack.dealer.forEach(
		(card,index) => {

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
				renderCard(card)
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

function endRound(message) {

	blackjack.inRound = false;

	blackjack.revealDealer = true;

	blackjack.message = message;

	renderBlackjack();
}

bjNewRoundBtn.onclick = () => {

	if (balance < 50) {
		return;
	}

	balance -= 50;

	updateBalance();

	blackjack.player = [
		drawCard(),
		drawCard()
	];

	blackjack.dealer = [
		drawCard(),
		drawCard()
	];

	blackjack.inRound = true;

	blackjack.revealDealer = false;

	blackjack.message =
		"Tu turno.";

	renderBlackjack();

	const player =
		scoreHand(
			blackjack.player
		);

	if (player === 21) {

		balance += 125;

		updateBalance();

		endRound(
			"BLACKJACK!"
		);
	}
};

bjHitBtn.onclick = () => {

	if (
		!blackjack.inRound
	) {
		return;
	}

	blackjack.player.push(
		drawCard()
	);

	renderBlackjack();

	const score =
		scoreHand(
			blackjack.player
		);

	if (score > 21) {

		endRound(
			"Te pasaste."
		);
	}
};

bjStandBtn.onclick = () => {

	blackjack.revealDealer = true;

	while (
		scoreHand(
			blackjack.dealer
		) < 17
	) {

		blackjack.dealer.push(
			drawCard()
		);
	}

	const dealer =
		scoreHand(
			blackjack.dealer
		);

	const player =
		scoreHand(
			blackjack.player
		);

	if (
		dealer > 21 ||
		player > dealer
	) {

		balance += 100;

		updateBalance();

		endRound(
			"Ganaste."
		);

	} else if (
		player === dealer
	) {

		balance += 50;

		updateBalance();

		endRound(
			"Empate."
		);

	} else {

		endRound(
			"Perdiste."
		);
	}
};

createJackpotGrid();

renderBlackjack();

updateBalance();
