/*
 * Side-scrolling camera system.
 */
"use strict";

let cameraX = 0;

function updateCamera() {
    // Check if frog exists before trying to access its position
    if (frog) {
        // Use frog.position.x because it's a class now
        cameraX = frog.position.x - (canvasWidth / 2);

        // Keep camera within left bounds
        if (cameraX < 0) {
            cameraX = 0;
        }
    }
    
    if (currentScene === "boss") {
        cameraX = 0;
        return;
    }
}