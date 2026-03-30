/*
 settingsScene.js
 owns everything about the settings scene.
 */

"use strict";

function drawSettingScene() {
    ctx.fillStyle = "#2c3e50"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "white";
    ctx.font = "40px 'Pixelify Sans'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SETTING SCREEN", canvasWidth / 2, canvasHeight / 2);

    backButton();
}