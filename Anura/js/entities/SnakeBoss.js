/*
 * SnakeBoss — First boss of Anura.
 * Extends Enemy to reuse health, stun, takeDamage, and draw logic.
 *
 * STATE MACHINE: IDLE → CHASE → DASH → RETREAT → ENRAGED
 * Gravity keeps the boss grounded (Enemy uses atan2 which causes floating).
 */
"use strict";

// Defined outside the class so it's available immediately when the file loads
const BOSS_STATE = {
    IDLE:    "idle",   
    CHASE:   "chase",   
    DASH:    "dash",   
    RETREAT: "retreat", 
    ENRAGED: "enraged", //paint snake red
    STUNNED: "stunned", 
    PATROL: "patrol"
};

const bossMotion = {
    idle: {
        status: false,
        axis: "x",
        sign: 1,
        repeat: true,
        duration: 100,
        moveFrames: [4, 7],
        moveFrames2: [8, 11],
    },
    chase: {
        status: false,
        axis: "x",
        sign: 1,
        repeat: true,
        duration: 100,
        moveFrames: [12, 13],
        moveFrames2: [14, 15],
    },
    dash: {
        status: false,
        axis: "x",
        sign: 1,
        repeat: true,
        duration: 100,
        moveFrames: [16,17],
        moveFrames2: [18, 19],
    },
    retreat: {
        status: false,
        axis: "x",
        sign: 1,
        repeat: true,
        duration: 100,
        moveFrames: [4, 7],
        moveFrames2: [8, 11],
    },
    enraged: {
        status: false,
        axis: "x",
        sign: 1,
        repeat: true,
        duration: 100,
        moveFrames: [20,21],
        moveFrames2: [22, 23],
    },
    stunned: {
        status: false,
        axis: "x",
        sign: 1,
        repeat: true,
        duration: 100,
        moveFrames: [24,27],
        moveFrames2: [0, 3],
    },
    patrol: {
        status: false,
        axis: "x",
        sign: 1,
        repeat: true,
        duration: 100,
        moveFrames: [4, 7],
        moveFrames2: [8, 11],
    },
};

class SnakeBoss extends Enemy {
    constructor(x, y, width, height, color, mob_name, sheetCols, range, hp, dmg, motion,statesObj, speed) {
        super(x, y, width, height, color, mob_name, sheetCols, range, hp, dmg, motion,statesObj);


        this.state = this.statesObj.IDLE;
        this.isEnraged = false;

        // --- GRAVITY ---
        this.velocityY  = 0;
        this.gravity    = 0.6;
        this.isOnGround = false;

        // --- DETECTION ---
        this.aggroRadius = 380;

        // --- IDLE ---
        this.idleTimer = 800;

        // --- CHASE ---
        this.chaseSpeed = speed; 

        // --- DASH ---
        this.dashSpeed        = 10;
        this.dashDuration     = 280;
        this.dashCooldown     = 2200;
        this.dashTimer        = 0;
        this.lastDashTime     = 0;
        this.dashDirectionX   = 0;
        this.hitDealtThisDash = false;

        // --- RETREAT ---
        this.retreatSpeed      = this.chaseSpeed * 0.7;
        this.retreatDuration   = 600;
        this.retreatTimer      = 0;
        this.retreatDirectionX = 0;

        // --- ENRAGED ---
        this.enragedSpeed     = this.chaseSpeed * 1.5;
        this.enragedDashSpeed = 14;
        this.enragedCooldown  = 1100;

    }

