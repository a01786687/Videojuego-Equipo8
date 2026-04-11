/*
 * Boss fight scene placeholder with background and back button.
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */
"use strict";

let predatorArenaBg = new Image();
predatorArenaBg.src = "../Anura/assets/predator_arena/predator_arena_background.png";

function drawBossScene1() {

    ctx.drawImage(predatorArenaBg, 0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "white";
    ctx.font = "48px Pixelify Sans";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("BOSS FIGHT", canvasWidth / 2, canvasHeight / 2);

    backButton(); 
}