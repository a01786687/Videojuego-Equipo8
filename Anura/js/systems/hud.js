/*
 * Head-up display rendering including health bar, heart icon, mosquito counter, and game over screen.
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */
"use strict";

let HP_display;
let user_disp;

let heartImage = new Image();
heartImage.src = "../Anura/assets/hudPixelHeart.png";

let mosquitoImage = new Image();
mosquitoImage.src = "../Anura/assets/hudMosquitoPixel.png";


function drawHeart(ctx, x, y, size) {
    if (heartImage.complete) {
        ctx.drawImage(heartImage, x, y, size, size);
    }
}

/*
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
*/

function drawMosquito(ctx, x, y, size) {
    if (mosquitoImage.complete) {
        ctx.drawImage(mosquitoImage, x, y, size, size);
    }
}

/*
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

*/

function drawHealthBar(ctx){
    // bg, empty part of bar
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(60, 50, 160, 20);

    // current health
    ctx.fillStyle = "#dd3745";
    ctx.fillRect(60, 50, 1.6 * currentHealth, 20);

    // border
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 50, 160, 20);
}

function HealthBarDisplay(){
    drawHealthBar(ctx);
    drawHeart(ctx, 25, 45, 32); // heart on the left
    
    // white percentage text, positioned to the right
    HP_display = new TextLabel(230, 65, "16px Pixelify Sans", "white");
    HP_display.draw(ctx, currentHealth + '%');
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

    let x = 60;
    let y = 100;

    let Mosquito_display = new TextLabel(x, y, "16px Pixelify Sans", "white");
    Mosquito_display.draw(ctx, 'Mosq: ' + (Number(sessionMosquitos) + Number(runMosquitos)));

    drawMosquito(ctx, x - 35, y - 17, 32);

}

function dispActiveUser(){
    user_disp = new TextLabel(canvasWidth/2,90,"80spx Ubuntu Mono","red");
    user_disp.draw(ctx,'User: '+ activeUser);
}

function drawGameOver() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // text
    ctx.fillStyle = "white";
    ctx.font = "48px Pixelify Sans";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2 - 20);
    
    // subtitle
    ctx.fillStyle = "white";
    ctx.font = "18px Pixelify Sans";
    ctx.fillText("Card Selection Screen in 3 seconds... ", canvasWidth / 2, canvasHeight / 2 + 70);
}

// --- VICTORY SCREEN ---
function drawVictory() {

    // background
    //ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.drawImage(cardSelectionSceneBg, 0, 0, canvasWidth, canvasHeight);

    // title
    ctx.fillStyle = "#8cff9b";
    ctx.font = "72px Pixelify Sans";
    ctx.textAlign = "center";
    ctx.fillText("SWAMP CLEARED!", canvasWidth / 2, 150);

    // message
    ctx.fillStyle = "white";
    ctx.font = "24px Pixelify Sans";
    ctx.fillText("You've conquered the food chain!", canvasWidth / 2, 250);
    ctx.fillText("All predators defeated.", canvasWidth / 2, 285);

    // run stats
    ctx.font = "18px Pixelify Sans";
    ctx.fillStyle = "#FFD700"; 
    ctx.fillText("🦟 Mosquitoes this run: " + runMosquitos, canvasWidth / 2, 340);

    // back to title button
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = (canvasWidth - buttonWidth) / 2;
    const buttonY = 400;

    // shadow
    ctx.fillStyle = "#000000";
    ctx.fillRect(buttonX + 4, buttonY + 4, buttonWidth, buttonHeight);

    // bg
    ctx.fillStyle = "#895654";
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // border
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#61393b";
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // text
    ctx.fillStyle = "white";
    ctx.font = "24px Pixelify Sans";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Back to Title", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
}

function drawPauseMenu() {

    // semi transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // title
    ctx.fillStyle = "white";
    ctx.font = "48px 'Pixelify Sans'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("PAUSED", canvasWidth / 2, 150);

    drawResumeButton();
    drawPauseSettingsButton();
    drawPauseBackToMenuButton();
}

