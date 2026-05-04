/*
 * titleScene.js
 * Handles title screen UI, buttons, and menu music.
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */

"use strict";


// ---- MUSIC FUNCTIONS ----

// title screen music 
function playTitleMusic() {
    titleMusic.loop = true;
    titleMusic.volume = currentVolume;
    if (titleMusic.paused) {
        titleMusic.play();
    }
}

function stopTitleMusic() {
    titleMusic.pause();
}


// play scene music (swamp surface)
function playSwampSurfaceMusic() {
    swampSurfaceMusic.loop = true;
    swampSurfaceMusic.volume = currentVolume;
    if (swampSurfaceMusic.paused) {
        swampSurfaceMusic.play();
    }
}

function stopSwampSurfaceMusic() {
    swampSurfaceMusic.pause();
}

// boss scene music
function playBossMusic() {
    bossMusic.loop = true;
    bossMusic.volume = currentVolume;
    if (bossMusic.paused) {
        bossMusic.play();
    }
}

function stopBossMusic() {
    bossMusic.pause();
}

// SOUND EFFECT FUNCTIONS
function playTongueAttackSound() {
    tongueAttackSound.currentTime = 0;
    tongueAttackSound.playbackRate = 5;
    tongueAttackSound.volume = currentVolume;
    tongueAttackSound.play();
}

// ---- TITLE SCREEN DRAW ----

// draws the main title screen
function drawTitleScreen() {

    // Draw background image if loaded, else just draw white 
    if (bgReady) {
        ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
    } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // logo size and position
    const logoWidth = 400;
    const logoHeight = 400;

    // center the logo horizontally
    let centerX = canvasWidth / 2 - logoWidth / 2
    ctx.drawImage(logo, centerX, 0, 400, 400)

    // draw buttons based on login status
    if (activeUser !== null && activeUser !== undefined) {
        // user IS logged in -> show game buttons and logout
        drawStartRunButton(); // top left
        drawLogOutButton(); // bottom left
        drawSettingsButton(); // bottom right
    } else {
        // user is NOT logged in -> only show login and settings
        drawLogInButton();
        drawSettingsButton();
    }
}

// ---- BUTTON DRAWING FUNCTIONS ----

// START RUN BUTTON (was New Game)
// starts a fresh run with the player's saved deck and accumulated mosquitoes
function drawStartRunButton() {

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
    ctx.fillText("Start Run", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);

}

// removed CONTINUE RUN button

// LOG IN button (shown when logged out)
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

// LOG OUT button
function drawLogOutButton() {
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
    ctx.fillText("Log Out", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
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

