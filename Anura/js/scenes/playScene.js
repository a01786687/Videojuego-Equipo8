/*
This file will include the frog, 
its movement, keyboard and the
drawing of a playable scene

 */

"use strict";

// --- GLOBAL VARIABLES ---
let swampSurfaceBg = new Image();
swampSurfaceBg.src = "/Anura/assets/swamp_surface/swamp_surface_background.png";
// Frog object
let frog = {
    x: canvasWidth / 2, // vienen de index.js, ya que como estan cargados del mismo HTML comparten mismo scope
    y: canvasHeight / 2,
    width: 50,
    height: 50,
    halfSize: { x: 25, y: 25 }, // Required for boxOverlap compatibility
    position: { x: canvasWidth / 2, y: canvasHeight / 2 }, // Sync with GameObject logic
    color: "#7ed967",
    speed: 4,
    // Attack properties
    isAttacking: false,
    attackTimer: 0,
    attackDuration: 200, // How long the tongue stays out (ms)
    attackCooldown: 0,
    cooldownDuration: 500, // Time between attacks (ms)
    tongueRange: 60,
    tongueWidth: 15,
    lastDirection: { x: 1, y: 0 }, // Stores the last move to aim the tongue

    //  RF-09 damage and invincibility
    invincibilityTimer: 0,
    invincibilityDuration: 1500, // (ms, so 1.5 s)
    damageAmount: 10, // how much health each hit takes

};

// variable for the pressing keys 
// tracks which keys are currently held down
let keys = {};

// variable for storing the pause flag
let pause = false;

// variables for beginRun();
let currentHealth = 100;
let maxHealth = 100;
let runMosquitos = 0;
let currentLevel = 1;
let deck = []; // deck is empty on the first run, it will be loaded from the API when RF-47 is ready

// game loop id for stopping the game when there's a game over, it has null value, same as activeUser since there's no active game
let gameLoopID = null;

let activeRunId = null; // stores the current run's ID from the database

// Array for enemies
let enemies = [];

// --- ENEMY CLASS ---

const ENEMY_STATE = {
    PATROL: "patrol",
    CHASE: "chase",
    STUNNED: "stunned"
};

class Enemy extends AnimatedObject {
    constructor(x, y, width, height, color, type, sheetCols, range, health, damage = 0) {
        // Initialize GameObject with Vector position
        super(new Vector(x, y), width, height, color, type, sheetCols);
        
        this.state = ENEMY_STATE.PATROL;
        this.speed = 1.5;
        this.range = range;      // Patrol range
        this.startX = x;         // Pivot point
        this.direction = 1;      // Horizontal direction
        this.detectionRadius = 150;
        
        // Combat and Stun properties
        this.health = health;    // Each enemy can now have different health values
        this.stunTimer = 0;
        this.stunDuration = 800; // Time the enemy is disabled after being hit
        
        this.damage = damage;


        // Initialize spriteRect for AnimatedObject.js
        this.spriteRect = new Rect(0, 0, width, height);
    }

    // Method to handle receiving damage
    takeDamage(amount) {
        if (this.state === ENEMY_STATE.STUNNED) return; // Invulnerability frames during stun
        this.health -= amount;

        if (this.health <= 0) {
            this.die();
        } else {
            this.state = ENEMY_STATE.STUNNED;
            this.stunTimer = this.stunDuration;
        }
        console.log(`${this.type} hit! Remaining health: ${this.health}`);
    }

    die() {
        this.health = 0;
        console.log(this.type, " has died");
        if (this.type === "mosquito") {
            runMosquitos++;
            console.log("Mosquitoes collected:", runMosquitos);
        }
    }

    update(target, deltaTime) {
        // Stop movement logic if the enemy is stunned
        if (this.state === ENEMY_STATE.STUNNED) {
            this.stunTimer -= deltaTime;
            if (this.stunTimer <= 0) this.state = ENEMY_STATE.PATROL;
            return;
        }

        // Logic to track the player (frog)
        let dx = target.x - this.position.x;
        let dy = target.y - this.position.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // State switching
        if (distance < this.detectionRadius) {
            this.state = ENEMY_STATE.CHASE;
        } else {
            this.state = ENEMY_STATE.PATROL;
        }

        // Movement execution
        if (this.state === ENEMY_STATE.CHASE) {
            let angle = Math.atan2(dy, dx);
            this.position.x += Math.cos(angle) * this.speed;
            this.position.y += Math.sin(angle) * this.speed;
        } else {
            this.position.x += this.speed * this.direction;
            if (Math.abs(this.position.x - this.startX) > this.range) {
                this.direction *= -1;
            }
        }
        
        this.updateFrame(deltaTime);
        this.updateCollider();
    }

