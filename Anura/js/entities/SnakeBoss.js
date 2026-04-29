/*
 * SnakeBoss — First boss of Anura.
 * Extends Enemy to reuse health, stun, takeDamage, and draw logic.
 *
 * STATE MACHINE: IDLE → CHASE → DASH → RETREAT → ENRAGED
 * Gravity keeps the boss grounded (Enemy uses atan2 which causes floating).
 */
"use strict";

// All possible boss states — passed as statesObj so Enemy base class can reference them
const BOSS_STATE = {
    IDLE:    "idle",   
    CHASE:   "chase",   
    DASH:    "dash",   
    RETREAT: "retreat", 
    ENRAGED: "enraged", // phase 2 — snake turns red and gets faster
    STUNNED: "stunned", 
    PATROL:  "patrol"
};

// Animation frame ranges for each state.
// moveFrames = facing right, moveFrames2 = facing left.
// These map directly to the spritesheet columns used by setAnimation().
const bossMotion = {
    idle: {
        status: false, axis: "x", sign: 1, repeat: true, duration: 100,
        moveFrames: [4, 7], moveFrames2: [8, 11],
    },
    chase: {
        status: false, axis: "x", sign: 1, repeat: true, duration: 100,
        moveFrames: [12, 13], moveFrames2: [14, 15],
    },
    dash: {
        status: false, axis: "x", sign: 1, repeat: true, duration: 100,
        moveFrames: [16, 17], moveFrames2: [18, 19],
    },
    retreat: {
        // Retreat reuses the idle animation — snake slows down visually
        status: false, axis: "x", sign: 1, repeat: true, duration: 100,
        moveFrames: [4, 7], moveFrames2: [8, 11],
    },
    enraged: {
        status: false, axis: "x", sign: 1, repeat: true, duration: 100,
        moveFrames: [20, 21], moveFrames2: [22, 23],
    },
    stunned: {
        status: false, axis: "x", sign: 1, repeat: true, duration: 100,
        moveFrames: [24, 27], moveFrames2: [0, 3],
    },
    patrol: {
        // Patrol reuses idle frames
        status: false, axis: "x", sign: 1, repeat: true, duration: 100,
        moveFrames: [4, 7], moveFrames2: [8, 11],
    },
};

class SnakeBoss extends Enemy {
    constructor(x, y, width, height, color, mob_name, sheetCols, range, hp, dmg, motion, statesObj, speed) {
        super(x, y, width, height, color, mob_name, sheetCols, range, hp, dmg, motion, statesObj);

        // Boss starts in IDLE — waits for the frog to enter aggro range
        this.state     = this.statesObj.IDLE;
        this.isEnraged = false;

        // --- GRAVITY ---
        // Enemy base class uses atan2 movement (floats in X and Y).
        // We override update() and apply our own gravity so the boss stays on the ground.
        this.velocityY  = 0;
        this.gravity    = 0.6;
        this.isOnGround = false;

        // --- DETECTION ---
        // Frog must enter this radius (px) to trigger CHASE
        this.aggroRadius = 380;

        // --- IDLE ---
        // How long the boss waits before deciding to chase (ms)
        this.idleTimer = 800;

        // --- CHASE ---
        // Horizontal speed while chasing the frog
        this.chaseSpeed = speed;

        // --- DASH ---
        this.dashSpeed        = 10;   // px per frame unit during a lunge
        this.dashDuration     = 280;  // ms the dash lasts
        this.dashCooldown     = 2200; // ms between dashes
        this.dashTimer        = 0;
        this.lastDashTime     = 0;
        this.dashDirectionX   = 0;    // -1 or 1, locked when dash starts
        this.hitDealtThisDash = false; // prevents hitting the frog more than once per dash

        // --- RETREAT ---
        // After a dash the boss briefly retreats in the opposite direction
        this.retreatSpeed      = this.chaseSpeed * 0.7;
        this.retreatDuration   = 600; // ms
        this.retreatTimer      = 0;
        this.retreatDirectionX = 0;

        // --- ENRAGED (phase 2, triggered at 25% HP) ---
        this.enragedSpeed     = this.chaseSpeed * 1.5;
        this.enragedDashSpeed = 14;
        this.enragedCooldown  = 1100; // shorter dash cooldown in phase 2
    }

