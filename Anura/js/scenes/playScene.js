/*

playScene.js
This file handles the main gameplay logic:
- frog behavior and movement
- keyboard input
- rendering of the playable scene
- enemy interactions
- game state, like pause, game over, etc
- scene transitions
Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */

"use strict";

let keys = {}; // tracks which keys are currently held down
let pause = false; // pause state flag
let isGameOver = false; // game over state flag

// run state variables for beginRun();
let currentHealth = 100;
let maxHealth = 100;
let runMosquitos = 0;
let currentLevel = 1;
let enemies = []; // Array for enemies
let damageNumbers = []; // array for damage numbers

// game loop id for stopping the game when there's a game over, 
// initialized as null since there's not an active game yet
let gameLoopID = null;
let activeRunId = null; // stores the current run's ID from the database


// --- GLOBAL ASSETS ---
let swampSurfaceBg = new Image();
swampSurfaceBg.src = "../Anura/assets/swamp_surface/swamp_surface_background.png";

// --- INPUT HANDLERS ---

function handleKeyUp(event) {
    keys[event.key] = false;
}

function handleKeyDown(event) {

}

// gameOver function that awaits for the server
async function gameOver() {
    if (isGameOver) return; // if game is already over, do nothing, prevents double triggers
    
    isGameOver = true; // sets gameOver to true

    // gameloop running check
    // stop game loop so the game freezes when the player dies
    if (gameLoopID !== null) { // if the game loop is not null
        cancelAnimationFrame(gameLoopID); // stops the next frame of the game from running
        gameLoopID = null; // theres no active game loop anymore
    }

    // deletes all active objects, enemies disappear and damage text disappears, prevents bugs so objects that are leftover stop updating, drawing, etc causing bugs
    enemies = [];
    damageNumbers = [];

    console.log("Game Over"); // for debugging
    
    // send death data to backend and WAIT for a reply, front end sends mosquitoes and deck to the backend
    const response = await saveProgressOnDeath();
    // shows what backend returned in JSON format
    console.log("Backend response:", response);

    // always transition to cardSelection screen from gameOver after 2 Seconds 
    setTimeout(() => {
        currentScene = "cardSelection";
        generateCardOffers();
    }, 2000);
}


// --- PLAY SCENE RENDERING ---

function drawPlayScene(deltaTime) {
    if (pause) return; // when pause is true, it exits the drawPlayScene(), nothing gets drawn, when pause is false, it continues drawing normally

    // clear previous frame and draw background
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(swampSurfaceBg, 0, 0, canvasWidth, canvasHeight);

    if (!isGameOver) {
        // update player and handle collisions
        if (frog) {
            frog.update(deltaTime, keys, platforms, canvasHeight, cameraX);

            updateCamera();
        }
        checkFrogEnemyCollisions(deltaTime);

        // when frog walks into the cave there's a transition to boss scene
        // check cave transition BEFORE drawing, outside camera transform
        if (caveEntrance && boxOverlap(frog, caveEntrance)) {
            currentScene = "boss";
            return; // exit drawPlayScene after transition
        }

        // Camera transformation for side-scrolling
        ctx.save(); 
        ctx.translate(-cameraX, 0);

        // actors array correctly removes marked enemies
        // Filter out enemies that have no health left, enemy disappears on next frame
        enemies = enemies.filter(enemy => enemy.health > 0);
        
        // Update and Draw all enemies
        enemies.forEach(enemy => {
            enemy.update(frog, deltaTime);
            enemy.draw(ctx);
        });

        // Placeholder platform rendering (will be replaced with sprites)
        ctx.fillStyle = "#4b3621"; 
        
        for (let plat of platforms) {
            ctx.fillRect(
                plat.position.x - plat.halfSize.x, 
                plat.position.y - plat.halfSize.y, 
                plat.size.x, 
                plat.size.y
            );
        }

        // placeholder cave entrance
        if (caveEntrance) {
            ctx.fillStyle = "#1a0a00";
            ctx.fillRect(
                caveEntrance.position.x - caveEntrance.halfSize.x,
                caveEntrance.position.y - caveEntrance.halfSize.y,
                caveEntrance.halfSize.x * 2,
                caveEntrance.halfSize.y * 2
            );
        }

        // draw player and restore camera transform
        if (frog) {
        frog.draw(ctx);
        }

        ctx.restore();

        damageNumbers.forEach(dn => {
            dn.update();
            dn.draw(ctx);
        });

        // filter goes through every item in the array and keeps only the ones with the true condition, it avoids expired numbers to stay in the array
        damageNumbers = damageNumbers.filter(dn => dn.alpha > 0);

        HealthBarDisplay();
        dispActiveUser();
        updateMosquitoHUD();
        drawCardHUD(deck);

        // flash effect timer for cards

        if (slot1FlashTimer > 0) {
            slot1FlashTimer -= deltaTime;
        }

        if (slot2FlashTimer > 0) {
            slot2FlashTimer -= deltaTime;
        }

        if (slot3FlashTimer > 0) {
            slot3FlashTimer -= deltaTime;
        }
        
    }

    // game Over rendering
    if (isGameOver) {
        drawGameOver();
    }

    backButton();
};

