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
// canvas resolution
const canvasWidth = 960;
const canvasHeight = 540;
const boxSize = 50;

// Global variables, shared across all scene files
let canvas;
let ctx;


let backgroundImage = new Image();
let bgReady = false;
let logo = new Image(); // Image() constructor

// current active scene
let currentScene = "title";

// main(), runs once when the page loads

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
    
    // handleKeyDown and handleKeyUp are defined in playScene.js
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

    // Each scene initializes its own form wiring
    initLoginScene();    // loginScene.js
    initRegisterScene(); // registerScene.js

    requestAnimationFrame(draw);
}

// Main game loop: only sends to scene files, doesnt draw them

function draw() { // draw dibuja la escena actual
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // titleScene.js
    switch (currentScene) { // usamos switch para cambiar de scene 
        case "title": drawTitleScreen();
            break; 

    // loginScene.js
        case "login":
            drawLoginScene();
            break;

    // registerScene.js
        case "register":
            drawRegisterScene();
            break;

    // playScene.js
        case "play":
            drawPlayScene();
            break;

    // settingScene.js
        case "settings":
            drawSettingScene();
            break;
    }

    updateLoginForm();
    updateRegisterForm();

    requestAnimationFrame(draw);
}

// click handler, controls global currentScene 
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
    } else {
        if (mouseX >= 30 && mouseX <= 170 && mouseY >= 30 && mouseY <= 80) {

            if (currentScene === "login") {
                currentScene = "title";
            }

            else if (currentScene === "register") {
                currentScene = "login";
            }

            else {
                currentScene = "title";
            }
        }
    }
}

window.addEventListener("load", main);










