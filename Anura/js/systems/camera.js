/*
 * Side-scrolling camera system.
 * Uses lerp (linear interpolation) so the camera follows smoothly https://dev.to/rachsmith/lerp-2mh7
 * instead of snapping to the frog every frame, which caused jitter.
 */
"use strict";
 
let cameraX       = 0;
let targetCameraX = 0;
 
function updateCamera() {
    if (!frog) return;
 
    // Boss camera is managed entirely inside bossScene1.js
    if (currentScene === "boss") return;
 
    targetCameraX = frog.position.x - canvasWidth / 2;
    if (targetCameraX < 0) targetCameraX = 0;
 
    // Lerp factor 0.15: smooth enough to avoid jitter, fast enough to feel responsive
    cameraX += (targetCameraX - cameraX) * 0.15;
}