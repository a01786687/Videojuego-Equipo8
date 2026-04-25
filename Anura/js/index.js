/*
 * Main game loop and canvas initialization; handles scene switching between title, login, register, play, and boss scenes.
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */

"use strict";

console.log('hello world');

// Global variables
// canvas resolution
const canvasWidth = 960;
const canvasHeight = 540;
const boxSize = 50;

// Global variables, shared across all scene files
let canvas;
let ctx;

let oldTime = 0;


let backgroundImage = new Image();
let bgReady = false;
let logo = new Image(); // Image() constructor

// current active scene
let currentScene = "title";

let previousScene = "title"; 
// main(), runs once when the page loads

function main() {
    // Get a reference to the object with id 'canvas' in the page
    canvas = document.getElementById('canvas');

    // Resize the element, internal resolution
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Get the context for drawing in 2D
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // event listener defined in main since the canvas is global
    // click -> the event we want to listen for
    // handleClick -> function executed when the event is triggered

    canvas.addEventListener("click", handleClick);
    
    // handleKeyDown and handleKeyUp are defined in playScene.js

    backgroundImage.onload = () => {
        bgReady = true;
    };

    backgroundImage.onerror = () => {
        console.log("Image failed to load.", backgroundImage.src);
    };

    backgroundImage.src = "./assets/titleScreenBG.png"
    logo.src = "./assets/logoTemp2.png";

    // Each scene initializes its own form wiring
    initLoginScene();    // loginScene.js
    initRegisterScene(); // registerScene.js

    requestAnimationFrame(draw);
}

// Main game loop: only sends to scene files, doesnt draw them

function draw(newTime) { // draws the actual scene

    if (currentScene !== previousScene) {
        oldTime       = newTime;
        previousScene = currentScene;
    }

    const deltaTime = (newTime - oldTime); // miliseconds
    oldTime = newTime;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // titleScene.js
    switch (currentScene) { 
        case "title": drawTitleScreen();
            break; 

    // loginScene.js
        case "login":
            drawLoginScene();
            break;

    // registerScene.js
        case "register":
            drawRegisterScene();
            break;

    // playScene.js
        case "play":
            drawPlayScene(deltaTime);
            break;

    // settingScene.js
        case "settings":
            drawSettingScene();
            break;

    // bossScene1.js
        case "boss":
            drawBossScene1(deltaTime);
            break; 

    // cardSelectionScene.js
        case "cardSelection":
            drawCardSelectionScene();
            break;
    }

    updateLoginForm();
    updateRegisterForm();
    updateSettingsForm();

    requestAnimationFrame(draw);
}

// click handler, controls global currentScene 
function handleClick(event) {

    // Convert screen coordinates to canvas coordinates
    // getBoundingClientRect() returns the canvas position and size in the page
    // This allows us to correctly map the click position, even with CSS transforms or borders
    const rect = canvas.getBoundingClientRect(); 

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    console.log(mouseX, mouseY);

    if (currentScene === "cardSelection") {

        const startX = 235; // x position where the first card starts
        const cardY = 140; // y position where all 3 cards start
        const spacing = 20; // gap between each card
        const cardWidth = 150; 
        const cardHeight = 250;

        // card 1
        if (mouseX >= startX && mouseX <= startX + cardWidth && mouseY >= cardY && mouseY <= cardY + cardHeight) {
            if (!cardPurchased && sessionMosquitos >= cardOptions[0].cost) {
                purchaseCard(cardOptions[0]);
            }
        }

        // card 2
        if (mouseX >= startX + cardWidth + spacing && mouseX <= startX + (cardWidth + spacing) + cardWidth && mouseY >= cardY && mouseY <= cardY + cardHeight) {
            if (!cardPurchased && sessionMosquitos >= cardOptions[1].cost) {
                purchaseCard(cardOptions[1]);
            }
        }

        // card 3
        if (mouseX >= startX + (cardWidth + spacing) * 2 && mouseX <= startX + (cardWidth + spacing) * 2 + cardWidth && mouseY >= cardY && mouseY <= cardY + cardHeight) {
            if (!cardPurchased && sessionMosquitos >= cardOptions[2].cost) {
                purchaseCard(cardOptions[2]);
            }
        }

        // skip button

        if (mouseX >= 410 && mouseX <= 550 && mouseY >= 475 && mouseY <= 505) {
            deckPreview = true; // show deck preview before starting a new run
        }

        // start run button has deck preview before
        if (deckPreview && mouseX >= 380 && mouseX <= 580 && mouseY >= 460 && mouseY <= 505) {
            deckPreview = false;
            beginRun();
        }

        return; // return so it doesnt trigger title buttons, back button logic
    }

    // Handle clicks depending on the current scene
    if (currentScene == "title") {
        if (activeUser !== null && activeUser !== undefined) {
            // NEW GAME button
            if (mouseX >= 270 && mouseX <= 470 && mouseY >= 350 && mouseY <= 410) {
                beginRun(); // if the player clicks on the button, beginRun() is called from playScene.js
            }

            // CONTINUE RUN button
            if (mouseX >= 490 && mouseX <= 690 && mouseY >= 350 && mouseY <= 410) {
                continueRun(); // if the player clicks on the button, continueRun() is called from playScene.js
            }
        }
        // LOG IN button 
        if (mouseX >= 270 && mouseX <= 470 && mouseY >= 420 && mouseY <= 480) {
            currentScene = "login";
        }

        // SETTINGS button
        if (mouseX >= 490 && mouseX <= 690 && mouseY >= 420 && mouseY <= 480) {
            currentScene = "settings";
        }
    // this block handles navigation buttons (back buttons, etc) in other scenes
    } else {

        // back button area
        if (mouseX >= 30 && mouseX <= 170 && mouseY >= 30 && mouseY <= 80) {

            if (currentScene === "login") {
                currentScene = "title";
            } else if (currentScene === "register") {
                currentScene = "login";
            } else {
                currentScene = "title";
            }
        }
    }
}

// Show/hide settings form depending on the current scene
function updateSettingsForm() {
    const settingsForm = document.getElementById('settings-form');
    if (currentScene === "settings") {
        settingsForm.classList.remove('hidden');
    } else {
        settingsForm.classList.add('hidden');
    }
}

window.addEventListener("load", main); // initialize the app when the page finishes loading






