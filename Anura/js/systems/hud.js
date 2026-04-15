/*
 * Head-up display rendering including health bar, heart icon, mosquito counter, and game over screen.
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */
"use strict";

let HP_display;

function drawHeart(ctx, x, y, size) {
    ctx.fillStyle = "red";
    let s = size; 

    ctx.fillRect(x + s, y, s, s);
    ctx.fillRect(x + 3*s, y, s, s);

    ctx.fillRect(x, y + s, s, s);
    ctx.fillRect(x + s, y + s, s, s);
    ctx.fillRect(x + 2*s, y + s, s, s);
    ctx.fillRect(x + 3*s, y + s, s, s);
    ctx.fillRect(x + 4*s, y + s, s, s);

    ctx.fillRect(x, y + 2*s, s, s);
    ctx.fillRect(x + s, y + 2*s, s, s);
    ctx.fillRect(x + 2*s, y + 2*s, s, s);
    ctx.fillRect(x + 3*s, y + 2*s, s, s);
    ctx.fillRect(x + 4*s, y + 2*s, s, s);

    ctx.fillRect(x + s, y + 3*s, s, s);
    ctx.fillRect(x + 2*s, y + 3*s, s, s);
    ctx.fillRect(x + 3*s, y + 3*s, s, s);

    ctx.fillRect(x + 2*s, y + 4*s, s, s);
}

function drawMosquito(ctx, x, y, size) {
    ctx.fillStyle = "black";
    let s = size;

   
    ctx.fillRect(x + 2*s, y, s, s);

    
    ctx.fillRect(x + 2*s, y + s, s, s);
    ctx.fillRect(x + 2*s, y + 2*s, s, s);

    
    ctx.fillStyle = "lightgray";
    ctx.fillRect(x + s, y + s, s, s);
    ctx.fillRect(x + 3*s, y + s, s, s);

    
    ctx.fillStyle = "black";
    ctx.fillRect(x + s, y + 3*s, s, s);
    ctx.fillRect(x + 3*s, y + 3*s, s, s);

    
    ctx.fillRect(x + 2*s, y - s, s, s);
}

function drawHealthBar(ctx){
    ctx.fillStyle = "orange";
    
    ctx.fillRect((canvasWidth/16)-20,(canvasHeight-90)-5,2*currentHealth, 20);
}

function HealthBarDisplay(){
    drawHeart(ctx,(canvasWidth/16)-15,(canvasHeight-90)+20,10);
    HP_display = new TextLabel(20,canvasHeight-90,"80spx Ubuntu Mono","cyan");
    HP_display.draw(ctx,'%'+currentHealth);
    drawHealthBar(ctx);
}

// placeholder for the health HUD RF-14
function updateHealthHUD() {
    console.log('Health: ', currentHealth);
}
// function drawMosquitoHUD(){
//     let mosquito_image = new GameObject(new Vector(canvasWidth - 120, 20), 15, 15);
//     mosquito_image.setSprite("../assets/enemies/mosqSprite.png");
// }

// placeholder for the mosquito HUD RF-24
function updateMosquitoHUD() {

    let x = canvasWidth - 50;
    let y = 130;

    let Mosquito_dipslay = new TextLabel(x, y,"80spx Ubuntu Mono","white");
    Mosquito_dipslay.draw(ctx,'Mosq: '+ runMosquitos);
    drawMosquito(ctx, x - 60, y - 10 ,5);

}

function drawGameOver() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // text
    ctx.fillStyle = "white";
    ctx.font = "48px Pixelify Sans";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2 - 40);
}


function drawCardHUD(deck) {
    const cardHeight = 83.48;
    const cardWidth = 50;
    const spacing = 20;

    let startX = canvasWidth - (cardWidth * 3) - (spacing * 2) - 20;
    let startY = 20;

    function drawCard (x, y, card, key, flashTimer) {

        // draw image or fallback
        if (card && card.image && card.image.complete) {
            ctx.drawImage(card.image, x, y, cardWidth, cardHeight);
        } else {
            // fallback
            ctx.strokeStyle = "white";
            ctx.strokeRect(x, y, cardWidth, cardHeight);
        }

        if (flashTimer > 0 ) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = "#FFD700";
            ctx.fillRect(x, y, cardWidth, cardHeight);
            ctx.globalAlpha = 1;
        }

        // key label
        ctx.fillStyle = "white";
        ctx.font = "12px Pixelify Sans";
        ctx.textAlign = "center";
        ctx.fillText(key, x + cardWidth / 2, y + cardHeight/2 +5);

        // card name
        ctx.font = "10px Pixelify Sans"; 
        
        if (card) {
            ctx.fillText(card.name, x + cardWidth / 2, y + cardHeight - 5);
        } else {
            ctx.fillText("Empty", x + cardWidth / 2, y + cardHeight - 5);
        }
    }

    // draw left -> right
    drawCard(startX, startY, deck.slot1_Movement[0], "1", slot1FlashTimer);
    drawCard(startX + cardWidth + spacing, startY, deck.slot2_Combat[0], "2", slot2FlashTimer);
    drawCard(startX + (cardWidth + spacing) * 2, startY, deck.slot3_Utility[0], "3", slot3FlashTimer);
}