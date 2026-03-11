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

// variable global para guardar la pantalla en la que está
let currentScene = "title";


function main() {
    // Get a reference to the object with id 'canvas' in the page
    canvas = document.getElementById('canvas');

    // Resize the element, internal resolution
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Get the context for drawing in 2D
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // event listener, dentro de main ya que el canvas es global
    // click -> evento que queremos escuchar
    // handleClick -> funcion que se ejecutara cuando ocurra
    canvas.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyDown); // capturamos teclas
    window.addEventListener("keyup", handleKeyUp);

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

    if (bgReady) {
        ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
    } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);

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

        case "settings":
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

    backButton();
}

function drawSettingScene() {
    ctx.fillStyle = "#2c3e50"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "white";
    ctx.font = "40px 'Pixelify Sans'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SETTING SCREEN", canvasWidth / 2, canvasHeight / 2);

    backButton();
}

function resizeCanvas() {

    // Math.floor() method that rounds a number down to the nearest whole integer ex: 5.9 = 5
    // tip: for retro gamrs use integer scaling to avoid blurring

    const scaleX = Math.floor(window.innerWidth / canvasWidth);
    const scaleY = Math.floor(window.innerHeight / canvasHeight);

}

// BOTONES

function play() {

    const buttonWidth = 200;
    const buttonHeight = 60;

    const buttonX = 240 - buttonWidth / 2; // 140
    const buttonY = 400; // 400

    // X: 140 a 340
    // Y: 400 a 460

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

    const buttonX = 480 - buttonWidth / 2; // 380
    const buttonY = 400; // 400

    // X: 380 a 580 ( buttonX + buttonWidth)
    // Y: 400 a 460 ( buttonY + buttonHeight)


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

    const buttonX = 720 - buttonWidth / 2; // 620
    const buttonY = 400; // 400

    // X: 620 a 820 ( buttonX + buttonWidth)
    // Y: 400 a 460 ( buttonY + buttonHeight)

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

function backButton() {
    const buttonWidth = 140;
    const buttonHeight = 50;

    const buttonX = 30;
    const buttonY = 30;

    ctx.fillStyle = "#000000"
    ctx.fillRect(buttonX + 4, buttonY + 4, buttonWidth, buttonHeight);

    ctx.fillStyle = "#895654"
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // border
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#61393b";
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // text
    ctx.fillStyle = "white";
    ctx.font = "15px 'Pixelify Sans'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Back to Title", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
}


// cada vez que haga click dentro del canvas, la consola mostrará el mensaje
function handleClick(event) {
    console.log("Canvas clicked");

    // convertimos coordenadas de la pantalla a coordenadas del canvas
    // getBoundingClientRect()
    // This method handles CSS transforms and borders accurately by subtracting the canvas position from the click position
    const rect = canvas.getBoundingClientRect(); // getBoundingClientRect() obtiene la posición del canvas en la página.

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    console.log(mouseX, mouseY);

    // TITLE SCREEN BOTONES

    /*
    PLAY
    X: 140 a 340
    Y: 400 a 460

    LOGIN
    X: 380 a 580 ( buttonX + buttonWidth)
    Y: 400 a 460

    SETTINGS
    X: 620 a 820 ( buttonX + buttonWidth)
    Y: 400 a 460

    */

    // PLAY BUTTON
    // si las coordenadas de mouseX son mayor o igual a 140 Y las coordenadas de mouseY son menor o igual a 340 Y 
    
    if (currentScene == "title") {
    
        if (mouseX >= 140 && mouseX <= 340 && mouseY >= 400 && mouseY <= 460) {
            currentScene = "play";
        }

        // LOG IN BUTTON 
        if (mouseX >= 380 && mouseX <= 580 && mouseY >= 400 && mouseY <= 460) {
            currentScene = "login";
        }

        // SETTINGS BUTTON
        if (mouseX >= 620 && mouseX <= 820 && mouseY >= 400 && mouseY <= 460) {
            currentScene = "settings";
        }
    // ESTO LO UTILIZAREMOS PARA DETECTAR BOTONES
    }

    // BACK BUTTON

    // X: 30 a 170
    // Y: 30 a 80

    else {
        if (mouseX >= 30 && mouseX <= 170 && mouseY >= 30 && mouseY <= 80) {
            currentScene = "title";
        }
    }
}








