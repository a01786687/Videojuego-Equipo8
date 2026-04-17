"use strict";

let cardOptions = [];

function generateCardOffers() {
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
}


function drawCardOffer(card, x, y) {

    const cardWidth = 150;
    const cardHeight = 250;

    // card background
    ctx.fillStyle = "#333";
    ctx.fillRect(x , y , cardWidth, cardHeight);

    // card border
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(x , y , cardWidth, cardHeight);

    // card image
    if (card.image && card.image.complete) {
        ctx.drawImage(card.image, x, y, cardWidth, cardHeight - 50);
    }

    // card name
    ctx.fillStyle = "white";
    ctx.font = "13px Pixelify Sans";
    ctx.textAlign = "center";
    ctx.fillText(card.name, x + cardWidth / 2, y + cardHeight - 30);

    // card cost placeholder
    ctx.fillStyle = "#FFD700";
    ctx.font = "12px Pixelify Sans";
    ctx.fillText("Cost: 10", x + cardWidth / 2, y + cardHeight - 10);

}

function drawCardSelectionScene() {
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
    }
}