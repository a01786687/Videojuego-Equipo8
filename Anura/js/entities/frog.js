/*
 * Player frog object with movement mechanics (walking, jumping, dashing, crouching), attack (tongue), invincibility, and health properties.
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */
"use strict";

// Frog object
let frog = {
    x: 0, 
    y: canvasHeight - 50,
    width: 50,
    height: 50,
    halfSize: { x: 25, y: 25 }, // Required for boxOverlap compatibility
    position: { x: canvasWidth / 2, y: canvasHeight / 2 }, // Sync with GameObject logic
    color: "#7ed967",

    // movement
    speed: 10,
    velocityY: 0, // used for jumping, current vertical speed, intitialized at 0
    isOnGround: true, // used for jumping
    gravity: 0.8, // pulls the frog down each frame
    jumpForce: -15, // makes the frog jump up, its negative because on the canvas Y increases down, so negative = up

    canDoubleJump: false,
    hasDoubleJump: false,
    doubleJumpCooldown: 3000,
    doubleJumpCooldownTimer: 0,

    // dash properties
    dashSpeed: 15,
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
    attackDuration: 100, // How long the tongue stays out (ms)
    attackCooldown: 0,
    cooldownDuration: 300, // Time between attacks (ms)
    tongueRange: 80,
    tongueWidth: 15,
    lastDirection: { x: 1, y: 0 }, // Stores the last move to aim the tongue

    //  RF-09 damage and invincibility
    invincibilityTimer: 0,
    invincibilityDuration: 1500, // (ms, so 1.5 s)
    damageAmount: 10, // how much health each hit takes
   
};

// function for resetting frog position and movement

function frogReset() {
    frog.velocityY = 0;
    frog.isOnGround = true;

    // collision position
    frog.position.x = frog.x + frog.width / 2;
    frog.position.y = frog.y + frog.height / 2;

    // Camera
    cameraX = 0;
}


function updateFrog(deltaTime) {
    let moveX = 0;

    // double jumo cooldown
    if (frog.doubleJumpCooldownTimer > 0){
        frog.doubleJumpCooldownTimer -= deltaTime;
    }

    if (frog.doubleJumpCooldownTimer < 0) {
        frog.doubleJumpCooldownTimer = 0;
        frog.hasDoubleJump = true;
    }
    
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

    // aim tongue up with W
    if (keys["w"]) { frog.lastDirection = {x: 0, y: -1 }; }
    // while the frog is dashing, it uses dash movement instead of normal movement
    if (frog.isDashing){
        frog.x += frog.dashSpeed * frog.dashDirection * (deltaTime / 16);
    } else {
        let currentSpeed; // empty cause it gets asigned depending if the frog is crouching or not
        
        if (frog.isCrouching) {
            currentSpeed = frog.speed * frog.crouchSpeed; // speed is slowed
        } else {
            currentSpeed = frog.speed; // normal speed
        }

        frog.x += moveX * currentSpeed * (deltaTime / 16);
    }

    // frog.dashDirection updates when A or D is pressed so the dash always goes the way the frog was last moving, ex if i was pressing a, frog moves to the left


    // gravity, pulls frog down every frame
    frog.velocityY += frog.gravity * (deltaTime / 16); // add gravity to speed, makes it fall faster
    if (frog.velocityY > 20) frog.velocityY = 20;
    frog.y += frog.velocityY * (deltaTime / 16); // move frog by that speed, updates the position

    frog.position.x = frog.x + frog.width / 2;

    for (let plat of platforms) {
        if (boxOverlap(frog, plat)) {
            if (moveX > 0) { // Colission going right
                frog.x = (plat.position.x - plat.halfSize.x) - frog.width;
            } else if (moveX < 0) { // Colision going left
                frog.x = (plat.position.x + plat.halfSize.x);
            }
            frog.position.x = frog.x + frog.width / 2;
        }
    }

    frog.position.y = frog.y + frog.height / 2;

    frog.isOnGround = false;

    for (let plat of platforms) {
        if (boxOverlap(frog, plat)) {
            if (frog.velocityY > 0) { // 
                
                frog.y = (plat.position.y - plat.halfSize.y) - frog.height;
                frog.velocityY = 0;
                frog.isOnGround = true;
                if (frog.canDoubleJump) {
                    frog.hasDoubleJump = true;
                }
            } else if (frog.velocityY < 0) { // colision going up, hitting head
                
                frog.y = (plat.position.y + plat.halfSize.y);
                frog.velocityY = 0;
            }
           
            frog.position.y = frog.y + frog.height / 2;
        }
    }


    // cheks if the floor is on the ground
    const groundY = canvasHeight - frog.height;
    if (frog.y >= groundY) {
        frog.y = groundY; // stay on ground
        frog.velocityY = 0; // stops moving down
        frog.isOnGround = true; // this allows jumping again
        if (frog.canDoubleJump === true) {
            frog.hasDoubleJump = true;
        }
    }


    // canvas limits
    if (frog.x < 0) frog.x = 0;
    if (frog.y < 0) frog.y = 0;
    if (frog.y + frog.height > canvasHeight) frog.y = canvasHeight - frog.height;

    

    updateCamera(); 

    if (frog.x < cameraX) {
    frog.x = cameraX;
    }
    

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

// movement needs / 16 to normalize to 60fps, timers don't because they're already in milliseconds