function drawResumeButton() {
    const buttonWidth = 280;
    const buttonHeight = 60;
    const buttonX = (canvasWidth - buttonWidth) / 2; // centered
    const buttonY = 240;

    // shadow
    ctx.fillStyle = "#000000";
    ctx.fillRect(buttonX + 4, buttonY + 4, buttonWidth, buttonHeight);

    // bg
    ctx.fillStyle = "#895654";
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // border
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#61393b";
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // text
    ctx.fillStyle = "white";
    ctx.font = "24px 'Pixelify Sans'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Resume", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
}

function drawPauseSettingsButton() {
    const buttonWidth = 280;
    const buttonHeight = 60;
    const buttonX = (canvasWidth - buttonWidth) / 2; // centered 
    const buttonY = 330;

    // shadow
    ctx.fillStyle = "#000000";
    ctx.fillRect(buttonX + 4, buttonY + 4, buttonWidth, buttonHeight);

    // bg
    ctx.fillStyle = "#895654";
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // border
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#61393b";
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // text
    ctx.fillStyle = "white";
    ctx.font = "24px 'Pixelify Sans'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Settings", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);

}

function drawPauseBackToMenuButton() {
    const buttonWidth = 280;
    const buttonHeight = 60;
    const buttonX = (canvasWidth - buttonWidth) / 2; // centered 
    const buttonY = 420;

    // shadow
    ctx.fillStyle = "#000000";
    ctx.fillRect(buttonX + 4, buttonY + 4, buttonWidth, buttonHeight);

    // bg
    ctx.fillStyle = "#895654";
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // border
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#61393b";
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // text
    ctx.fillStyle = "white";
    ctx.font = "24px 'Pixelify Sans'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Back to Menu", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
}


function drawCardHUD(deck) {
    const cardHeight = 83.48;
    const cardWidth = 50;
    const spacing = 20;

    let startX = canvasWidth - (cardWidth * 3) - (spacing * 2) - 20;
    let startY = 20;

    function drawCard (x, y, card, key, flashTimer) {

        // SHADOW
        ctx.shadowColor = "black";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 2;

        // key label
        ctx.fillStyle = "white";
        ctx.font = "bold 14px Pixelify Sans";
        ctx.textAlign = "center";
        ctx.fillText(key, x + cardWidth / 2, y + 14);


        // draw image or fallback
        if (card && card.image && card.image.complete) {
            ctx.drawImage(card.image, x, y, cardWidth, cardHeight);
        } else {
            // fallback
            ctx.strokeStyle = "white";
            ctx.strokeRect(x, y, cardWidth, cardHeight);
        }

        // remove shadow for ui text
        ctx.shadowColor = "transparent";

        if (flashTimer > 0 ) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = "#FFD700";
            ctx.fillRect(x, y, cardWidth, cardHeight);
            ctx.globalAlpha = 1;
        }

        // card name
        ctx.font = "10px Pixelify Sans"; 
        
        if (card) {
            ctx.fillText(card.name, x + cardWidth / 2, y + cardHeight + 12);
        } else {
            ctx.fillText("Empty", x + cardWidth / 2, y + cardHeight + 12);
        }
    }

    // draw left -> right
    drawCard(startX, startY, deck.slot1_Movement[0], "1", slot1FlashTimer);
    drawCard(startX + cardWidth + spacing, startY, deck.slot2_Combat[0], "2", slot2FlashTimer);
    drawCard(startX + (cardWidth + spacing) * 2, startY, deck.slot3_Utility[0], "3", slot3FlashTimer);

    // ACTIVE EFFECT -> shows which cards are currently active on the frog
    ctx.font = "bold 14px Pixelify Sans";
    ctx.textAlign = "left";

    let activeY = startY + cardHeight + 35; 

    if (lastBurnedSlot1) {
    ctx.fillStyle = "#90EE90";
    ctx.fillText("ACTIVE: " + lastBurnedSlot1.name, startX, activeY);
    activeY += 15; // move down for next line
    }

    if (lastBurnedSlot2) {
        ctx.fillStyle = "#FF6B6B";
        ctx.fillText("ACTIVE: " + lastBurnedSlot2.name, startX, activeY);
        activeY += 15; // move down for next line
    }

    if (lastBurnedSlot3) {
        ctx.fillStyle = "#FFD93D";
        ctx.fillText("ACTIVE: " + lastBurnedSlot3.name, startX, activeY);
    }

}