// --- PAUSE CONTROL ---

function pressPause() {
    pause = !pause; // toggle pause state

    // removed requestAnimationFrame here since it's handled in index.js
    // do not call it here to avoid multiple parallel loops
};

// --- GLOBAL INPUT LISTENERS ---

// track key releases
window.addEventListener("keyup", handleKeyUp);

// handle key presses
window.addEventListener('keydown', (event) => {
    keys[event.key] = true; // if a key is pressed -> sets to true
    
    // toggle pause (esc)
    if (event.key === 'Escape') {
        pressPause();
    }

    // REGULAR JUMP
    // jump (spacebar) only if the frog is on the ground to prevent double jumps
    if (event.key === ' ' && frog.isOnGround) { 
        frog.velocityY = frog.jumpForce; // set vertical speed 
        frog.isOnGround = false;
    // DOUBLE JUMP
    } else if (event.key === ' ' && frog.canDoubleJump && frog.hasDoubleJump && frog.doubleJumpCooldownTimer <= 0 && !frog.isOnGround) { // space was pressed and the ability is unlocked and a double jump is still available and frog is in the air
        frog.hasDoubleJump = false; // double jump consumed
        frog.doubleJumpCooldownTimer = frog.doubleJumpCooldown; // start the cooldown
        frog.velocityY = 0; // cancel downward velocity so the jump is clean
        frog.velocityY = frog.jumpForce * 1; // stronger jump force
        frog.isOnGround = false;
    }

    // dash (j key)
    // !event.repeat → only triggers on the first key press (not when holding the key)
    // only works if there's no active dash and the cooldown finished
    if (event.key === 'j' && !event.repeat && !frog.isDashing && frog.dashCooldownTimer <= 0) {
        frog.color = "blue";

        frog.isDashing = true;
        frog.dashTimer = frog.dashDuration; 
        frog.dashCooldownTimer = frog.dashCooldown;
    }

    // attack (i key)
    // requires cooldown to be ready, and is disabled while pausing
    if (event.key === 'i' && !event.repeat && frog.attackCooldown <= 0 && !pause) {
        frog.isAttacking = true;
        frog.attackTimer = frog.attackDuration;
        frog.attackCooldown = frog.cooldownDuration;
    }

    // card slot 1
    if (event.key === '1') {
        console.log(deck);
        if (deck.slot1_Movement.length > 0) {

            // reset the previously burned card
            if (lastBurnedSlot1 && lastBurnedSlot1.reset) {
                lastBurnedSlot1.reset();
            }

            deck.slot1_Movement[0].effect();
            slot1FlashTimer = 300;

            // burn the active card and save for reference
            lastBurnedSlot1 = deck.slot1_Movement.shift();// shift() method removes the first element from an array and returns it, shifting all remaining elements one position forward

            // replace    
            if (deck.slot1_Movement.length > 0) { // if the array has at least one element
                // randomRange(size,start) from game_functions.js
                let randomIndex = randomRange(deck.slot1_Movement.length); // generates a random index in the array
                let newCard = deck.slot1_Movement.splice(randomIndex, 1)[0]; // splice starts in randomIndex and will delete 1 element, thats the second argument, it will return it as an array, [0] gets the actual element, not the array, so basically it removes a random card and stores it in newCard
                deck.slot1_Movement.unshift(newCard); // adds the newCard to the beginning of the array with unshift() method
            }
        }
    }

    // card slot 2
    if (event.key === '2') {
        if (deck.slot2_Combat.length > 0) {

            // reset the previously burned card
            if (lastBurnedSlot2 && lastBurnedSlot2.reset) {
                lastBurnedSlot2.reset();
            }

            deck.slot2_Combat[0].effect();
            slot2FlashTimer = 300;

            // burn the active card and save for reference
            lastBurnedSlot2 = deck.slot2_Combat.shift(); 

            // replace
            if (deck.slot2_Combat.length > 0) {
                let randomIndex = randomRange(deck.slot2_Combat.length);
                let newCard = deck.slot2_Combat.splice(randomIndex, 1)[0];
                deck.slot2_Combat.unshift(newCard);
            }
        }
    }

    // card slot 3
    if (event.key === '3') {
        if (deck.slot3_Utility.length > 0) {

            // reset the previously burned card
            if (lastBurnedSlot3 && lastBurnedSlot3.reset) {
                lastBurnedSlot3.reset();
            }

            deck.slot3_Utility[0].effect();
            slot3FlashTimer = 300;

            // burn the active card and save for reference
            lastBurnedSlot3 = deck.slot3_Utility.shift(); 

            // replace
            if (deck.slot3_Utility.length > 0) {
                let randomIndex = randomRange(deck.slot3_Utility.length);
                let newCard = deck.slot3_Utility.splice(randomIndex, 1)[0];
                deck.slot3_Utility.unshift(newCard);
            }
        }
    }

});

