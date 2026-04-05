/*
This file includes the frog, its movement, keyboard handling,
the drawing of the playable scene, and enemy implementation.
*/

"use strict";

// --- ENEMY IMPLEMENTATION ---

const ENEMY_STATE = {
    PATROL: "patrol",
    CHASE: "chase",
    STUNNED: "stunned"
};

class Enemy extends AnimatedObject {
    constructor(x, y, width, height, color, type, sheetCols, range) {
        // Position passed as an object {x, y} to match GameObject/AnimatedObject
        super({ x: x, y: y }, width, height, color, type, sheetCols);

        this.state = ENEMY_STATE.PATROL;
        this.speed = 1.5;
        this.range = range;      // Patrolling distance
        this.startX = x;         // Origin point for patrol
        this.direction = 1;      // 1 for Right, -1 for Left
        
        this.detectionRadius = 150; // Distance to start chasing the frog
        this.stunTimer = 0;
        this.stunDuration = 1000;   // 1 second of stun
    }

    update(target, deltaTime) {
        if (this.state === ENEMY_STATE.STUNNED) {
            this.stunTimer -= deltaTime;
            if (this.stunTimer <= 0) {
                this.state = ENEMY_STATE.PATROL;
            }
            return;
        }

        // Calculate distance to the frog (target)
        let dx = target.x - this.position.x;
        let dy = target.y - this.position.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // State machine logic
        if (distance < this.detectionRadius) {
            this.state = ENEMY_STATE.CHASE;
        } else {
            this.state = ENEMY_STATE.PATROL;
        }

        if (this.state === ENEMY_STATE.CHASE) {
            let angle = Math.atan2(dy, dx);
            this.position.x += Math.cos(angle) * this.speed;
            this.position.y += Math.sin(angle) * this.speed;
        } else if (this.state === ENEMY_STATE.PATROL) {
            this.position.x += this.speed * this.direction;
            if (Math.abs(this.position.x - this.startX) > this.range) {
                this.direction *= -1;
            }
        }

        this.updateFrame(deltaTime);
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        if (this.state === ENEMY_STATE.STUNNED) ctx.globalAlpha = 0.5;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        ctx.globalAlpha = 1.0;
    }
}

// --- GAME OBJECTS & VARIABLES ---

// Frog object
let frog = {
    x: canvasWidth / 2, 
    y: canvasHeight / 2,
    width: 50,
    height: 50,
    color: "#7ed967",
    speed: 4
};

// Array for enemies
let enemies = [];

// Variable for the pressing keys 
let keys = {};

// Variable for storing the pause flag
let pause = false;

// Variables for beginRun();
let currentHealth = 100;
let maxHealth = 100;
let runMosquitos = 0;
let currentLevel = 1;
let deck = []; 

// Game loop id
let gameLoopID = null;

let activeRunId = null; 

// --- UTILS ---

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.position.x + rect2.width &&
           rect1.x + rect1.width > rect2.position.x &&
           rect1.y < rect2.position.y + rect2.height &&
           rect1.y + rect1.height > rect2.position.y;
}

// --- INPUT HANDLING ---

function handleKeyDown(event) {
    keys[event.key] = true;
}

function handleKeyUp(event) {
    keys[event.key] = false;
}

// --- LOGIC & DRAWING ---

function updateFrog() {
    if (keys["w"]) {
        frog.y -= frog.speed;
    }
    if (keys["s"]) {
        frog.y += frog.speed;
    }
    if (keys["a"]) {
        frog.x -= frog.speed;
    }
    if (keys["d"]) {
        frog.x += frog.speed;
    }

    // Canvas limits
    if (frog.x < 0) {
        frog.x = 0;
    }
    if (frog.y < 0) {
        frog.y = 0;
    }
    if (frog.x + frog.width > canvasWidth) {
        frog.x = canvasWidth - frog.width;
    }
    if (frog.y + frog.height > canvasHeight) {
        frog.y = canvasHeight - frog.height;
    }
}

function drawFrog() {
    ctx.fillStyle = frog.color;
    ctx.fillRect(frog.x, frog.y, frog.width, frog.height);
}

// PLAY SCENE

function drawPlayScene() {
    if (pause) return; 
    
    ctx.fillStyle = "#6fbf73"; 
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    updateFrog();
    
    // Update and Draw Enemies
    let deltaTime = 16; // Approx. 60fps frame time
    enemies.forEach(enemy => {
        enemy.update(frog, deltaTime);
        enemy.draw(ctx);

        // Check for collision with player
        if (checkCollision(frog, enemy) && enemy.state !== ENEMY_STATE.STUNNED) {
            currentHealth -= 0.2; // Damage player
            console.log("Health: " + Math.floor(currentHealth));
        }
    });

    drawFrog();
    backButton();
}

// PAUSE BUTTON

function pressPause() {
    pause = !pause; 
    if (!pause) { 
        requestAnimationFrame(draw);
    }
}

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        pressPause();
    }
});

// BEGIN RUN

async function beginRun() {
    currentHealth = 100;
    maxHealth = 100;
    runMosquitos = 0;
    currentLevel = 1;
    deck = [];

    // Initialize enemies
    enemies = [
        new Enemy(100, 100, 40, 40, "red", "mosquito", 4, 100),
        new Enemy(600, 400, 50, 50, "brown", "spider", 6, 150)
    ];

    // Creating a new run in the database
    const result = await apiStartRun(activeSessionId);
    if (result.success) {
        activeRunId = result.runId;
    }

    currentScene = "play";
    gameLoopID = requestAnimationFrame(draw);
}

// CONTINUE RUN

async function continueRun() {
    const result = await apiGetRun(activeUserId);
    
    if (result.success) {
        activeRunId = result.run.run_id;
        runMosquitos = result.run.mosquitoes_collected;
        currentLevel = result.run.stage_number || 1; 
        currentHealth = 100; 
    }

    currentScene = "play";
    gameLoopID = requestAnimationFrame(draw);
}