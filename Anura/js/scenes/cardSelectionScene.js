"use strict";

function drawCardSelectionScene() {
    // dark background
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // title
    ctx.fillStyle = "white";
    ctx.font = "40px Pixelify Sans";
    ctx.textAlign = "center";
    ctx.fillText("CARD SELECTION", canvasWidth / 2, canvasHeight / 2);

    // instruction
    ctx.font = "20px Pixelify Sans";
    ctx.fillText("CLICK ANYWHERE ON THE SCREEN", canvasWidth / 2, canvasHeight / 2 + 50);
}