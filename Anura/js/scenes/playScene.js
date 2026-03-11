/*
This file will include the frog, 
its movement, keyboard and the
drawing of a playable scene

 */

"use strict";

// Frog

let frog = {
    x: canvasWidth / 2, // vienen de index.js, ya que como estan cargados del mismo HTML comparten mismo scope
    y: canvasHeight / 2,
    width: 50,
    height: 50,
    color: "#7ed967",
    speed: 4
};

// variable for the pressing keys 

let keys = {};

// player input

function handleKeyDown(event) {
    keys[event.key] = true;
}

function handleKeyUp(event) {
    keys[event.key] = false;
}

// FROG LOGIC

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
    ctx.fillStyle = "#6fbf73"; // ctx viene de index.js
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    updateFrog();
    drawFrog();

    backButton();
}
