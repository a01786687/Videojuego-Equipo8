/*
 * Player frog class inheriting from AnimatedPlayer.
 * Handles movement mechanics (walking, jumping, dashing),
 * attack (tongue), invincibility, and collision properties.
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */
"use strict";

// Motion config for AnimatedPlayer — maps logical states to frame ranges
// moveFrames: [start, end] | idleFrames: [start, end]
const frogMotion = {
    idle:    { status: false, axis: "x", sign:  0, repeat: true,  duration: 120, moveFrames: [0,  3],  idleFrames: [0,  3]  },
    right:   { status: false, axis: "x", sign:  1, repeat: true,  duration: 100, moveFrames: [4,  7],  idleFrames: [0,  3]  },
    left:    { status: false, axis: "x", sign: -1, repeat: true,  duration: 100, moveFrames: [4,  7],  idleFrames: [0,  3]  },
    jump:    { status: false, axis: "y", sign: -1, repeat: false, duration: 80,  moveFrames: [8,  11], idleFrames: [0,  3]  },
    fall:    { status: false, axis: "y", sign:  1, repeat: false, duration: 80,  moveFrames: [16, 19], idleFrames: [0,  3]  },
    attack:  { status: false, axis: "x", sign:  0, repeat: false, duration: 80,  moveFrames: [12, 15], idleFrames: [0,  3]  },
    attackL: { status: false, axis: "x", sign:  0, repeat: false, duration: 80,  moveFrames: [20, 23], idleFrames: [0,  3]  },
    dash:    { status: false, axis: "x", sign:  0, repeat: true,  duration: 60,  moveFrames: [24, 26], idleFrames: [0,  3]  },
};

let frog = null; // Global reference so playScene and levelGenerator can see it

