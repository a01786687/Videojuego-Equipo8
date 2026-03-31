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

    // ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);

    // medidas logo
    const logoWidth = 400;
    const logoHeight = 400;

    // drawImage(image, dx, dy, dWidth, dHeight)
    let centerX = canvasWidth / 2 - logoWidth / 2
    ctx.drawImage(logo, centerX, 15, 400, 400)

    drawPlayButton();
    drawLogInButton();
    drawSettingsButton();

}

// BUTTONS

function drawPlayButton() {

    const buttonWidth = 200;
    const buttonHeight = 60;

    const buttonX = 240 - buttonWidth / 2; // 140
    const buttonY = 400; // 400

    // X: 140 a 340
    // Y: 400 a 460

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
    ctx.fillText("Play", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);

}

function drawLogInButton() {
    const buttonWidth = 200;
    const buttonHeight = 60;

    const buttonX = 480 - buttonWidth / 2; // 380
    const buttonY = 400; // 400

    // X: 380 a 580 ( buttonX + buttonWidth)
    // Y: 400 a 460 ( buttonY + buttonHeight)


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

    const buttonX = 720 - buttonWidth / 2; // 620
    const buttonY = 400; // 400

    // X: 620 a 820 ( buttonX + buttonWidth)
    // Y: 400 a 460 ( buttonY + buttonHeight)

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

