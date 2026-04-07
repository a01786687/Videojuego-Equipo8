/*
This file will include the frog, 
its movement, keyboard and the
drawing of a playable scene

 */

"use strict";

// variable for the pressing keys 
// tracks which keys are currently held down
let keys = {};

// variable for storing the pause flag
let pause = false;

// variables for beginRun();
let currentHealth = 100;
let HP_display;
let maxHealth = 100;
let runMosquitos = 0;
let currentLevel = 1;
let deck = []; // deck is empty on the first run, it will be loaded from the API when RF-47 is ready

// game loop id for stopping the game when there's a game over, it has null value, same as activeUser since there's no active game
let gameLoopID = null;

let activeRunId = null; // stores the current run's ID from the database

// Array for enemies
let enemies = [];

// --- GLOBAL VARIABLES ---
let swampSurfaceBg = new Image();
swampSurfaceBg.src = "../Anura/assets/swamp_surface/swamp_surface_background.png";

// Frog object
let frog = {
    x: canvasWidth / 2, // vienen de index.js, ya que como estan cargados del mismo HTML comparten mismo scope
    y: canvasHeight / 2,
    width: 50,
    height: 50,
    halfSize: { x: 25, y: 25 }, // Required for boxOverlap compatibility
    position: { x: canvasWidth / 2, y: canvasHeight / 2 }, // Sync with GameObject logic
    color: "#7ed967",

    // movement
    speed: 0.3,
    velocityY: 0, // used for jumping, current vertical speed, intitialized at 0
    isOnGround: true, // used for jumping
    gravity: 0.4, // pulls the frog down each frame
    jumpForce: -12, // makes the frog jump up, its negative because on the canvas Y increases down, so negative = up

    // dash properties
    dashSpeed: 12,
    dashDuration: 150, // ms
    dashTimer: 0,
    dashCooldown: 3000,
    dashCooldownTimer: 0,
    isDashing: false,
    dashDirection: 1, // 1 -> right, -1 -> left

    // crouch properties
    isCrouching: false,
    crouchSpeed: 0.4, // multiplier so it scales correctly to the speed its set to

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

    // enemy death method
    die() {
        this.health = 0;
        console.log(this.type, " has died");
        if (this.type === "mosquito") { // mosquito counter incremented
            runMosquitos++;
            updateMosquitoHUD();
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


function handleKeyUp(event) {
    keys[event.key] = false;
}

function handleKeyDown(event) {

}



function updateFrog(deltaTime) {
    let moveX = 0;
    console.log(keys);

    // dash timer countdown
    if (frog.isDashing) {
        frog.dashTimer -= deltaTime;
        if (frog.dashTimer <=0) {
            frog.color = "green";
            frog.isDashing = false;
        }
    }

    // dash cooldown
    if (frog.dashCooldownTimer > 0) {
        frog.dashCooldownTimer -= deltaTime;
    } 
    
    if (frog.dashCooldownTimer < 0) {
        frog.dashCooldownTimer = 0; // avoids negative value errors for cooldown timer
    }

    //crouch, only possible if the floor is on the grounf
    frog.isCrouching = (keys["s"] || keys["S"]) && frog.isOnGround;

    // Horizontal movement
    if (keys["a"]) { moveX = -1; frog.lastDirection = { x: -1, y: 0 }; frog.dashDirection = -1; } // left
    if (keys["d"]) { moveX = 1;  frog.lastDirection = { x: 1,  y: 0 }; frog.dashDirection = 1; } // right

    // while the frog is dashing, it uses dash movement instead of normal movement
    if (frog.isDashing){
        frog.x += frog.dashSpeed * frog.dashDirection;
    } else {
        let currentSpeed; // empty cause it gets asigned depending if the frog is crouching or not
        
        if (frog.isCrouching) {
            currentSpeed = frog.speed * frog.crouchSpeed; // speed is slowed
        } else {
            currentSpeed = frog.speed; // normal speed
        }

        frog.x += moveX * currentSpeed;
    }

    // frog.dashDirection updates when A or D is pressed so the dash always goes the way the frog was last moving, ex if i was pressing a, frog moves to the left


    // gravity, pulls frog down every frame
    frog.velocityY += frog.gravity; // add gravity to speed, makes it fall faster
    frog.y += frog.velocityY; // move frog by that speed, updates the position

    // cheks if the floor is on the ground
    const groundY = canvasHeight - frog.height;
    if (frog.y >= groundY) {
        frog.y = groundY; // stay on ground
        frog.velocityY = 0; // stops moving down
        frog.isOnGround = true; // this allows jumping again
    }


    // canvas limits
    if (frog.x < 0) frog.x = 0;
    if (frog.y < 0) frog.y = 0;
    if (frog.x + frog.width > canvasWidth) frog.x = canvasWidth - frog.width;
    if (frog.y + frog.height > canvasHeight) frog.y = canvasHeight - frog.height;
    

    // Sync frog position for collision logic (boxOverlap)
    frog.position.x = frog.x + frog.width / 2;
    frog.position.y = frog.y + frog.height / 2;


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

    // visual feedback for crounching, will be replaced with sprites in the future

    if (frog.isCrouching) {
        const crouchHeight = frog.height / 2; 
        const crouchWidth = frog.width * 1.2;
        const crouchX = frog.x - (crouchWidth - frog.width) / 2; // centers it
        const crouchY = frog.y + (frog.height - crouchHeight);
        ctx.fillRect(crouchX, crouchY, crouchWidth, crouchHeight);
    } else {
        ctx.fillRect(frog.x, frog.y, frog.width, frog.height);
    }
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
            updateHealthHUD();

            if (currentHealth <= 0) {
                currentHealth = 0; // avoids health errors like -5, -1, etc
                gameOver();
            }

        }
    });
}
function drawHeart(ctx, x, y, size) {
    ctx.fillStyle = "red";
    let s = size; 

    ctx.fillRect(x + s, y, s, s);
    ctx.fillRect(x + 3*s, y, s, s);

    ctx.fillRect(x, y + s, s, s);
    ctx.fillRect(x + s, y + s, s, s);
    ctx.fillRect(x + 2*s, y + s, s, s);
    ctx.fillRect(x + 3*s, y + s, s, s);
    ctx.fillRect(x + 4*s, y + s, s, s);

    ctx.fillRect(x, y + 2*s, s, s);
    ctx.fillRect(x + s, y + 2*s, s, s);
    ctx.fillRect(x + 2*s, y + 2*s, s, s);
    ctx.fillRect(x + 3*s, y + 2*s, s, s);
    ctx.fillRect(x + 4*s, y + 2*s, s, s);

    ctx.fillRect(x + s, y + 3*s, s, s);
    ctx.fillRect(x + 2*s, y + 3*s, s, s);
    ctx.fillRect(x + 3*s, y + 3*s, s, s);

    ctx.fillRect(x + 2*s, y + 4*s, s, s);
}
function drawHealthBar(ctx){
    ctx.fillStyle = "orange";
    
    ctx.fillRect((canvasWidth/16)-20,(canvasHeight-90)-5,2*currentHealth, 20);
}

