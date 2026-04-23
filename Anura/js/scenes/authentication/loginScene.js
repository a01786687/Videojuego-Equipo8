/*

loginScene.js
has everything about the login scene:
draws the canvas background and draws the form

This file will include the user authentication login screen, 
with a register button that takes you to the register scene
Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres

 */

"use strict";

let loginForm;
let goRegisterLink;

// called once from main() 
function initLoginScene() {

    // goes t
    // o the html and grabs the input element by its id
    loginForm = document.getElementById("login-form");
    goRegisterLink = document.getElementById("go-register");

    const usernameInput = document.getElementById("login-username");
    const passwordInput = document.getElementById("login-password");
    const loginButton = document.getElementById("login-button");
    const loginMessage = document.getElementById("login-message");
 
    goRegisterLink.addEventListener("click", () => {
        currentScene = "register";
        loginMessage.textContent = "";
    });

    loginButton.addEventListener("click", async () => {

        // input validation, we want to check the values when the 
        // user actually clicks the buttons, else the values would 
        // be checked when the page loads

        // .value -> is for input fields where users types
        // .textContent -> is for a paragraph element or when you want to display text
        
        if (!usernameInput.value || !passwordInput.value) {
            loginMessage.textContent = "Please fill in all fields."
        } 
        else {
            const result = await apiLogin(usernameInput.value, passwordInput.value); // changed from loginUser to apiLogin

            if (result.success == true) { // only runs if login was succesful
                activeUser = usernameInput.value;
                activeUserId = result.user_id; // stores the user_id that auth.js sends after successful login

                // RF-49 !!!! Creating a real session for the active user
                // sends a request to the /sessionStart endpoint
                const sessionRes = await fetch("http://localhost:8080/sessionStart", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"}, // so the server knows how to read the body 
                    body: JSON.stringify({user_id: result.user_id})
                });

                const sessionData = await sessionRes.json(); // server responds with { session_id: # }, .json() converts the response to a js object
        
                activeSessionId = sessionData.session_id; // storing the session_id
                loginMessage.textContent = "";
                currentScene = "title";
                
            }
            else{
                loginMessage.textContent = result.message;
                currentScene = "login";
            }
        }

        
        usernameInput.value = "";
        passwordInput.value = "";
    });
    
};


// Called every frame from the game loop in index.js
function updateLoginForm() {
    if (currentScene === "login") {
        loginForm.classList.remove("hidden");
    } else {
        loginForm.classList.add("hidden");
    }
};

function drawLoginScene() {
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "white";
    ctx.font = "32px 'Pixelify Sans'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Log In", canvasWidth / 2, 80);

    backButton();
};

