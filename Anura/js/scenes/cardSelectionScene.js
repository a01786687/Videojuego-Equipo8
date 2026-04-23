"use strict";

let cardOptions = [];
let cardPurchased = false;
let deckPreview = false;

async function generateCardOffers() {

    cardPurchased = false; // gets called everytime the screen shows up, it tracks when the player has already bought a card on the current scene or not
    deckPreview = false;

    // fetch 3 random cards from the api
    const res = await fetch("http://localhost:8080/cards/random"); // sends a GET request to the server at the /cards/random endpoint, await pauses until server responds
    const cards = await res.json(); // response comes back as http data and .json() converts it into a js array

    // translate database field names to game object property names
    cardOptions = cards.map(card => ({
        card_id: card.card_id,
        name: card.card_name,
        category: card.card_type,
        cost: card.card_cost,
        description: card.card_description,
        image: getImageByName(card.card_name)

    }));

    /*

    CODE FOR NO API BACKEND CONNECTION
    // card pool array copy so the original pool doesn't get modified
    let pool = [...cardPool]; // Spread Operator (...) -> way to unpack or expand elements of an array, string or object into individual pieces

    // option 1
    let index1 = randomRange(pool.length);
    let option1 = pool.splice(index1, 1)[0];

    // option 2
    let index2 = randomRange(pool.length);
    let option2 = pool.splice(index2, 1)[0];

    // option 3
    let index3 = randomRange(pool.length);
    let option3 = pool.splice(index3, 1)[0];

    // final result
    cardOptions = [option1, option2, option3];
    */
}


function drawCardOffer(card, x, y) {

    const cardWidth = 150;
    const imageHeight = Math.round(cardWidth * 1.67); // 250 - maintains correct ratio
    const cardHeight = imageHeight + 45; // image + space for cost and description below

    // card background
    ctx.fillStyle = "#333";
    ctx.fillRect(x , y , cardWidth, cardHeight);

    // card border
    // ctx.strokeStyle = "white";
    // ctx.lineWidth = 2;
    // ctx.strokeRect(x , y , cardWidth, cardHeight);

    // card image
    if (card.image && card.image.complete && card.image.naturalWidth !== 0) {
        ctx.drawImage(card.image, x, y, cardWidth, imageHeight);
    }

    // card cost
    ctx.fillStyle = "#FFD700";
    ctx.font = "11px Pixelify Sans";
    ctx.textAlign = "center";
    ctx.fillText("Cost: " + card.cost, x + cardWidth / 2, y + imageHeight + 15);

    // card description
    ctx.fillStyle = "#aaaaaa";
    ctx.font = "10px Pixelify Sans";
    ctx.fillText(card.description, x + cardWidth / 2, y + imageHeight + 32);

    // disabled card visual effect if player can't afford the card
    if (runMosquitos < card.cost) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#000000";
        ctx.fillRect(x, y, cardWidth, cardHeight);
        ctx.globalAlpha = 1;
    }

}

function drawCardSelectionScene() {

    // draws deckPreview if its true instead of the return
    if (deckPreview) {
        drawDeckPreview();
        return;
    }
    // dark background
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // title
    ctx.fillStyle = "white";
    ctx.font = "40px Pixelify Sans";
    ctx.textAlign = "center";
    ctx.fillText("CARD SELECTION", canvasWidth / 2, 60);

    // mosquito balance
    ctx.font = "20px Pixelify Sans";
    ctx.fillText("Mosquitos: " + runMosquitos, canvasWidth / 2, 110);

    // draw the 3 card offers
    if (cardOptions.length === 3) {
        const startX = 235;
        const cardY = 140;
        const spacing = 20;
        const cardWidth = 150;

        drawCardOffer(cardOptions[0], startX, cardY);
        drawCardOffer(cardOptions[1], startX + cardWidth + spacing, cardY);
        drawCardOffer(cardOptions[2], startX + (cardWidth + spacing) * 2, cardY);

        // skip button
        ctx.fillStyle = "#444";
        ctx.fillRect(410, 475, 140, 30);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(410, 475, 140, 30);
        ctx.fillStyle = "white";
        ctx.font = "20px Pixelify Sans";
        ctx.textAlign = "center";
        ctx.fillText("Skip", 480, 490);
    }
}

