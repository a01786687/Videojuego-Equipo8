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

// placeholder for the mosquito HUD RF-24
function updateMosquitoHUD() {
    let Mosquito_dipslay = new TextLabel(canvasWidth-90,20,"80spx Ubuntu Mono","white");
    Mosquito_dipslay.draw(ctx,'Mosq: '+ runMosquitos);

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