    update(target, deltaTime) {

        // --- STUN ---
        if (this.state === this.statesObj.STUNNED) {
            this.stunTimer -= deltaTime;
            if (this.stunTimer <= 0) {
                // this.state     = ENEMY_STATE.PATROL;
                if(this.state != this.statesObj.IDLE){
                    this.state = this.statesObj.IDLE;
                    this.dirData = this.motion[this.state];
                    if(this.direction == 1){
                        this.setAnimation(this.dirData.moveFrames[0],this.dirData.moveFrames[1], this.dirData.repeat, this.dirData.duration);
                    }
                    else{
                        this.setAnimation(this.dirData.moveFrames2[0],this.dirData.moveFrames2[1], this.dirData.repeat, this.dirData.duration);
                    }
                    this.idleTimer = 600;
                }
                
            }
            this.applyGravity(deltaTime);
            this.updateFrame(deltaTime);
            this.updateCollider();
            return;
        }

        // --- PHASE TRANSITION ---
        if (!this.isEnraged && this.health <= this.maxHealth * 0.25) {
            this.isEnraged       = true;
            if(this.state != this.statesObj.ENRAGED){
                this.state  = this.statesObj.ENRAGED;
                this.dirData = this.motion[this.state];
                if(this.direction == 1){
                    this.setAnimation(this.dirData.moveFrames[0],this.dirData.moveFrames[1], this.dirData.repeat, this.dirData.duration);
                }
                else{
                    this.setAnimation(this.dirData.moveFrames2[0],this.dirData.moveFrames2[1], this.dirData.repeat, this.dirData.duration);
                }
            }
            this.chaseSpeed      = this.enragedSpeed;
            this.dashSpeed       = this.enragedDashSpeed;
            this.dashCooldown    = this.enragedCooldown;
            this.retreatDuration = 200;
            console.log("Phase 2: The snake is enraged!");
        }

        const dx       = target.position.x - this.position.x;
        const distance = Math.abs(dx);
        const now      = Date.now();

        // Using if-else instead of switch to avoid JS scope issues with methods
        if (this.state === this.statesObj.IDLE) {
            this.idleTimer -= deltaTime;
            if (distance < this.aggroRadius || this.idleTimer <= 0) {
                if(this.state != this.statesObj.CHASE){
                    this.state = this.statesObj.CHASE;
                    this.dirData = this.motion[this.state];
                    if(this.direction == 1){
                        this.setAnimation(this.dirData.moveFrames[0],this.dirData.moveFrames[1], this.dirData.repeat, this.dirData.duration);
                    }
                    else{
                        this.setAnimation(this.dirData.moveFrames2[0],this.dirData.moveFrames2[1], this.dirData.repeat, this.dirData.duration);
                    }
                    
                }
                    
            }

        } else if (this.state === this.statesObj.CHASE || this.state === this.statesObj.ENRAGED) {
            this.position.x += Math.sign(dx) * this.chaseSpeed * (deltaTime / 16);

            // Contact damage while chasing
            this.checkContactDamage(target);

            // Trigger dash if close enough and cooldown is ready
            if (distance < 300 && (now - this.lastDashTime) > this.dashCooldown) {
                this.startDash(dx);
            }

            // Go idle if frog walks away (non-enraged only)
            if (!this.isEnraged && distance > this.aggroRadius) {
                if(this.state != this.statesObj.IDLE){
                    this.state = this.statesObj.IDLE;
                    this.dirData = this.motion[this.state];
                    if(this.direction == 1){
                        this.setAnimation(this.dirData.moveFrames[0],this.dirData.moveFrames[1], this.dirData.repeat, this.dirData.duration);
                    }
                    else{
                        this.setAnimation(this.dirData.moveFrames2[0],this.dirData.moveFrames2[1], this.dirData.repeat, this.dirData.duration);
                    }
                    this.idleTimer = 1000;
                }
                    
            }

        } else if (this.state === this.statesObj.DASH) {
            this.dashTimer -= deltaTime;
            this.position.x += this.dashDirectionX * this.dashSpeed * (deltaTime / 16);

            // Deal damage once per dash on contact
            if (!this.hitDealtThisDash && boxOverlap(this, target)) {
                this.dealDamageToFrog(target);
                this.hitDealtThisDash = true;
            }

            if (this.dashTimer <= 0) {
                this.startRetreat(dx);
            }

        } else if (this.state === this.statesObj.RETREAT) {
            this.retreatTimer -= deltaTime;
            this.position.x += this.retreatDirectionX * this.retreatSpeed * (deltaTime / 16);

            if (this.retreatTimer <= 0) {
                if (this.isEnraged) {
                    if(this.state != this.statesObj.ENRAGED){
                        this.state = this.statesObj.ENRAGED;
                        this.dirData = this.motion[this.state];
                        if(this.direction == 1){
                            this.setAnimation(this.dirData.moveFrames[0],this.dirData.moveFrames[1], this.dirData.repeat, this.dirData.duration);
                        }
                        else{
                            this.setAnimation(this.dirData.moveFrames2[0],this.dirData.moveFrames2[1], this.dirData.repeat, this.dirData.duration);
                        }
                    } 
                } 
                else {
                    if(this.state != this.statesObj.CHASE){
                        this.state = this.statesObj.CHASE;
                        this.dirData = this.motion[this.state];
                        if(this.direction == 1){
                            this.setAnimation(this.dirData.moveFrames[0],this.dirData.moveFrames[1], this.dirData.repeat, this.dirData.duration);
                        }
                        else{
                            this.setAnimation(this.dirData.moveFrames2[0],this.dirData.moveFrames2[1], this.dirData.repeat, this.dirData.duration);
                        }
                    }     
                }
            }
        }

        // Gravity runs every frame regardless of state
        this.applyGravity(deltaTime);
        this.updateFrame(deltaTime);
        this.updateCollider();
    }

