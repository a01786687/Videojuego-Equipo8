/*
 * index.js
 * Handles main loop, canvas setup, and scene management.
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

let bgReady = false;
let backgroundImage = new Image();
let logo = new Image(); // Image() constructor
let loginRegisterBg = new Image();
let cardSelectionSceneBg = new Image();

// audio assets
let titleMusic;
let swampSurfaceMusic;
let bossMusic;

// global volume control
let currentVolume = 0.5;

// sound effect assets
let tongueAttackSound;

// tile set images
// platform tileset
let Tile_02 = new Image();
Tile_02.src = "../Anura/assets/tileset/Tile_02.png";

let Tile_12 = new Image();
Tile_12.src = "../Anura/assets/tileset/Tile_12.png";

let Tile_61 = new Image();
Tile_61.src = "../Anura/assets/tileset/Tile_61.png";

// current active scene
let currentScene = "title";

let previousScene = "title"; 

// this is for tracking where we came from when going to settings
let sceneBeforeSettings = null;

let isVictory = false;

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

    // login and register scene bacgkround
    loginRegisterBg.src = "../Anura/assets/login_registerBg.png";

    // cardSelectionScene background
    cardSelectionSceneBg.src = "../Anura/assets/cardSelectionSceneBg.png";

    // add audio element

    // title screen music
    titleMusic = document.createElement("audio");
    titleMusic.src = "./assets/music/titleScreenMusic.wav";

    // swamp surface music
    swampSurfaceMusic = document.createElement("audio");
    swampSurfaceMusic.src = "./assets/music/swampSurfaceMusic.wav";

    // boss fight music
    bossMusic = document.createElement("audio");
    bossMusic.src = "./assets/music/bossMusic.wav";

    // SOUND EFFECTS

    // tongue attack sound effect
    tongueAttackSound = document.createElement("audio");
    tongueAttackSound.src = "./assets/music/tongueAttack.wav";

    // Each scene initializes its own form wiring
    initLoginScene();    // loginScene.js
    initRegisterScene(); // registerScene.js

    requestAnimationFrame(draw);
}

// Main game loop: only sends to scene files, doesnt draw them

function draw(newTime) { // draws the actual scene

    if (currentScene !== previousScene) {
        if (currentScene === "title" || currentScene === "login" || currentScene === "register" || currentScene === "settings") {
            playTitleMusic();
            stopSwampSurfaceMusic();
            stopBossMusic();
        } else if (currentScene === "play") {
            stopTitleMusic();
            playSwampSurfaceMusic();
            stopBossMusic();
        } else if (currentScene === "boss") {
            stopTitleMusic();
            stopSwampSurfaceMusic();
            playBossMusic();
        } else {
            stopTitleMusic();
            stopSwampSurfaceMusic();
            stopBossMusic();
        }

        oldTime = newTime;
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

    // bossScene2.js — eagle boss (final boss)
        case "eagle_boss":
            drawBossScene2(deltaTime);
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

    // console.log(mouseX, mouseY); DEBUGGING


    // --- VICTORY SCREEN CLICK ---
    if (isVictory) {
        // back to Title button bounds
        const buttonWidth = 200;
        const buttonHeight = 60;
        const buttonX = (canvasWidth - buttonWidth) / 2;
        const buttonY = 400;

        if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
            mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
            // click on button
            isVictory = false;
            loadUserStats(); // load stats after victory
            currentScene = "title";
            return;  // important to stop processing clicks
        }
        return;  // if we're on victory, we don't process other clicks
    }

    // handle pause menu clicks
    if ((currentScene === "play" || currentScene === "boss" || currentScene === "eagle_boss") && pause) {
        const buttonWidth = 280;
        const buttonHeight = 60;
        const buttonX = (canvasWidth - buttonWidth) / 2;

        // resume button y = 240
        if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth && 
            mouseY >= 240 && mouseY <= 240 + buttonHeight) {
            pause = false;  // unpause the game
            return;
        }

        // Settings button y = 330
        if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth && 
            mouseY >= 330 && mouseY <= 330 + buttonHeight) {
            sceneBeforeSettings = "play";
            pause = false;  // unpause first
            currentScene = "settings";  // go to settings
            return;
        }

        // back to menu button y = 420
        if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth && 
            mouseY >= 420 && mouseY <= 420 + buttonHeight) {
            pause = false;
            currentScene = "title";  // go to title screen
            return;
        }
    }

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

    // ---- TITLE SCENE CLICK HANDLERS ----

    // Handle clicks depending on the current scene
    if (currentScene == "title") {
        if (activeUser !== null && activeUser !== undefined) {

            // user IS logged in -> show game buttons and logout

            // START RUN button (was New Game)
            if (mouseX >= 270 && mouseX <= 470 && mouseY >= 350 && mouseY <= 410) {
                beginRun(); //  starts a fresh run with saved deck and mosquitoes, if the player clicks on the button, beginRun() is called from playScene.js
            }

            // removed CONTINUE RUN button

            // LOG OUT button its the same position as login button
            if (mouseX >= 270 && mouseX <= 470 && mouseY >= 420 && mouseY <= 480) {
                if (confirm("Are you sure you want to log out?")) {
                    logoutUser();
                }
            }

        } else {
            
            // user is NOT logged in -> only show login button

            // LOG IN button 
            if (mouseX >= 270 && mouseX <= 470 && mouseY >= 420 && mouseY <= 480) {
                currentScene = "login";
            }
        }

        // SETTINGS button ALWAYS AVAILABLE 
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
            } else if (currentScene === "settings" && sceneBeforeSettings === "play") {
                // if we came from pause menu, go back to paused game
                currentScene = "play";
                pause = true;  // pause the game
                sceneBeforeSettings = null;  // clear the memory of sceneBefore settings
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





