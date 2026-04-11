/*

settingsScene.js
owns everything about the settings scene.
Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */

"use strict";


function changeBrightness(value) {
    const canvas = document.getElementById('canvas');
    const textBrightness = document.getElementById('brightness-value');

    if (canvas) {
        // Visual brightness for canvas
        canvas.style.filter = `brightness(${value})`;
    }

    if (textBrightness) {
        // This is just for the text that shows the percentage
        const percentage = Math.round(value * 100);
        textBrightness.innerText = `${percentage}%`;
    }

    localStorage.setItem('anura_brightness', value);
}

/**
 * This function is called from index.js when currentScene is "settings". It draws the settings scene on the canvas
 */
function drawSettingScene() {
    // draw background
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // this is where we load the saved brightness value from localStorage
    const slider = document.getElementById('brightness-slider');
    const saveBrightness = localStorage.getItem('anura_brightness');
    
    if (slider && saveBrightness && slider.dataset.initialized !== "true") {
        slider.value = saveBrightness;
        changeBrightness(saveBrightness);
        slider.dataset.initialized = "true"; // The data is loaded
    }

    backButton();
}