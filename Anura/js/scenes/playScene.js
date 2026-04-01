/*
This file will include the frog, 
its movement, keyboard and the
drawing of a playable scene

 */

"use strict";

// Frog object

let frog = {
    x: canvasWidth / 2, // vienen de index.js, ya que como estan cargados del mismo HTML comparten mismo scope
    y: canvasHeight / 2,
    width: 50,
    height: 50,
    color: "#7ed967",
    speed: 4
};

// variable for the pressing keys 
// tracks which keys are currently held down
let keys = {};

// variable for storing the pause flag
let pause = false;

// variables for beginRun();
let currentHealth = 100;
let maxHealth = 100;
let runMosquitos = 0;
let currentLevel = 1;
let deck = []; // deck is empty on the first run, it will be loaded from the API when RF-47 is ready

// game loop id for stopping the game when there's a game over, it has null value, same as activeUser since there's no active game
let gameLoopID = null;


function handleKeyDown(event) {
    keys[event.key] = true;
}

function handleKeyUp(event) {
    keys[event.key] = false;
}

// frog movement logic

function updateFrog() {
    if (keys ["w"]) {
        frog.y -= frog.speed;
    }

    if (keys ["s"]) {
        frog.y += frog.speed;
    }

    if (keys ["a"]) {
        frog.x -= frog.speed;
    }

    if (keys ["d"]) {
        frog.x += frog.speed;
    }

    // canvas limits
    if (frog.x < 0){
        frog.x = 0;
    }

    if (frog.y < 0){
        frog.y = 0;
    }

    if (frog.x + frog.width > canvasWidth) {
        frog.x = canvasWidth - frog.width;
    }

    if (frog.y + frog.height > canvasHeight) {
        frog.y = canvasHeight - frog.height;
    }
}

// drawing the frog

function drawFrog() {
    ctx.fillStyle = frog.color;
    ctx.fillRect(frog.x, frog.y, frog.width, frog.height);
}


// PLAY SCENE

function drawPlayScene() {
    if (pause) return; // when pause is true, it exits the drawPlayScene(), nothing gets drawn, when pause is false, it continues drawing normally
    ctx.fillStyle = "#6fbf73"; // ctx viene de index.js
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    updateFrog();
    drawFrog();

    backButton();
};

// PAUSE BUTTON

function pressPause() {
    pause = !pause; // toggle pause flag, flips true to false and false to true
    if (!pause) { // if pause is false, the game is resuming/ restarting the game loop
        requestAnimationFrame(draw);
    }
};

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        pressPause();
    }
});

// BEGIN RUN

function beginRun() {
    currentHealth = 100;
    maxHealth = 100;
    runMosquitos = 0;
    currentLevel = 1;
    deck = [];

    currentScene = "play";

    // scene needs to be set BEFORE the loop starts drawing
    gameLoopID = requestAnimationFrame(draw);
};

// CONTINUE RUN

function continueRun() {
    currentHealth = 100; // temp value, currentHealth will be restored to the health the player had at the start of the last saved level
    // runMosquitos and deck persist across all runs and are NOT reset
    // currentLevel is restored to the last saved level (not reset to 1)
    // all three will be loaded from the API when RF/49 is ready
    currentScene = "play";

    gameLoopID = requestAnimationFrame(draw);

};