    startDash(dx) {
        if(this.state != this.statesObj.DASH){
            this.state = this.statesObj.DASH;
            this.dirData = this.motion[this.state];
            if(this.direction == 1){
                this.setAnimation(this.dirData.moveFrames[0],this.dirData.moveFrames[1], this.dirData.repeat, this.dirData.duration);
            }
            else{
                this.setAnimation(this.dirData.moveFrames2[0],this.dirData.moveFrames2[1], this.dirData.repeat, this.dirData.duration);
            }
            this.dashTimer        = this.dashDuration;
            this.lastDashTime     = Date.now();
            this.dashDirectionX   = dx > 0 ? 1 : -1;
            this.hitDealtThisDash = false;
        }
    }

    startRetreat(dx) {
        if(this.state != this.statesObj.RETREAT){
            this.state         = this.statesObj.RETREAT;
            this.dirData = this.motion[this.state];
            if(this.direction == 1){
                this.setAnimation(this.dirData.moveFrames[0],this.dirData.moveFrames[1], this.dirData.repeat, this.dirData.duration);
            }
            else{
                this.setAnimation(this.dirData.moveFrames2[0],this.dirData.moveFrames2[1], this.dirData.repeat, this.dirData.duration);
            }
            this.retreatTimer      = this.retreatDuration;
            this.retreatDirectionX = dx > 0 ? -1 : 1;
        }
            
    }

    applyGravity(deltaTime) {
        this.velocityY += this.gravity * (deltaTime / 16);
        if (this.velocityY > 20) this.velocityY = 20;
        this.position.y += this.velocityY * (deltaTime / 16);

        this.isOnGround = false;

        for (const plat of platforms) {
            if (!boxOverlap(this, plat)) continue;

            const dy       = this.position.y - plat.position.y;
            const overlapY = (this.halfSize.y + plat.halfSize.y) - Math.abs(dy);
            const ddx      = this.position.x - plat.position.x;
            const overlapX = (this.halfSize.x + plat.halfSize.x) - Math.abs(ddx);

            if (overlapY < overlapX) {
                if (dy > 0) {
                    this.position.y += overlapY;
                    this.velocityY   = 0;
                } else {
                    this.position.y -= overlapY;
                    this.velocityY   = 0;
                    this.isOnGround  = true;
                }
            }
        }

        // Canvas floor fallback
        const floorY = canvasHeight - this.halfSize.y;
        if (this.position.y >= floorY) {
            this.position.y = floorY;
            this.velocityY  = 0;
            this.isOnGround = true;
        }

        // Arena wall clamp — prevents boss from dashing or walking out of bounds
        // arenaLeft and arenaRight are defined in bossScene1.js
        if (typeof arenaLeft !== "undefined" && typeof arenaRight !== "undefined") {
            if (this.position.x - this.halfSize.x < arenaLeft) {
                this.position.x = arenaLeft + this.halfSize.x;
                if (this.state === this.statesObj.DASH) this.startRetreat(1);
            }
            if (this.position.x + this.halfSize.x > arenaRight) {
                this.position.x = arenaRight - this.halfSize.x;
                if (this.state === this.statesObj.DASH) this.startRetreat(-1);
            }
        }
    }

    checkContactDamage(frog) {
        if (boxOverlap(this, frog)) {
            this.dealDamageToFrog(frog);
        }
    }

    dealDamageToFrog(frog) {
        if (frog.invincibilityTimer > 0) return;
        currentHealth -= this.damage;
        frog.invincibilityTimer = frog.invincibilityDuration;
        console.log(`Snake hit frog for ${this.damage}. Frog HP: ${currentHealth}`);
        if (currentHealth <= 0) gameOver();
    }

    takeDamage(amount) {
        super.takeDamage(amount);
    }

    draw(ctx) {
        super.draw(ctx);

        const barW    = 120;
        const barH    = 10;
        const barX    = this.position.x - barW / 2;
        const barY    = this.position.y - this.halfSize.y - 22;
        const hpRatio = Math.max(0, this.health / this.maxHealth);

        ctx.save();
        ctx.fillStyle = "#333";
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = this.isEnraged ? "#ff4400" : "#cc0000";
        ctx.fillRect(barX, barY, barW * hpRatio, barH);
        ctx.strokeStyle = "#000";
        ctx.lineWidth   = 1;
        ctx.strokeRect(barX, barY, barW, barH);

    }

    die() {
        super.die();
        console.log("The Great Snake has been defeated!");
    }
}