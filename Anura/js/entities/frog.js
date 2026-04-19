/*
 * Player frog class inheriting from AnimatedObject.
 * Handles movement mechanics (walking, jumping, dashing, crouching),
 * attack (tongue), invincibility, and collision properties.
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */
"use strict";

let frog = null; // Global reference so playScene and levelGenerator can see it

class Frog extends AnimatedObject {
    constructor(position, width, height, sheetCols) {
        // Initialize parent class with default color and "player" type
        super(position, width, height, "#7ed967", "player", sheetCols);


        this.width = width;
        this.height = height;

        // --- MOVEMENT PROPERTIES ---
        this.speed = 10;
        this.velocityY = 0;
        this.isOnGround = true;
        this.gravity = 0.8;
        this.jumpForce = -15;

        // --- DOUBLE JUMP ---
        this.canDoubleJump = false;
        this.hasDoubleJump = false;
        this.doubleJumpCooldown = 3000;
        this.doubleJumpCooldownTimer = 0;

        // --- DASH ---
        this.dashSpeed = 15;
        this.dashDuration = 150;
        this.dashTimer = 0;
        this.dashCooldown = 3000;
        this.dashCooldownTimer = 0;
        this.isDashing = false;
        this.dashDirection = 1;

        // --- CROUCH & ATTACK ---
        this.isCrouching = false;
        this.crouchSpeed = 0.4;
        
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
        
        // Required for boxOverlap compatibility
        this.halfSize = { x: width / 2, y: height / 2 };
    }

    update(deltaTime, keys, platforms, canvasHeight, cameraX) {
        // Update animation frames from parent class
        this.updateFrame(deltaTime);

        // --- TIMERS ---
        if (this.doubleJumpCooldownTimer > 0) this.doubleJumpCooldownTimer -= deltaTime;
        if (this.dashTimer > 0) {
            this.dashTimer -= deltaTime;
            if (this.dashTimer <= 0) { 
                this.color = "#7ed967"; 
                this.isDashing = false; 
            }
        }
        if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= deltaTime;
        if (this.invincibilityTimer > 0) this.invincibilityTimer -= deltaTime;

        //Attack cooldown management for the tongue attack
        if (this.attackTimer > 0) {
            this.attackTimer -= deltaTime;
            if (this.attackTimer <= 0) this.isAttacking = false;
        }
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;

        // --- HORIZONTAL MOVEMENT & INPUT ---
        let moveX = 0;
        this.isCrouching = (keys["s"] || keys["S"]) && this.isOnGround;

        if (keys["a"]) { moveX = -1; this.lastDirection = { x: -1, y: 0 }; this.dashDirection = -1; }
        if (keys["d"]) { moveX = 1;  this.lastDirection = { x: 1,  y: 0 }; this.dashDirection = 1; }
        if (keys["w"]) { this.lastDirection = { x: 0, y: -1 }; }

        // Apply movement velocity
        if (this.isDashing) {
            this.position.x += this.dashSpeed * this.dashDirection * (deltaTime / 16);
        } else {
            let currentSpeed = this.isCrouching ? this.speed * this.crouchSpeed : this.speed;
            this.position.x += moveX * currentSpeed * (deltaTime / 16);
        }

        // --- VERTICAL MOVEMENT (GRAVITY) ---
        this.velocityY += this.gravity * (deltaTime / 16);
        if (this.velocityY > 20) this.velocityY = 20; // Terminal velocity limit
        this.position.y += this.velocityY * (deltaTime / 16);

        // --- SIMPLE PLATFORM COLLISION ---
        // --- FULL SOLID PLATFORM COLLISION  ---
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
                        
                        // Reset double jump mechanics
                        if (this.canDoubleJump) this.hasDoubleJump = true;
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
            if (this.canDoubleJump) this.hasDoubleJump = true;
        }

        // Camera limit (Prevent moving backwards off-screen)
        if (this.position.x - this.width/2 < cameraX) {
            this.position.x = cameraX + this.width/2;
        }
    }

    draw(ctx) {
        // Handle blink effect during invincibility
        if (this.invincibilityTimer > 0) {
            ctx.globalAlpha = Math.floor(this.invincibilityTimer / 150) % 2 === 0 ? 0.3 : 1.0;
        }

        ctx.fillStyle = this.color;
        
        // Visual feedback for crouching or normal rendering
        if (this.isCrouching) {
            const crouchHeight = this.height / 2;
            const crouchWidth = this.width * 1.2;
            ctx.fillRect(this.position.x - crouchWidth / 2, this.position.y + (this.height / 2 - crouchHeight), crouchWidth, crouchHeight);
        } else {
            // Drawn from the center point
            ctx.fillRect(this.position.x - this.width / 2, this.position.y - this.height / 2, this.width, this.height);
        }

        // Draw the tongue attack if active
        if (this.isAttacking) {
            this.drawAttack(ctx);
        }

        // Reset alpha for other elements
        ctx.globalAlpha = 1.0;
    }

    drawAttack(ctx) {
        ctx.fillStyle = "#ff7eb6"; // Tongue pink
        
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


    /**
     * Applies a modifier from a drawn card (loaded from Database)
     */
    /*applyCardEffect(cardData) {
        
        if (cardData.modifies === "tongue_element") {
            this.tongueElement = cardData.value; // e.g., "fire"
            this.tongueDamage += cardData.damageBoost || 0;
        }
        
        if (cardData.modifies === "speed") {
            this.speed += cardData.value;
        }
        
    }*/
}