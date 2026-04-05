/*
This file will include the frog, 
its movement, keyboard and the
drawing of a playable scene

 */

"use strict";

// --- GLOBAL VARIABLES ---

// Frog object
let frog = {
    x: canvasWidth / 2, // vienen de index.js, ya que como estan cargados del mismo HTML comparten mismo scope
    y: canvasHeight / 2,
    width: 50,
    height: 50,
    color: "#7ed967",
    speed: 4
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
    constructor(x, y, width, height, color, type, sheetCols, range) {
        // Initialize GameObject with a Vector for position as required by your library
        super(new Vector(x, y), width, height, color, type, sheetCols);
        
        this.state = ENEMY_STATE.PATROL;
        this.speed = 1.5;
        this.range = range;      // Total distance the enemy can patrol from startX
        this.startX = x;         // Pivot point for patrolling logic
        this.direction = 1;      // Horizontal direction: 1 (right) or -1 (left)
        this.detectionRadius = 150; // Distance to switch from patrol to chase
        
        this.stunTimer = 0;
        this.stunDuration = 1000; // Stun time in milliseconds
    }

    update(target, deltaTime) {
        // If stunned, decrease timer and skip movement logic
        if (this.state === ENEMY_STATE.STUNNED) {
            this.stunTimer -= deltaTime;
            if (this.stunTimer <= 0) this.state = ENEMY_STATE.PATROL;
            return;
        }

        // Calculate distance between enemy center and frog
        let dx = target.x - this.position.x;
        let dy = target.y - this.position.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // State Machine transitions
        if (distance < this.detectionRadius) {
            this.state = ENEMY_STATE.CHASE;
        } else {
            this.state = ENEMY_STATE.PATROL;
        }

        // Behavior based on current state
        if (this.state === ENEMY_STATE.CHASE) {
            // Move towards the player using trigonometry
            let angle = Math.atan2(dy, dx);
            this.position.x += Math.cos(angle) * this.speed;
            this.position.y += Math.sin(angle) * this.speed;
        } else {
            // Horizontal patrol movement (MRU)
            this.position.x += this.speed * this.direction;
            // Reverse direction if out of range
            if (Math.abs(this.position.x - this.startX) > this.range) {
                this.direction *= -1;
            }
        }
        
        // Update animation frames and collider sync
        this.updateFrame(deltaTime);
        this.updateCollider();
    }

    
    
}

// --- FUNCTIONS ---

function handleKeyDown(event) {
    keys[event.key] = true;
}

function handleKeyUp(event) {
    keys[event.key] = false;
}

// frog movement logic

function updateFrog() {
    if (keys ["w"]) {
        frog.y -= frog.speed;
    }

    if (keys ["s"]) {
        frog.y += frog.speed;
    }

    if (keys ["a"]) {
        frog.x -= frog.speed;
    }

    if (keys ["d"]) {
        frog.x += frog.speed;
    }

    // canvas limits
    if (frog.x < 0){
        frog.x = 0;
    }

    if (frog.y < 0){
        frog.y = 0;
    }

    if (frog.x + frog.width > canvasWidth) {
        frog.x = canvasWidth - frog.width;
    }

    if (frog.y + frog.height > canvasHeight) {
        frog.y = canvasHeight - frog.height;
    }
}

// drawing the frog

function drawFrog() {
    ctx.fillStyle = frog.color;
    ctx.fillRect(frog.x, frog.y, frog.width, frog.height);
}


// PLAY SCENE

function drawPlayScene() {
    if (pause) return; // when pause is true, it exits the drawPlayScene(), nothing gets drawn, when pause is false, it continues drawing normally
    ctx.fillStyle = "#6fbf73"; // ctx viene de index.js
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    updateFrog();
    
    // Update and Draw enemies loop
    let deltaTime = 16; // Constant frame time for 60FPS simulation
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

    // Initialize enemies for the level with specific ranges and types
    // Using new Enemy(x, y, width, height, color, type, sheetCols, patrolRange)
    enemies = [
        new Enemy(150, 150, 40, 40, "red", "mosquito", 4, 100),
        new Enemy(600, 300, 50, 50, "brown", "spider", 6, 80)
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