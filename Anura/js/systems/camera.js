/*
 * Side-scrolling camera system that follows the frog horizontally with bounds checking.
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */
"use strict";

let cameraX = 0;

function updateCamera() {
    
    cameraX = frog.x - (canvasWidth / 2);

    if (cameraX < 0) {
        cameraX = 0;
    }

}