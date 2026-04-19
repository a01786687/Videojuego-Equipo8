/*
 * Title screen scene with buttons for new game, login, settings, and continue run (when logged in).
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */

"use strict";

// draws the main title screen
function drawTitleScreen() {

    // Draw background image if loaded, else just draw white 
    if (bgReady) {
        ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
    } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // logo size
    const logoWidth = 400;
    const logoHeight = 400;

    // center the logo horizontally
    let centerX = canvasWidth / 2 - logoWidth / 2
    ctx.drawImage(logo, centerX, 0, 400, 400)

    // draw buttons
    if (activeUser !== null && activeUser !== undefined) {
        drawPlayButton();
    }
    drawLogInButton();
    drawSettingsButton();

    // continue run only shows if the player is logged in
    // real saved progress check will connect to API when RF-49 expands

    if (activeUser !== null && activeUser !== undefined) {
        drawContinueRunButton();
    }
}

// NEW GAME button
function drawPlayButton() {

    const buttonWidth = 200;
    const buttonHeight = 60;

    const buttonX = 270;
    const buttonY = 350;

    ctx.fillStyle = "#000000";
    ctx.fillRect(buttonX + 4, buttonY + 4, buttonWidth, buttonHeight);

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
    ctx.fillText("New Game", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);

}

// CONTINUE RUN button
function drawContinueRunButton() {

    const buttonWidth = 200;
    const buttonHeight = 60;

    const buttonX = 490;
    const buttonY = 350;

    ctx.fillStyle = "#000000";
    ctx.fillRect(buttonX + 4, buttonY + 4, buttonWidth, buttonHeight);

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
    ctx.fillText("Continue Run", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);

}

// LOG IN button
function drawLogInButton() {
    const buttonWidth = 200;
    const buttonHeight = 60;

    const buttonX = 270; 
    const buttonY = 420;

    ctx.fillStyle = "#000000";
    ctx.fillRect(buttonX + 4, buttonY + 4, buttonWidth, buttonHeight);

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
    ctx.fillText("Log In", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
}

// SETTINGS button
function drawSettingsButton() {

    const buttonWidth = 200;
    const buttonHeight = 60;

    const buttonX = 490; 
    const buttonY = 420; 

    ctx.fillStyle = "#000000";
    ctx.fillRect(buttonX + 4, buttonY + 4, buttonWidth, buttonHeight);

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