class Frog extends AnimatedPlayer {
    constructor(position, width, height, sheetCols) {
        super(position, width, height, "#7ed967", sheetCols, frogMotion);

        this.width = width;
        this.height = height;

        // --- SPRITESHEET ---
        // Sheet: 4 cols x 7 rows, each frame 170x180px
        // Row 0: IDLE  | Row 1: WALK  | Row 2: JUMP
        // Row 3: TONGUE ATTACK (right) | Row 4: JUMP 2
        // Row 5: TONGUE ATTACK (left)  | Row 6: DASH
        this.setSprite(
            "../Anura/assets/frog/frogSpriteSheet.png",
            new Rect(0, 0, 170, 180)
        );
        // Start in idle
        this.setAnimation(0, 3, true, 120);

        // Tracks which animation is currently active so we only call
        // setAnimation when the state actually changes (avoids frame resets)
        this.currentAnim = "idle";

        // Facing direction: 1 = right, -1 = left
        this.facing = 1;

        // --- MOVEMENT PROPERTIES ---
        this.speed = 10;
        this.velocityY = 0;
        this.isOnGround = true;
        this.gravity = 0.8;
        this.jumpForce = -10;

        // --- EXTRA JUMPS ---
        this.extraJumps = 0; // set by card: Iron Hindlegs = 1, Dragonfly Hop = 2
        this.jumpsRemaining = 0;
        this.extraJumpCooldown = 150; // 3 sec between extra jumps
        this.extraJumpCooldownTimer = 0;

        // --- GLIDE ---
        this.canGlide = false;
        this.isGliding = false;
        this.glideGravity = 0.01;

        // --- DASH ---
        this.canDash = false; // used in Bubble Dash card
        this.dashSpeed = 15;
        this.dashDuration = 300;
        this.dashTimer = 0;
        this.dashCooldown = 3000;
        this.dashCooldownTimer = 0;
        this.isDashing = false;
        this.dashDirection = 1;

        // --- ATTACK (TONGUE) ---

        this.isAttacking = false;
        this.attackTimer = 0;
        this.attackDuration = 100;
        this.attackCooldown = 0;
        this.cooldownDuration = 300;
        this.tongueRange = 80;
        this.tongueWidth = 15;
        this.lastDirection = { x: 1, y: 0 };

        // --- DAMAGE & INVINCIBILITY ---
        this.invincibilityTimer = 0;
        this.invincibilityDuration = 1500;

        // --- COMBAT & CARD MODIFIERS ---
        this.tongueDamage = 1;
        this.tongueElement = "normal"; // Can be "fire", "poison", "ice"
        this.activeStatusEffects = []; // Store temporary card buffs here

        // Fire Kiss
        this.fireKiss = false;

        // Venom Lash 
        this.poisonDuration  = 0;   // ms poison lasts per hit
        this.poisonDamage    = 1;   // damage per poison tick
 
        // Thunder Tongue
        this.thunderChance   = 0;
 
        // Chameleon Veil
        this.canChameleon    = false;
        this.chameleonTimer  = 0;
        this.chameleonDuration = 1200; // ms of invisibility after each attack
 
        // Toad Shockwave 
        this.canShockwave    = false;
        this.shockwaveRadius = 120;  // px radius of the shockwave push
        this.shockwaveForce  = 5;    // pixels pushed per frame unit

        // Required for boxOverlap compatibility
        this.halfSize = { x: width / 2, y: height / 2 };
    }

    
    update(deltaTime, keys, platforms, canvasHeight, cameraX, worldBoundsLeft = 0, worldBoundsRight = Infinity) {
        // Update animation frames from parent class
        this.updateFrame(deltaTime);

        // --- TIMERS ---
        if (this.extraJumpCooldownTimer > 0) this.extraJumpCooldownTimer -= deltaTime;
        if (this.dashTimer > 0) {
            this.dashTimer -= deltaTime;
            if (this.dashTimer <= 0) {
                this.isDashing = false;
            }
        }
        if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= deltaTime;
        if (this.invincibilityTimer > 0) this.invincibilityTimer -= deltaTime;

        if (this.chameleonTimer > 0) {
            this.chameleonTimer -= deltaTime;
        }

        // Attack cooldown management for the tongue attack
        if (this.attackTimer > 0) {
            this.attackTimer -= deltaTime;
            if (this.attackTimer <= 0) this.isAttacking = false;
        }
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;

        // --- HORIZONTAL MOVEMENT & INPUT ---
        let moveX = 0;
        

        if (keys["a"]) { moveX = -1; this.lastDirection = { x: -1, y: 0 }; this.dashDirection = -1; this.facing = -1; }
        if (keys["d"]) { moveX =  1; this.lastDirection = { x:  1, y: 0 }; this.dashDirection =  1; this.facing =  1; }
        if (keys["w"]) { this.lastDirection = { x: 0, y: -1 }; }

        // Apply movement velocity
        if (this.isDashing) {
            this.position.x += this.dashSpeed * this.dashDirection * (deltaTime / 16);
        } else {
            let currentSpeed = this.speed;
            this.position.x += moveX * currentSpeed * (deltaTime / 16);
        }

        // --- VERTICAL MOVEMENT (GRAVITY) ---

        // sets gliding to true if ALL four conditions are true at the same time
        this.isGliding = this.canGlide && !this.isOnGround && this.velocityY > 0 && (keys["s"] || keys["S"]); // player burns card, frog on air, frog falling down, keys are active

        let activeGravity; // gravity value

        if (this.isGliding) { // if frog is gliding
            activeGravity = this.glideGravity; // 0.1 slow fall
        } else {
            activeGravity = this.gravity; // normal fall
        }

        // gravity applied, every frame we add a bit more pull down to the vertical speed,
        this.velocityY += activeGravity * (deltaTime / 16);
        if (this.velocityY > 20) this.velocityY = 20; // Terminal velocity limit, without it the frog would fall faster forever with no limit, so if VelocityY tries to exceed it, it goes back to 20
        this.position.y += this.velocityY * (deltaTime / 16); // move frog, if velocityY is + = frog moves down, else if negative, it would move up

        // --- FULL SOLID PLATFORM COLLISION ---
        this.isOnGround = false;

        for (let plat of platforms) {
            // First, check if they are overlapping at all
            if (boxOverlap(this, plat)) {

                // Calculate distance between the center of the frog and the center of the platform
                let dx = this.position.x - plat.position.x;
                let dy = this.position.y - plat.position.y;

                // Calculate the overlap (penetration depth) on both axes
                let overlapX = (this.halfSize.x + plat.halfSize.x) - Math.abs(dx);
                let overlapY = (this.halfSize.y + plat.halfSize.y) - Math.abs(dy);

                // Resolve collision on the axis with the SMALLEST overlap
                // This prevents teleporting to the top when hitting the side of a wall
                if (overlapX < overlapY) {
                    // --- HORIZONTAL COLLISION (Sides) ---
                    if (dx > 0) {
                        // Frog is to the right of the platform, push right
                        this.position.x += overlapX;
                    } else {
                        // Frog is to the left of the platform, push left
                        this.position.x -= overlapX;
                    }
                } else {
                    // --- VERTICAL COLLISION (Top and Bottom) ---
                    if (dy > 0) {
                        // Frog is BELOW the platform (hit its head on the ceiling)
                        this.position.y += overlapY;
                        this.velocityY = 0; // Stop jump momentum so it falls immediately
                    } else {
                        // Frog is ABOVE the platform (landed safely on top)
                        this.position.y -= overlapY;
                        this.velocityY = 0;
                        this.isOnGround = true;

                        // reset extra jumps on landing
                        this.jumpsRemaining = this.extraJumps;
                    }
                }
            }
        }

        // Floor limits (Canvas Bottom)
        const groundLimitY = canvasHeight - this.height / 2;
        if (this.position.y >= groundLimitY) {
            this.position.y = groundLimitY;
            this.velocityY = 0;
            this.isOnGround = true;
            // reset extra jumps on landing
            this.jumpsRemaining = this.extraJumps;
        }

        // World bounds — fixed pixel walls passed by each scene.
        // Never use cameraX here: it moves with lerp and would push the frog every frame.
        if (this.position.x - this.halfSize.x < worldBoundsLeft)  this.position.x = worldBoundsLeft  + this.halfSize.x;
        if (this.position.x + this.halfSize.x > worldBoundsRight) this.position.x = worldBoundsRight - this.halfSize.x;

        // --- ANIMATION STATE SELECTION ---
        // Pick the correct animation based on current action.
        // selectAnimation only calls startMovement when the state actually changes (avoids frame resets)
        this.selectAnimation(keys);
    }

