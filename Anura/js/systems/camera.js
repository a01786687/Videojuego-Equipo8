/*
 * Side-scrolling camera system.
 */
"use strict";
 
let cameraX = 0;
let targetCameraX = 0;
 
function updateCamera() {
    if (!frog) return;
 
    if (currentScene === "boss") {
        // La cámara del boss se maneja en bossScene1.js
        return;
    }
 
    targetCameraX = frog.position.x - (canvasWidth / 2);
 
    if (targetCameraX < 0) targetCameraX = 0;
 
    // Lerp suave: elimina el jitter sin retrasar demasiado la cámara
    cameraX += (targetCameraX - cameraX) * 0.15;
}