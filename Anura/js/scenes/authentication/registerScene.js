"use strict";

function drawRegisterScene() {
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "white";
    ctx.font = "32px Pixelify Sans";
    ctx.textAlign = "center";
    ctx.fillText("Register", canvasWidth / 2, 80);

    backButton();
}