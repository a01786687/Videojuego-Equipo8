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

// Context of the Canvas
let ctx;

// Imagen de fondo
let backgroundImage = new Image();
let bgReady = false;

// Logo del juego
let logo = new Image(); // Image() constructor
logo.src = "./assets/logoTemp.png";




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
    logo.src = "./assets/logoTemp.png";

    requestAnimationFrame(draw);


}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    // TODO: Make different shapes using the canvas 2d functions

    requestAnimationFrame(draw);

}

window.addEventListener("load", main);

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

function drawBunny() {
    // Draw another shape
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";

    const bunny = {
        x: 500,
        y: 100,
        size: 150
    }

    // Left ear
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(bunny.x + bunny.size / 2 - bunny.size / 4, bunny.y + bunny.size / 2 - bunny.size / 6,
        bunny.size / 6, bunny.size / 3, -Math.PI / 4, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.stroke();

    // Right ear
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(bunny.x + bunny.size / 2 + bunny.size / 4, bunny.y + bunny.size / 2 - bunny.size / 6,
        bunny.size / 6, bunny.size / 3, Math.PI / 4, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.stroke();

    // Face
    ctx.beginPath();
    ctx.ellipse(bunny.x + bunny.size / 2, bunny.y + bunny.size / 2 + bunny.size / 6,
        bunny.size / 3, bunny.size / 3, 0, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.stroke();

}

function house() {
    // Set line width
    ctx.lineWidth = 10;

    ctx.fillStyle = "black";

    // Wall
    ctx.strokeRect(75, 140, 150, 110);

    // Door
    ctx.fillRect(130, 190, 40, 60);

    // Roof
    ctx.beginPath();
    ctx.moveTo(50, 140);
    ctx.lineTo(150, 60);
    ctx.lineTo(250, 140);
    ctx.closePath();
    ctx.stroke();
}