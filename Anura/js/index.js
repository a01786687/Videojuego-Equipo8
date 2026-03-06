/*
 * First script to draw some figures on the Canvas
 * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 *
 * Gilberto Echeverria
 * 2025-02-18
 */

"use strict";

console.log('hello world');

// Global variables
// Internal game resolution
const canvasWidth = 960;
const canvasHeight = 540;
const boxSize = 50;

// variable global canvas
let canvas;

// Context of the Canvas
let ctx;

// Imagen de fondo
let backgroundImage = new Image();
let bgReady = false;

// Logo del juego
let logo = new Image(); // Image() constructor
logo.src = "./assets/logoTemp.png";

// variable global para guardar la pantalla en la que está
let currentScene = "title";


function main() {
    // Get a reference to the object with id 'canvas' in the page
    const canvas = document.getElementById('canvas');

    // Resize the element, internal resolution
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Get the context for drawing in 2D
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    backgroundImage.onload = () => {
        bgReady = true;
    };
    backgroundImage.onerror = () => {
        console.log("Image failed to load.", backgroundImage.src);
    };

    backgroundImage.src = "./assets/titleScreenBG.png"
    logo.src = "./assets/logoTemp2.png";

    requestAnimationFrame(draw);


}

// funcion a parte para separar lo visual de la title screen a una funcion nueva
function drawTitleScreen() {

    // fondo primero
    if (bgReady) {
        ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
    } else {
        // fallback mientras carga

        // Draw a square
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // medidas logo
    const logoWidth = 400;
    const logoHeight = 400;

    // drawImage(image, dx, dy, dWidth, dHeight)
    let centerX = canvasWidth / 2 - logoWidth / 2
    ctx.drawImage(logo, centerX, 15, 400, 400)
    play();
    logIn();
    settings();

}

function draw() { // draw dibuja la escena actual
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    switch (currentScene) { // usamos switch para cambiar de scene 
        case "title": drawTitleScreen();
            break;

        case "login":
            drawLoginScene();
            break;

        case "play":
            drawPlayScene();
            break;

        case "setting":
            drawSettingScene();
            break;
    }

    requestAnimationFrame(draw);

}

window.addEventListener("load", main);

// creamos las otras pantallas como placeholders
function drawLoginScene() {
    ctx.fillStyle = "#2c3e50"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "white";
    ctx.font = "40px 'Pixelify Sans'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("LOGIN SCREEN", canvasWidth / 2, canvasHeight / 2);
}

function drawPlayScene() {
    ctx.fillStyle = "#2c3e50"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "white";
    ctx.font = "40px 'Pixelify Sans'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("PLAY SCREEN", canvasWidth / 2, canvasHeight / 2);
}

function drawSettingScene() {
    ctx.fillStyle = "#2c3e50"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "white";
    ctx.font = "40px 'Pixelify Sans'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SETTING SCREEN", canvasWidth / 2, canvasHeight / 2);
}

function resizeCanvas() {

    // Math.floor() method that rounds a number down to the nearest whole integer ex: 5.9 = 5
    // tip: for retro gamrs use integer scaling to avoid blurring

    const scaleX = Math.floor(window.innerWidth / canvasWidth);
    const scaleY = Math.floor(window.innerHeight / canvasHeight);

}





function play() {

    const buttonWidth = 200;
    const buttonHeight = 60;

    const buttonX = 240 - buttonWidth / 2;
    const buttonY = 400;

    ctx.fillStyle = "#000000";
    ctx.fillRect(buttonX + 4, buttonY + 4, buttonWidth, buttonHeight);

    ctx.fillStyle = "#895654";
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // border
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#61393b";
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // text
    ctx.fillStyle = "white";
    ctx.font = "24px 'Pixelify Sans'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Play", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);

}

function logIn() {
    const buttonWidth = 200;
    const buttonHeight = 60;

    const buttonX = 480 - buttonWidth / 2;
    const buttonY = 400;

    ctx.fillStyle = "#000000";
    ctx.fillRect(buttonX + 4, buttonY + 4, buttonWidth, buttonHeight);

    ctx.fillStyle = "#895654";
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // border
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#61393b";
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // text
    ctx.fillStyle = "white";
    ctx.font = "24px 'Pixelify Sans'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Log In", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);

}

function settings() {

    const buttonWidth = 200;
    const buttonHeight = 60;

    const buttonX = 720 - buttonWidth / 2;
    const buttonY = 400;

    ctx.fillStyle = "#000000";
    ctx.fillRect(buttonX + 4, buttonY + 4, buttonWidth, buttonHeight);

    ctx.fillStyle = "#895654";
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // border
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#61393b";
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // text
    ctx.fillStyle = "white";
    ctx.font = "24px 'Pixelify Sans'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Settings", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);

}

