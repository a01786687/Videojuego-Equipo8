/*
This file will include the frog, 
its movement, keyboard and the
drawing of a playable scene

 */

"use strict";

// Frog

let frog = {
    x: canvasWidth / 2,
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