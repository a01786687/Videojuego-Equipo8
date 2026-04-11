/*
 * Reusable UI components, currently contains the back button for navigation across scenes.
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */

"use strict";

// BACK BUTTON

function backButton() {
    const buttonWidth = 140;
    const buttonHeight = 50;

    const buttonX = 30;
    const buttonY = 30;

    // X: 30 to 170
    // Y: 30 to 80

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