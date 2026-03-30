/*
 * File: registerScene.js
 *
 * wwns everything about the register scene:
Canvas background drawing
 *   - HTML form wiring (show/hide, navigation links)
 */

"use strict";

let registerForm;
let goLoginLink;

// called once from main() 
function initRegisterScene() {

    registerForm = document.getElementById("register-form");
    goLoginLink  = document.getElementById("go-login");

    const usernameInput = document.getElementById("register-username");
    const passwordInput = document.getElementById("register-password");
    const registerButton = document.getElementById("register-button");
    const registerMessage = document.getElementById("register-message");
 
    goLoginLink.addEventListener("click", () => {
        currentScene = "login";
    });

    registerButton.addEventListener("click", () => {

        // input validation, we want to check the values when the 
        // user actually clicks the buttons, else the values would 
        // be checked when the page loads

        // .value -> is for input fields where users types
        // .textContent -> is for a paragraph element or when you want to display text

        if (!usernameInput.value || !passwordInput.value){
            registerMessage.textContent = "Please fill in all fields."
        } else {
            const result = registerUser(usernameInput.value, passwordInput.value);
            registerMessage.textContent = result.message;
            if (result.success === true){
                registerMessage.textContent = "";
                currentScene = "login";
            }
        }

        usernameInput.value = "";
        passwordInput.value = "";
        
    });
};

// Called every frame from the game loop in index.js
function updateRegisterForm() {
    if (currentScene === "register") {
        registerForm.classList.remove("hidden");
    } else {
        registerForm.classList.add("hidden");
    }
};

function drawRegisterScene() {
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "white";
    ctx.font = "32px 'Pixelify Sans'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Register", canvasWidth / 2, 80);

    backButton();
};