// when a key is released, marks it as not pressed
window.addEventListener('keyup', (event) => {
    keys[event.key] = false; 
});

// --- BEGIN AND CONTINUE RUN ---

function beginRun() {
    // reset game state for a new run
    isGameOver = false; 
    createLevel(); // generates a new level layout with platforms and enemies
    
    currentHealth = 100;
    maxHealth = 100;
    runMosquitos = 0;
    currentLevel = 1;
    // deck = [];
    cameraX = 0;

    damageNumbers = [];


    if (frog) {
        frog.invincibilityTimer = 0; 
    } // resetting the timer for every new run


    currentScene = "play";

    //gameLoopID = requestAnimationFrame(draw); INACTIVE, AWAITING API
};

// Continue an existing run 
function continueRun() {
    isGameOver = false;

    currentHealth = 100;
    // runMosquitos, deck and currentLevel persist — will load from API when RF-49 expands
    currentScene = "play";

    //gameLoopID = requestAnimationFrame(draw); INACTIVE, AWAITING API
};


// DamageNumber constructor

class DamageNumber {
    constructor(x, y, amount) {
        this.x = x - cameraX;
        this.y = y;
        this.amount = amount;
        this.alpha = 1.0;
    }

    // update method, should move up and fade out every frame
    update() {
        this.y -= 0.6; 
        this.alpha -= 0.02;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "15px Pixelify Sans";
        ctx.globalAlpha = this.alpha
        ctx.textAlign = "center";
        ctx.fillText("-" + this.amount, this.x, this.y);
        ctx.restore();
    }

}


// GAME OVER async function for API call

async function saveProgressOnDeath() {
    const res = await fetch ("http://localhost:8080/run/death", {
        method: "POST",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify({
            mosquitoes: runMosquitos,
            session_id: activeSessionId
        })
    });

    return await res.json();
}