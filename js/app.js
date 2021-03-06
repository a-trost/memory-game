/**
* @description Represents a card
* @constructor
* @param {string} icon - The icon that will be displayed on the card
* @param {string} phrase - The catch phrase that will appear when this card is matched.
* @param {boolean} matched - If the card is matched to its pair
* @param {string} positon - Position on the grid. Left to right, 0-15.
*/
function Card(icon, phrase) {
    this.icon = icon;
    this.phrase = phrase;
    this.matched = false;
    this.position;
}

//Set initial global variables
let icons = [
    ["gem", "Luxurious!"],
    ["heart", "Love It!"],
    ["anchor", "Anchors Aweigh!"],
    ["bolt", "Electrifying!"],
    ["magic", "Magical!"],
    ["bomb", "Explosive!"],
    ["paw", "Hot Dog!"],
    ["birthday-cake", "Delicious!"],
]
let moveCounter = 0,
    openCards = [],
    array = [],
    remainingMatches = icons.length,
    hintsUsed = 0;
const phraseHolder = document.getElementById('phrase-holder')
const timeHolder = document.getElementById('game-timer')
let seconds = 0;
let startTime = Date.now();
const delayInMilliseconds = 1000; //Display cards for 1 sec
var audio = new Audio('audio/card.mp3');
const gameSurface = document.getElementById('game-surface');
gameSurface.addEventListener('click', cardClick);

/*
* Set game functions
*/
function createDeck() {
    doubleIcons = icons.concat(icons);
    for (i = 0; i < doubleIcons.length; i++) {
        array.push(new Card(doubleIcons[i][0], doubleIcons[i][1]));
    }
    return array;
}

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function showIcon(event) {
    event.target.setAttribute('class', 'card open show');
};

function incrementMoveCounter() {
    moveCounter += 1; // Choosing 2 cards = 1 move
    document.getElementById('move-counter').innerText = moveCounter;
}

/**
* @description Checks the selected card(s) for matches
* @param {number} card - The most recently clicked card
*/
function checkOpenCards(card) {
    if (openCards.length === 1 && openCards[0].position != card.position) {
        let card1 = document.getElementById(openCards[0].position);
        let card2 = document.getElementById(card.position);
        if (openCards[0].icon == card.icon) {
            card.matched = true, openCards[0].matched = true;
            card1.setAttribute('class', 'card match');
            card2.setAttribute('class', 'card match');
            remainingMatches -= 1;
            phraseHolder.style.display = 'block'
            phraseHolder.innerHTML = '<span class="success-phrase">' + card.phrase + '</span>';
            setTimeout(function() {
                phraseHolder.style.display = 'none'
            }, delayInMilliseconds);
        } else {
            setTimeout(function() {
                card1.setAttribute('class', 'card');
                card2.setAttribute('class', 'card');
            }, delayInMilliseconds);
        }
        openCards.pop();
        incrementMoveCounter();
    } else if (openCards.length === 0) {
        openCards.push(card)
    }
}

function cardClick(event) {
    if (event.target.nodeName === "LI") {
        card = array.find(function(element) {
            return element.position == event.toElement.id;
        });
        if (!(card.matched)) {
            showIcon(event);
            audio.play();
            checkOpenCards(card);
            updateStars();
            if (remainingMatches === 0) {
                gameFinish();
            }
        }
    };
}

/**
* @description Places cards after they've been shuffled
*/
function placeCards(array) {
    const fragment = document.createDocumentFragment();
    for (i = 0; i < array.length; i++) {
        const newCard = document.createElement('li');
        newCard.innerHTML = '<i class="fas fa-' + array[i].icon + '"></i>';
        newCard.className = "card enter back";
        newCard.id = "card-" + i;
        array[i].position = 'card-' + i;
        fragment.appendChild(newCard);
    };
    gameSurface.appendChild(fragment);
};

function returnStarRating(seconds, moves) {
    let stars = 0;
    if (seconds < 40) {
        stars++;
    };
    if (moves < 17) {
        stars++;
    };
    return stars;
}

function giveHint() {
    if (openCards.length === 1) {
        matchingCard = array.find(function(element) {
            return element.icon == openCards[0].icon && element.position != openCards[0].position;
        });
        console.log(matchingCard)
        let card2Node = document.getElementById(matchingCard.position);
        card2Node.setAttribute('class', 'card hint');
    } else {
        card1 = array.find(function(element) {
            return element.matched === false;
        });
        card2 = array.find(function(element) {
            return element.icon == card1.icon && element.position != card1.position;
        })
        let card1Node = document.getElementById(card1.position);
        let card2Node = document.getElementById(card2.position);
        card1Node.setAttribute('class', 'card hint');
        card2Node.setAttribute('class', 'card hint');
    }
    hintsUsed++;
}

function gameTimer() {
    seconds = Math.round((Date.now() - startTime) / 1000);
    timeHolder.innerText = seconds;
    updateStars();
}

function stopTimer() {
    clearInterval(timer);
}

function updateStars() {
    stars = returnStarRating(seconds, moveCounter);
    document.getElementById('star-display').innerHTML = '<img src="img/star-' + stars + '.svg">';
}

function clearCards() {
    while (gameSurface.firstChild) {
        gameSurface.removeChild(gameSurface.firstChild);
    };
}

function gameFinish() {
    stopTimer();
    let stars = returnStarRating(seconds, moveCounter);
    const starContainer = document.getElementById('star-container');
    starContainer.innerHTML = '<img src="img/star-' + stars + '.svg">';
    document.getElementById('popup').style.display = 'block';
    document.getElementById('final-move-counter').innerText = moveCounter;
    document.getElementById('final-time-counter').innerText = seconds;
    document.getElementById('final-hint-counter').innerText = hintsUsed;
}

function startGame() {
    moveCounter = 0, openCards = [], array = [], remainingMatches = icons.length, hintsUsed = 0;
    document.getElementById('move-counter').innerText = moveCounter;
    document.getElementById('popup').style.display = 'none';
    document.getElementById('start-panel').style.display = 'none';
    document.getElementById('score-panel').style.display = 'block';
    clearCards();
    array = shuffle(createDeck());
    let cardHolders = document.getElementsByClassName('card');
    placeCards(array);
    startTime = Date.now();
    timer = setInterval(gameTimer, 1000);
}