    update(target, deltaTime) {

        // --- STUN ---
        // When stunned the boss can't move — just counts down the timer.
        // Gravity still applies so it doesn't float if hit while airborne.
        if (this.state === this.statesObj.STUNNED) {
            this.stunTimer -= deltaTime;
            if (this.stunTimer <= 0) {
                // Return to IDLE after stun ends
                if (this.state != this.statesObj.IDLE) {
                    this.state   = this.statesObj.IDLE;
                    this.dirData = this.motion[this.state];
                    if (this.direction == 1) {
                        this.setAnimation(this.dirData.moveFrames[0], this.dirData.moveFrames[1], this.dirData.repeat, this.dirData.duration);
                    } else {
                        this.setAnimation(this.dirData.moveFrames2[0], this.dirData.moveFrames2[1], this.dirData.repeat, this.dirData.duration);
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
        // Triggers once when HP drops to 25% — boss becomes faster and more aggressive
        if (!this.isEnraged && this.health <= this.maxHealth * 0.25) {
            this.isEnraged = true;
            if (this.state != this.statesObj.ENRAGED) {
                this.state   = this.statesObj.ENRAGED;
                this.dirData = this.motion[this.state];
                if (this.direction == 1) {
                    this.setAnimation(this.dirData.moveFrames[0], this.dirData.moveFrames[1], this.dirData.repeat, this.dirData.duration);
                } else {
                    this.setAnimation(this.dirData.moveFrames2[0], this.dirData.moveFrames2[1], this.dirData.repeat, this.dirData.duration);
                }
            }
            this.chaseSpeed      = this.enragedSpeed;
            this.dashSpeed       = this.enragedDashSpeed;
            this.dashCooldown    = this.enragedCooldown;
            this.retreatDuration = 200; // barely retreats in phase 2
            console.log("Phase 2: The snake is enraged!");
        }

        // Distance to frog on the X axis — used for state decisions and dash direction
        const dx       = target.position.x - this.position.x;
        const distance = Math.abs(dx);
        const now      = Date.now();

        // Using if-else instead of switch to avoid JS scope issues with methods
        if (this.state === this.statesObj.IDLE) {
            this.idleTimer -= deltaTime;
            // Start chasing if the frog enters aggro radius or idle timer expires
            if (distance < this.aggroRadius || this.idleTimer <= 0) {
                if (this.state != this.statesObj.CHASE) {
                    this.state   = this.statesObj.CHASE;
                    this.dirData = this.motion[this.state];
                    if (this.direction == 1) {
                        this.setAnimation(this.dirData.moveFrames[0], this.dirData.moveFrames[1], this.dirData.repeat, this.dirData.duration);
                    } else {
                        this.setAnimation(this.dirData.moveFrames2[0], this.dirData.moveFrames2[1], this.dirData.repeat, this.dirData.duration);
                    }
                }
            }

        } else if (this.state === this.statesObj.CHASE || this.state === this.statesObj.ENRAGED) {
            // Move toward the frog on the X axis only — no vertical chasing
            this.position.x += Math.sign(dx) * this.chaseSpeed * (deltaTime / 16);

            // Contact damage while chasing
            this.checkContactDamage(target);

            // Trigger a dash lunge if the frog is close enough and cooldown is ready
            if (distance < 300 && (now - this.lastDashTime) > this.dashCooldown) {
                this.startDash(dx);
            }

            // Return to IDLE if frog walks out of aggro range (non-enraged phase only)
            if (!this.isEnraged && distance > this.aggroRadius) {
                if (this.state != this.statesObj.IDLE) {
                    this.state   = this.statesObj.IDLE;
                    this.dirData = this.motion[this.state];
                    if (this.direction == 1) {
                        this.setAnimation(this.dirData.moveFrames[0], this.dirData.moveFrames[1], this.dirData.repeat, this.dirData.duration);
                    } else {
                        this.setAnimation(this.dirData.moveFrames2[0], this.dirData.moveFrames2[1], this.dirData.repeat, this.dirData.duration);
                    }
                    this.idleTimer = 1000;
                }
            }

        } else if (this.state === this.statesObj.DASH) {
            this.dashTimer -= deltaTime;
            // Move in the locked dash direction — fast, frame-rate independent
            this.position.x += this.dashDirectionX * this.dashSpeed * (deltaTime / 16);

            // Deal damage once per dash on contact
            if (!this.hitDealtThisDash && boxOverlap(this, target)) {
                this.dealDamageToFrog(target);
                this.hitDealtThisDash = true;
            }

            // Dash ends — start retreating
            if (this.dashTimer <= 0) {
                this.startRetreat(dx);
            }

        } else if (this.state === this.statesObj.RETREAT) {
            this.retreatTimer -= deltaTime;
            // Move in the opposite direction of the frog briefly
            this.position.x += this.retreatDirectionX * this.retreatSpeed * (deltaTime / 16);

            // Retreat ends — go back to CHASE or ENRAGED depending on phase
            if (this.retreatTimer <= 0) {
                if (this.isEnraged) {
                    if (this.state != this.statesObj.ENRAGED) {
                        this.state   = this.statesObj.ENRAGED;
                        this.dirData = this.motion[this.state];
                        if (this.direction == 1) {
                            this.setAnimation(this.dirData.moveFrames[0], this.dirData.moveFrames[1], this.dirData.repeat, this.dirData.duration);
                        } else {
                            this.setAnimation(this.dirData.moveFrames2[0], this.dirData.moveFrames2[1], this.dirData.repeat, this.dirData.duration);
                        }
                    }
                } else {
                    if (this.state != this.statesObj.CHASE) {
                        this.state   = this.statesObj.CHASE;
                        this.dirData = this.motion[this.state];
                        if (this.direction == 1) {
                            this.setAnimation(this.dirData.moveFrames[0], this.dirData.moveFrames[1], this.dirData.repeat, this.dirData.duration);
                        } else {
                            this.setAnimation(this.dirData.moveFrames2[0], this.dirData.moveFrames2[1], this.dirData.repeat, this.dirData.duration);
                        }
                    }
                }
            }
        }

        // Gravity and collider run every frame regardless of state
        this.applyGravity(deltaTime);
        this.updateFrame(deltaTime);
        this.updateCollider();
    }

    // Begins a dash lunge toward the target.
    // Direction is locked at the moment the dash starts so it can't change mid-dash.
    // The if-guard prevents re-triggering a dash that is already active.
    startDash(dx) {
        if (this.state != this.statesObj.DASH) {
            this.state   = this.statesObj.DASH;
            this.dirData = this.motion[this.state];
            if (this.direction == 1) {
                this.setAnimation(this.dirData.moveFrames[0], this.dirData.moveFrames[1], this.dirData.repeat, this.dirData.duration);
            } else {
                this.setAnimation(this.dirData.moveFrames2[0], this.dirData.moveFrames2[1], this.dirData.repeat, this.dirData.duration);
            }
            this.dashTimer        = this.dashDuration;
            this.lastDashTime     = Date.now();
            this.dashDirectionX   = dx > 0 ? 1 : -1; // lock direction toward frog
            this.hitDealtThisDash = false;             // reset so this dash can deal damage
        }
    }

    // Begins a retreat after a dash — moves away from the frog briefly.
    // The if-guard prevents re-triggering if retreat is already active.
    startRetreat(dx) {
        if (this.state != this.statesObj.RETREAT) {
            this.state   = this.statesObj.RETREAT;
            this.dirData = this.motion[this.state];
            if (this.direction == 1) {
                this.setAnimation(this.dirData.moveFrames[0], this.dirData.moveFrames[1], this.dirData.repeat, this.dirData.duration);
            } else {
                this.setAnimation(this.dirData.moveFrames2[0], this.dirData.moveFrames2[1], this.dirData.repeat, this.dirData.duration);
            }
            this.retreatTimer      = this.retreatDuration;
            this.retreatDirectionX = dx > 0 ? -1 : 1; // opposite direction of the frog
        }
    }

    // Applies gravity and resolves vertical platform collision every frame.
    // Also clamps the boss to the arena walls (arenaLeft/arenaRight from bossScene1.js).
    applyGravity(deltaTime) {
        // Accumulate downward velocity and apply terminal velocity cap
        this.velocityY += this.gravity * (deltaTime / 16);
        if (this.velocityY > 20) this.velocityY = 20;
        this.position.y += this.velocityY * (deltaTime / 16);

        this.isOnGround = false;

        // Vertical collision against platforms — same logic as the frog
        for (const plat of platforms) {
            if (!boxOverlap(this, plat)) continue;

            const dy       = this.position.y - plat.position.y;
            const overlapY = (this.halfSize.y + plat.halfSize.y) - Math.abs(dy);
            const ddx      = this.position.x - plat.position.x;
            const overlapX = (this.halfSize.x + plat.halfSize.x) - Math.abs(ddx);

            // Only resolve vertically when vertical overlap is smaller
            // prevents the boss from snapping to the top when hitting a wall side
            if (overlapY < overlapX) {
                if (dy > 0) {
                    // Boss hit the ceiling of a platform — push down
                    this.position.y += overlapY;
                    this.velocityY   = 0;
                } else {
                    // Boss landed on top of a platform
                    this.position.y -= overlapY;
                    this.velocityY   = 0;
                    this.isOnGround  = true;
                }
            }
        }

        // Canvas floor fallback — boss can never go below the bottom of the screen
        const floorY = canvasHeight - this.halfSize.y;
        if (this.position.y >= floorY) {
            this.position.y = floorY;
            this.velocityY  = 0;
            this.isOnGround = true;
        }

        // Arena wall clamp — prevents boss from dashing or walking out of bounds.
        // If the boss hits a wall mid-dash it starts retreating immediately.
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

    // Checks if the boss is touching the frog and deals damage if so
    checkContactDamage(frog) {
        if (boxOverlap(this, frog)) {
            this.dealDamageToFrog(frog);
        }
    }

    // Applies damage to the frog and grants it iframes so it can't be hit again immediately
    dealDamageToFrog(frog) {
        if (frog.invincibilityTimer > 0) return; // frog already has iframes, skip
        currentHealth -= this.damage;
        frog.invincibilityTimer = frog.invincibilityDuration;
        console.log(`Snake hit frog for ${this.damage}. Frog HP: ${currentHealth}`);
        if (currentHealth <= 0) gameOver();
    }

    // Delegates to parent — parent handles stun logic and hitCounter
    takeDamage(amount) {
        super.takeDamage(amount);
    }

    // Draws the parent sprite and a health bar above the boss
    draw(ctx) {
        super.draw(ctx); // draws the spritesheet frame

        // Health bar dimensions and position
        const barW = 120;
        const barH = 10;
        const barX = this.position.x - barW / 2;
        const barY = this.position.y - this.halfSize.y - 22;

        // hpRatio clamped to 0 so the bar never goes negative width
        let hpRatio = this.health / this.maxHealth;
        if (hpRatio < 0) hpRatio = 0;

        ctx.save();
        // Dark background track
        ctx.fillStyle = "#333";
        ctx.fillRect(barX, barY, barW, barH);
        // Fill — orange when enraged, red otherwise
        ctx.fillStyle = this.isEnraged ? "#ff4400" : "#cc0000";
        ctx.fillRect(barX, barY, barW * hpRatio, barH);
        // Border
        ctx.strokeStyle = "#000";
        ctx.lineWidth   = 1;
        ctx.strokeRect(barX, barY, barW, barH);
        ctx.restore();
    }

    die() {
        super.die();
        // Additional death logic like particles or sound effects can go here
    }
}