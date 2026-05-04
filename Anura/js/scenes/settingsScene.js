/*
 * settingsScene.js
 * Handles settings UI, brightness, and volume controls.
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
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

function changeVolume(value) {
    const textVolume = document.getElementById('volume-value');

    // convert the value to a number
    const volumeNumber = parseFloat(value);
    currentVolume = volumeNumber; // update the global variable

    // apply the volume to all audio elements
    if (titleMusic) titleMusic.volume = currentVolume;
    if (swampSurfaceMusic) swampSurfaceMusic.volume = currentVolume;
    if (bossMusic) bossMusic.volume = currentVolume;
    if (tongueAttackSound) tongueAttackSound.volume = currentVolume;

    // update the % text
    if (textVolume) {
        const percentage = Math.round(volumeNumber * 100);
        textVolume.innerText = `${percentage}%`;
    }

    // save to local storage
    localStorage.setItem('anura_volume', value);

}

/**
 * This function is called from index.js when currentScene is "settings". It draws the settings scene on the canvas
 */
function drawSettingScene() {
    // draw background
    ctx.drawImage(cardSelectionSceneBg, 0, 0, canvasWidth, canvasHeight);

    // this is where we load the saved brightness value from localStorage
    const slider = document.getElementById('brightness-slider');
    const saveBrightness = localStorage.getItem('anura_brightness');
    
    if (slider && saveBrightness && slider.dataset.initialized !== "true") {
        slider.value = saveBrightness;
        changeBrightness(saveBrightness);
        slider.dataset.initialized = "true"; // The data is loaded
    }

    // load the saved volume value from localStorage
    const volumeSlider = document.getElementById('volume-slider');
    const savedVolume = localStorage.getItem('anura_volume');
    
    if (volumeSlider && savedVolume && volumeSlider.dataset.initialized !== "true") {
        volumeSlider.value = savedVolume;
        changeVolume(savedVolume);
        volumeSlider.dataset.initialized = "true"; // The data is loaded
    }

    backButton();
}