    // Chooses the right animation based on priority:
    // DASH > ATTACK > JUMP > FALL > WALK > IDLE
    // Uses AnimatedPlayer's startMovement/stopMovement instead of calling setAnimation directly
    selectAnimation(keys) {
        let newAnim;

        if (this.isDashing) {
            newAnim = "dash";
        } else if (this.isAttacking) {
            newAnim = this.facing == 1 ? "attack" : "attackL"; // TONGUE ATTACK right / left
        } else if (!this.isOnGround && this.velocityY < 0) {
            newAnim = "jump"; // JUMP up
        } else if (!this.isOnGround && this.velocityY > 0) {
            newAnim = "fall"; // falling down
        } else if (keys["a"] || keys["d"]) {
            newAnim = keys["a"] ? "left" : "right"; // WALK
        } else {
            newAnim = "idle"; // IDLE
        }

        if (newAnim !== this.currentAnim) {
            if (this.currentAnim && this.currentAnim !== "idle") {
                this.stopMovement(this.currentAnim);
            }
            // Start the new animation using AnimatedPlayer's system
            this.startMovement(newAnim);
            this.currentAnim = newAnim;
        }
    }

    draw(ctx) {
        // Handle blink effect during invincibility
        if (this.invincibilityTimer > 0) {
            ctx.globalAlpha = Math.floor(this.invincibilityTimer / 150) % 2 === 0 ? 0.3 : 1.0;
        }

        ctx.save();

        // Flip horizontally when facing left
        if (this.facing === -1) {
            ctx.translate(this.position.x, this.position.y);
            ctx.scale(-1, 1);
            ctx.translate(-this.position.x, -this.position.y);
        }

        if (this.spriteImage && this.spriteImage.complete && this.spriteRect) {
            // Draw sprite centered on position
            ctx.drawImage(
                this.spriteImage,
                this.spriteRect.x,      // source X in sheet
                this.spriteRect.y,      // source Y in sheet
                this.spriteRect.width,  // source frame width  (184)
                this.spriteRect.height, // source frame height (186)
                this.position.x - this.width / 2,  // dest X
                this.position.y - this.height / 2, // dest Y
                this.width,   // dest width  (scaled to frog's collision size)
                this.height   // dest height
            );
        } else {
            // Fallback rectangle while sprite loads
            ctx.fillStyle = this.color;
            ctx.fillRect(this.position.x - this.width / 2, this.position.y - this.height / 2, this.width, this.height);
        }

        ctx.restore();

        // Tongue is drawn on top without the flip transform so it always
        // goes in the logical attack direction regardless of facing
        if (this.isAttacking) {
            this.drawAttack(ctx);
        }

        // Reset alpha for other elements
        ctx.globalAlpha = 1.0;

        if (showBBox) this.drawBoundingBox(ctx);

    }