    draw(ctx) {
        // Visual feedback when stunned
        if (this.state === ENEMY_STATE.STUNNED) {
            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.position.x - this.halfSize.x, this.position.y - this.halfSize.y, this.size.x, this.size.y);
        }
        
        super.draw(ctx);
        ctx.globalAlpha = 1.0;
    }
}

// --- FUNCTIONS ---

function handleKeyDown(event) {
    keys[event.key] = true;
}

function handleKeyUp(event) {
    keys[event.key] = false;
}

// Global Mouse listener for the Tongue Attack
window.addEventListener('mousedown', (event) => {
    if (event.button === 0 && frog.attackCooldown <= 0 && !pause) { // Left click
        frog.isAttacking = true;
        frog.attackTimer = frog.attackDuration;
        frog.attackCooldown = frog.cooldownDuration;
    }
});

function updateFrog(deltaTime) {
    let moving = false;
    let moveX = 0;
    let moveY = 0;

    if (keys["w"]) { moveY = -1; moving = true; }
    if (keys["s"]) { moveY = 1; moving = true; }
    if (keys["a"]) { moveX = -1; moving = true; }
    if (keys["d"]) { moveX = 1; moving = true; }

    if (moving) {
        frog.x += moveX * frog.speed;
        frog.y += moveY * frog.speed;
        // Keep track of the last direction to aim the tongue
        frog.lastDirection = { x: moveX, y: moveY };
    }

    // Sync frog position for collision logic (boxOverlap)
    frog.position.x = frog.x + frog.width / 2;
    frog.position.y = frog.y + frog.height / 2;

    // canvas limits
    if (frog.x < 0) frog.x = 0;
    if (frog.y < 0) frog.y = 0;
    if (frog.x + frog.width > canvasWidth) frog.x = canvasWidth - frog.width;
    if (frog.y + frog.height > canvasHeight) frog.y = canvasHeight - frog.height;

    // Handle Attack timers
    if (frog.attackTimer > 0) {
        frog.attackTimer -= deltaTime;
        if (frog.attackTimer <= 0) frog.isAttacking = false;
    }
    if (frog.attackCooldown > 0) {
        frog.attackCooldown -= deltaTime;
    }
}

function drawFrog() {

    // blink effect during invincibility
    if (frog.invincibilityTimer > 0) {
        // every 150ms swap between visible 1.0 and invisible 0.3
        const blink = Math.floor(frog.invincibilityTimer / 150) % 2 === 0;
        if (blink) {
            ctx.globalAlpha = 0.3;
        } else {
            ctx.globalAlpha = 1.0; // this means fully visible
        }
    }

    ctx.fillStyle = frog.color;
    ctx.fillRect(frog.x, frog.y, frog.width, frog.height);
    ctx.globalAlpha;
    ctx.globalAlpha = 1.0;

    // Drawing the tongue attack if active
    if (frog.isAttacking) {
        ctx.fillStyle = "#ff7eb6"; // Tongue pink
        
        let tonguePosX = frog.position.x + (frog.lastDirection.x * frog.tongueRange / 2);
        let tonguePosY = frog.position.y + (frog.lastDirection.y * frog.tongueRange / 2);
        
        // Temporary tongue object for boxOverlap compatibility
        let tongueRect = {
            position: { x: tonguePosX, y: tonguePosY },
            halfSize: { 
                x: frog.lastDirection.x !== 0 ? frog.tongueRange / 2 : frog.tongueWidth / 2,
                y: frog.lastDirection.y !== 0 ? frog.tongueRange / 2 : frog.tongueWidth / 2
            }
        };

        // Render the tongue
        ctx.fillRect(
            tongueRect.position.x - tongueRect.halfSize.x,
            tongueRect.position.y - tongueRect.halfSize.y,
            tongueRect.halfSize.x * 2,
            tongueRect.halfSize.y * 2
        );

        // Check for hits against enemies
        enemies.forEach(enemy => {
            if (boxOverlap(tongueRect, enemy)) {
                enemy.takeDamage(1);
            }
        });
    }
}

