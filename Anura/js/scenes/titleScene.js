/*
 * titleScene.js
 * has everything about the title screen:
 */

"use strict";

// funcion a parte para separar lo visual de la title screen a una funcion nueva
function drawTitleScreen() {

    if (bgReady) {
        ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
    } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // medidas logo
    const logoWidth = 400;
    const logoHeight = 400;

    // drawImage(image, dx, dy, dWidth, dHeight)
    let centerX = canvasWidth / 2 - logoWidth / 2
    ctx.drawImage(logo, centerX, 0, 400, 400)

    drawPlayButton();
    drawLogInButton();
    drawSettingsButton();

    // continue run only shows if the player is logged in
    // real saved progress check will connect to API when RF-49 expands

    if (activeUserId !== null && activeUserId !== undefined) {
    drawContinueRunButton();
    }
}

// BUTTONS

// New Game & Continue Run
// X: 270 to 470
// Y: 350 to 410

// Log In & Settings  
// X: 490 to 690
// Y: 420 to 480

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

// CONTINUE RUN BUTTON

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