    drawAttack(ctx) {
        // Tongue color changes based on active combat card
        if (this.fireKiss) {
            ctx.fillStyle = "#ff4400"; // orange-red for fire
        } else if (this.poisonDuration > 0) {
            ctx.fillStyle = "#ee00ff"; // magenta for poison
        } else if (this.thunderChance > 0) {
            ctx.fillStyle = "#ffff00"; // yellow for thunder
        } else {
            ctx.fillStyle = "#ff7eb6"; // default tongue pink
        }

        let tonguePosX = this.position.x + (this.lastDirection.x * this.tongueRange / 2);
        let tonguePosY = this.position.y + (this.lastDirection.y * this.tongueRange / 2);

        let tongueRect = {
            position: { x: tonguePosX, y: tonguePosY },
            halfSize: {
                x: this.lastDirection.x !== 0 ? this.tongueRange / 2 : this.tongueWidth / 2,
                y: this.lastDirection.y !== 0 ? this.tongueRange / 2 : this.tongueWidth / 2
            }
        };

        ctx.fillRect(
            tongueRect.position.x - tongueRect.halfSize.x,
            tongueRect.position.y - tongueRect.halfSize.y,
            tongueRect.halfSize.x * 2,
            tongueRect.halfSize.y * 2
        );
    }

    // Returns a label for the active combat card — shown in the HUD
    getActiveCombatCardLabel() {
        if (this.fireKiss)          return "Fire Kiss";
        if (this.poisonDuration > 0) return "Venom Lash";
        if (this.thunderChance > 0)  return "Thunder Tongue";
        if (this.canChameleon)       return "Chameleon Veil";
        if (this.canShockwave)       return "Toad Shockwave";
        return null;
    }

    /**
     * Returns the bounding box of the tongue for collision detection in playScene.js
     * Returns null if not attacking.
     */
    getTongueCollider() {
        if (!this.isAttacking) return null;

        let tonguePosX = this.position.x + (this.lastDirection.x * this.tongueRange / 2);
        let tonguePosY = this.position.y + (this.lastDirection.y * this.tongueRange / 2);

        return {
            position: { x: tonguePosX, y: tonguePosY },
            halfSize: {
                x: this.lastDirection.x !== 0 ? this.tongueRange / 2 : this.tongueWidth / 2,
                y: this.lastDirection.y !== 0 ? this.tongueRange / 2 : this.tongueWidth / 2
            }
        };
    }

    
}