function HealthBarDisplay(){
    drawHeart(ctx,(canvasWidth/16)-15,(canvasHeight-90)+20,10);
    HP_display = new TextLabel(20,canvasHeight-90,"80spx Ubuntu Mono","cyan");
    HP_display.draw(ctx,'%'+currentHealth);
    drawHealthBar(ctx);
}

// placeholder for the health HUD RF-14
function updateHealthHUD() {
    console.log('Health: ', currentHealth);
}

// placeholder for the mosquito HUD RF-24
function updateMosquitoHUD() {
    console.log('Mosquitoes: ', runMosquitos);
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
    //Draw the health game bar


    let deltaTime = 16;
    updateFrog(deltaTime);
    checkFrogEnemyCollisions(deltaTime);
    
    // actors array correctly removes marked enemies
    // Filter out enemies that have no health left, enemy disappears on next frame
    enemies = enemies.filter(enemy => enemy.health > 0);
    
    // Update and Draw current enemies
    enemies.forEach(enemy => {
        enemy.update(frog, deltaTime);
        enemy.draw(ctx);
    });

    drawFrog();
    HealthBarDisplay();
    backButton();
};

// PAUSE BUTTON

function pressPause() {
    pause = !pause; // toggle pause flag, flips true to false and false to true
    // removed call requestAnimationFrame here - the main draw loop in index.js already handles it
    // Multiple ESC presses were creating parallel animation frames, causing speed multipliers
};

// only one keydown listener for everything
window.addEventListener("keyup", handleKeyUp);

window.addEventListener('keydown', (event) => {
    keys[event.key] = true // if a key is pressed -> sets to true
    if (event.key === 'Escape') {
        pressPause();
    }

    // spacebar
    if (event.key === ' ' && frog.isOnGround) { // isOnGround prevents double jump, it goes dalse when you jump and returns to true when the ground check gets triggered
        frog.velocityY = frog.jumpForce; // jumps up
        frog.isOnGround = false; // avoids double jump
    }

    // dash
    // !event.repeat → only triggers on the first key press (not when holding the key)
    // dash only works if the frog is NOT already dashing and if the cooldown has finished
    if (event.key === 'j' && !event.repeat && !frog.isDashing && frog.dashCooldownTimer <= 0) {
                    frog.color = "blue";

        frog.isDashing = true;
        frog.dashTimer = frog.dashDuration; 
        frog.dashCooldownTimer = frog.dashCooldown;
    }

    // attack with 'i' key
    if (event.key === 'i' && !event.repeat && frog.attackCooldown <= 0 && !pause) {
        frog.isAttacking = true;
        frog.attackTimer = frog.attackDuration;
        frog.attackCooldown = frog.cooldownDuration;
    }
});

window.addEventListener('keyup', (event) => {
    keys[event.key] = false; // if a key is released -> sets to false
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