function purchaseCard(card) {

    // substract cost from player balance
    runMosquitos -= card.cost;

    // add card to the correct deck slot 
    if (card.category === "Movement") {
        deck.slot1_Movement.push(card);
    } else if (card.category === "Combat") {
        deck.slot2_Combat.push(card);
    } else if (card.category === "Utility") {
        deck.slot3_Utility.push(card);
    }

    cardPurchased = true;
    deckPreview = true; 
    console.log("purchased:", card.name, " mosquitos left:", runMosquitos);
}

function drawDeckPreview() {
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // title
    ctx.fillStyle = "white";
    ctx.font = "36px Pixelify Sans";
    ctx.textAlign = "center";
    ctx.fillText("YOUR DECK", canvasWidth / 2, 55);

    // mosquito balance
    ctx.fillStyle = "#FFD700";
    ctx.font = "18px Pixelify Sans";
    ctx.fillText(runMosquitos, canvasWidth / 2, 90);

    // Movement cards column
    ctx.fillStyle = "#FFD700";
    ctx.font = "16px Pixelify Sans";
    ctx.fillText("MOVEMENT (" + deck.slot1_Movement.length + ")", 160, 130);

    if (deck.slot1_Movement.length === 0){
        ctx.fillStyle = "#6f6f6f";
        ctx.fillText("empty", 160, 160);
    } else {
        // for each card in the movement deck
        for (let i = 0; i < deck.slot1_Movement.length; i++){
            if (i === 0) {
                ctx.fillStyle = "#90EE90"; // green for the active card
            } else {
                ctx.fillStyle = "white"; // white for reserve cards
            }
            
            ctx.fillText(deck.slot1_Movement[i].name, 160, 160 + i * 22); // prints card name, but 160 + i * 22 moves each card 22 px lower than the previous one

        }
    }

    // Combat cards column
    ctx.fillStyle = "#FFD700";
    ctx.font = "16px Pixelify Sans";
    ctx.fillText("COMBAT (" + deck.slot2_Combat.length + ")", 480, 130);

    if (deck.slot2_Combat.length === 0){
        ctx.fillStyle = "#6f6f6f";
        ctx.fillText("empty", 480, 160);
    } else {
        // for each card in the movement deck
        for (let i = 0; i < deck.slot2_Combat.length; i++){
            if (i === 0) {
                ctx.fillStyle = "#90EE90"; // green for the active card
            } else {
                ctx.fillStyle = "white"; // white for reserve cards
            }
            
            ctx.fillText(deck.slot2_Combat[i].name, 480, 160 + i * 22); // prints card name, but 160 + i * 22 moves each card 22 px lower than the previous one
        }
    }

    // Utility cards column
    ctx.fillStyle = "#FFD700";
    ctx.font = "16px Pixelify Sans";
    ctx.fillText("UTILITY (" + deck.slot3_Utility.length + ")", 800, 130);

    if (deck.slot3_Utility.length === 0){
        ctx.fillStyle = "#6f6f6f";
        ctx.fillText("empty", 800, 160);
    } else {
        // for each card in the movement deck
        for (let i = 0; i < deck.slot3_Utility.length; i++){
            if (i === 0) {
                ctx.fillStyle = "#90EE90"; // green for the active card
            } else {
                ctx.fillStyle = "white"; // white for reserve cards
            }
            
            ctx.fillText(deck.slot3_Utility[i].name, 800, 160 + i * 22); // prints card name, but 160 + i * 22 moves each card 22 px lower than the previous one
        }
    }

    // start run button
    ctx.fillStyle = "#895654";
    ctx.fillRect(380, 460, 200, 45);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(380, 460, 200, 45);
    ctx.fillStyle = "white";
    ctx.font = "20px Pixelify Sans";
    ctx.textAlign = "center";
    ctx.fillText("Start Run", 480, 489);
}
