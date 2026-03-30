/*
 * uiComponents.js
 * contains reusable UI buttons shared across multiple scenes
 * meant to grow more throughout the developlent of the game
 */

"use strict";

// BACK BUTTON

function backButton() {
    const buttonWidth = 140;
    const buttonHeight = 50;

    const buttonX = 30;
    const buttonY = 30;

    // X: 30 a 170
    // Y: 30 a 80

    ctx.fillStyle = "#000000"
    ctx.fillRect(buttonX + 4, buttonY + 4, buttonWidth, buttonHeight);

    ctx.fillStyle = "#895654"
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // border
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#61393b";
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // text
    ctx.fillStyle = "white";
    ctx.font = "15px 'Pixelify Sans'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Back to Title", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
}