// checkFrogEnemyCollisions() checks for collisions between enemies and frog
function checkFrogEnemyCollisions(deltaTime) {
    if (frog.invincibilityTimer > 0) {
        frog.invincibilityTimer -= deltaTime;
        return; // if the timer is still runing, we exit the function, collisions aren't checked
    }

    // loop through enemies, when the frog is NOT invincible, normal state, each enemy must be checked
    enemies.forEach(enemy => { 
        // check enemy against the frog
        if(enemy.state === ENEMY_STATE.STUNNED) return; // if the enemy state is stunned it doesnt deal damage so we skip it

        // check overlap using boxOverlap() to see if the frog and enemy are touching
        if (boxOverlap(frog, enemy)){
            if (enemy.damage > 0){ // only if the current enemy deals damage
                currentHealth -= enemy.damage; // use the enemy damage value,
            }
    
            frog.invincibilityTimer = frog.invincibilityDuration; // the 1.5s timer starts
            console.log('Frog hit, Health: ', currentHealth)

            // UPDATE HEALTH HUD GOES HERE

            if (currentHealth <= 0) {
                currentHealth = 0; // avoids health errors like -5, -1, etc
                gameOver();
            }

        }
    });
}


// temporary game over function MUST BE MODIFIED ON ITS ASSIGNED SPRINT

function gameOver() {
    console.log("Game Over, Health: ", currentHealth);
    cancelAnimationFrame(gameLoopID);
    currentScene = "menu";
}

// PLAY SCENE

function drawPlayScene() {
    if (pause) return; // when pause is true, it exits the drawPlayScene(), nothing gets drawn, when pause is false, it continues drawing normally
    //ctx.fillStyle = "#6fbf73"; // ctx viene de index.js
    //ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.drawImage(swampSurfaceBg, 0, 0, canvasWidth, canvasHeight);

    let deltaTime = 16;
    updateFrog(deltaTime);
    checkFrogEnemyCollisions(deltaTime);
    
    // Filter out enemies that have no health left
    enemies = enemies.filter(enemy => enemy.health > 0);
    
    // Update and Draw current enemies
    enemies.forEach(enemy => {
        enemy.update(frog, deltaTime);
        enemy.draw(ctx);
    });

    drawFrog();

    backButton();
};

// PAUSE BUTTON

function pressPause() {
    pause = !pause; // toggle pause flag, flips true to false and false to true
    if (!pause) { // if pause is false, the game is resuming/ restarting the game loop
        requestAnimationFrame(draw);
    }
};

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        pressPause();
    }
});

// BEGIN RUN

function beginRun() {
    currentHealth = 100;
    maxHealth = 100;
    runMosquitos = 0;
    currentLevel = 1;
    deck = [];

    frog.invincibilityTimer = 0; // resetting the timer for every new run

    // Initialize enemies for the level
    // Params: x, y, width, height, color, type, sheetCols, patrolRange, health
    enemies = [
        new Enemy(150, 150, 40, 40, "red", "mosquito", 4, 100, 2, 0), // Mosquito dies in 2 hits, deals 0 damage
        new Enemy(600, 300, 50, 50, "brown", "spider", 6, 80, 5, 10)   // Spider dies in 5 hits, deals 10 damage
    ];

    currentScene = "play";
    gameLoopID = requestAnimationFrame(draw);
};

/* async function beginRun() {
    currentHealth = 100;
    maxHealth = 100;
    runMosquitos = 0;
    currentLevel = 1;
    deck = [];

    // creating a new run in the database
    const result = await apiStartRun(activeSessionId);
    if (result.success) {
        activeRunId = result.runId;
    }

    currentScene = "play";
    // scene needs to be set BEFORE the loop starts drawing
    gameLoopID = requestAnimationFrame(draw);
        
};

*/

// CONTINUE RUN
function continueRun() {
    currentHealth = 100;
    // runMosquitos, deck and currentLevel persist — will load from API when RF-49 expands
    currentScene = "play";
    gameLoopID = requestAnimationFrame(draw);
};

/*
async function continueRun() {
    const result = await apiGetRun(activeUserId);
    
    if (result.success) {
        activeRunId = result.run.run_id;
        runMosquitos = result.run.mosquitoes_collected;
        currentLevel = result.run.stage_number || 1; // will be loaded from run_stages when ready
        currentHealth = 100; // temp, will be restored from API when RF-49 expands
    }

    currentScene = "play";
    gameLoopID = requestAnimationFrame(draw);

};
*/