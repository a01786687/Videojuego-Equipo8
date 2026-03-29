/*
This file will include the user authentication login screen, 
with a register button that takes you to the register scene

 */

"use strict";

function drawLoginScene() {
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "white";
    ctx.font = "32px Pixelify Sans";
    ctx.textAlign = "center";
    ctx.fillText("Log In", canvasWidth / 2, 80);

    backButton();
}
