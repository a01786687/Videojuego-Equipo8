<<<<<<< HEAD
<<<<<<< HEAD
/*
 * EagleBoss — Final boss of Anura.
 */
"use strict";

const EAGLE_STATE = {
    HOVER:   "hover",
    SWOOP:   "swoop",
    DIVE:    "dive",
    RECOVER: "recover",
    ENRAGED: "enraged",
    STUNNED: "stunned"
};

// Frame ranges for each animation state
// moveFrames  = facing right | moveFrames2 = facing left (same frames, draw() flips)
const eagleMotion = {
    hover: {
        repeat: true,
        duration: 100,
        moveFrames:  [12, 15],  // FLY row
        moveFrames2: [12, 15],
    },
    swoop: {
        repeat: true,
        duration: 70,
        moveFrames:  [16, 19],  // ATTACK row — fast flap
        moveFrames2: [16, 19],
    },
    dive: {
        repeat: true,
        duration: 60,
        moveFrames:  [16, 19],
        moveFrames2: [16, 19],
    },
    recover: {
        repeat: true,
        duration: 100,
        moveFrames:  [12, 15],
        moveFrames2: [12, 15],
    },
    enraged: {
        repeat: true,
        duration: 70,
        moveFrames:  [4, 7],    // ENRAGED IDLE row
        moveFrames2: [4, 7],
    },
    stunned: {
        repeat: true,
        duration: 150,
        moveFrames:  [0, 3],    // IDLE perched row — briefly lands when stunned
        moveFrames2: [0, 3],
    },
};

class EagleBoss extends Enemy {
    constructor(x, y, width, height, color, mob_name, speed, range, hp, dmg, motion, statesObj) {
        super(x, y, width, height, color, mob_name, 4, range, hp, dmg, motion, statesObj);

        this.maxHealth  = hp;
        this.state      = this.statesObj.HOVER;
        this.isEnraged  = false;
        this.facing     = 1; // 1 = right, -1 = left

        // --- FLY (no gravity) ---
        this.flySpeed     = speed * 0.8;
        this.enragedSpeed = speed * 1.6;

        // --- HOVER ---
        this.hoverY         = y;
        this.hoverAmplitude = 15;
        this.hoverTime      = 0;
        this.hoverDuration  = 1800;
        this.hoverTimer     = this.hoverDuration;

        // --- SWOOP ---
        this.swoopSpeed      = speed * 3.5;
        this.swoopDuration   = 600;
        this.swoopTimer      = 0;
        this.swoopDirectionX = 1;
        this.swoopCooldown   = 2500;
        this.lastSwoopTime   = 0;

        // --- DIVE ---
        this.diveSpeed        = speed * 4;
        this.diveTargetX      = 0;
        this.diveDuration     = 500;
        this.diveTimer        = 0;
        this.diveCooldown     = 3000;
        this.lastDiveTime     = 0;
        this.hitDealtThisDive = false;

        // --- RECOVER ---
        this.recoverSpeed    = speed * 1.5;
        this.recoverTargetY  = 0;
        this.recoverTimer    = 0;
        this.recoverDuration = 800;

        // Start in fly animation
        this.setAnim(this.statesObj.HOVER);
    }

    update(target, deltaTime) {
        // Parent stun logic
        if (this.state === this.statesObj.STUNNED) {
            this.stunTimer -= deltaTime;
            if (this.stunTimer <= 0) {
                this.state = this.statesObj.HOVER;
                this.setAnim(this.statesObj.HOVER);
            }
            this.updateFrame(deltaTime);
            this.updateCollider();
            return;
        }

        // --- PHASE TRANSITION at 40% HP ---
        if (!this.isEnraged && this.health <= this.maxHealth * 0.4) {
            this.isEnraged      = true;
            this.state          = this.statesObj.ENRAGED;
            this.flySpeed       = this.enragedSpeed;
            this.swoopSpeed    *= 1.3;
            this.diveSpeed     *= 1.3;
            this.hoverDuration  = 900;
            this.swoopCooldown  = 1400;
            this.diveCooldown   = 1600;
            this.setAnim(this.statesObj.ENRAGED);
            console.log("Phase 2: The eagle is enraged!");
        }

        const dx  = target.position.x - this.position.x;
        const dy  = target.position.y - this.position.y;
        const now = Date.now();

        // Update facing direction
        if (dx > 0) this.facing =  1;
        if (dx < 0) this.facing = -1;

        if (this.state === this.statesObj.HOVER || this.state === this.statesObj.ENRAGED) {

            // Gentle horizontal drift toward frog
            this.position.x += Math.sign(dx) * this.flySpeed * 0.4 * (deltaTime / 16);

            // Sinusoidal vertical bob
            this.hoverTime  += deltaTime;
            this.position.y  = this.hoverY + Math.sin(this.hoverTime / 400) * this.hoverAmplitude;

            // Count down hover timer then pick an attack
            this.hoverTimer -= deltaTime;
            if (this.hoverTimer <= 0) {
                this.hoverTimer = this.hoverDuration;
                this.pickAttack(target, now);
            }

            // Contact damage during hover
            this.checkContactDamage(target);

        } else if (this.state === this.statesObj.SWOOP) {
            this.swoopTimer -= deltaTime;
            this.position.x += this.swoopDirectionX * this.swoopSpeed * (deltaTime / 16);

            // Deal damage on contact during swoop
            if (boxOverlap(this, target)) this.dealDamageToFrog(target);

            if (this.swoopTimer <= 0) {
                this.state  = this.isEnraged ? this.statesObj.ENRAGED : this.statesObj.HOVER;
                this.hoverY = this.position.y;
                this.setAnim(this.state);
            }

        } else if (this.state === this.statesObj.DIVE) {
            this.diveTimer -= deltaTime;

            // Lock X to target, charge straight down
            this.position.x += (this.diveTargetX - this.position.x) * 0.15;
            this.position.y += this.diveSpeed * (deltaTime / 16);

            // Deal damage once per dive
            if (!this.hitDealtThisDive && boxOverlap(this, target)) {
                this.dealDamageToFrog(target);
                this.hitDealtThisDive = true;
            }

            // Hit floor or timer expired → recover
            const floorY = canvasHeight - this.halfSize.y - TILE_SIZE;
            if (this.diveTimer <= 0 || this.position.y >= floorY) {
                if (this.position.y > floorY) this.position.y = floorY;
                this.startRecover();
            }

        } else if (this.state === this.statesObj.RECOVER) {
            this.recoverTimer -= deltaTime;

            const distY = this.recoverTargetY - this.position.y;
            this.position.y += Math.sign(distY) * this.recoverSpeed * (deltaTime / 16);

            if (this.recoverTimer <= 0 || Math.abs(distY) < 5) {
                this.position.y = this.recoverTargetY;
                this.hoverY     = this.recoverTargetY;
                this.state      = this.isEnraged ? this.statesObj.ENRAGED : this.statesObj.HOVER;
                this.setAnim(this.state);
            }
        }

        // Arena wall clamp — prevents eagle from flying outside bounds
        // eagleArenaLeft and eagleArenaRight are defined in bossScene2.js
        if (typeof eagleArenaLeft !== "undefined" && typeof eagleArenaRight !== "undefined") {
            if (this.position.x - this.halfSize.x < eagleArenaLeft) {
                this.position.x = eagleArenaLeft + this.halfSize.x;
                // Reverse swoop direction if hitting a wall mid-swoop
                if (this.state === this.statesObj.SWOOP) this.swoopDirectionX *= -1;
            }
            if (this.position.x + this.halfSize.x > eagleArenaRight) {
                this.position.x = eagleArenaRight - this.halfSize.x;
                if (this.state === this.statesObj.SWOOP) this.swoopDirectionX *= -1;
            }
        }

        // Ceiling and floor clamp — eagle stays within vertical arena bounds
        const ceilY  = this.halfSize.y + TILE_SIZE;
        const floorY = canvasHeight - this.halfSize.y - TILE_SIZE;
        if (this.position.y < ceilY)  this.position.y = ceilY;
        if (this.position.y > floorY) this.position.y = floorY;

        this.updateFrame(deltaTime);
        this.updateCollider();
    }

    // Picks the next attack based on what cooldown is ready
    pickAttack(target, now) {
        const canDive  = now - this.lastDiveTime  > this.diveCooldown;
        const canSwoop = now - this.lastSwoopTime > this.swoopCooldown;

        if (canDive && canSwoop) {
            Math.random() < 0.5 ? this.startDive(target) : this.startSwoop(target.position.x - this.position.x);
        } else if (canDive) {
            this.startDive(target);
        } else if (canSwoop) {
            this.startSwoop(target.position.x - this.position.x);
        }
    }

    startSwoop(dx) {
        this.state           = this.statesObj.SWOOP;
        this.swoopTimer      = this.swoopDuration;
        this.lastSwoopTime   = Date.now();
        this.swoopDirectionX = dx > 0 ? 1 : -1;
        this.setAnim(this.statesObj.SWOOP);
    }

    startDive(target) {
        this.state            = this.statesObj.DIVE;
        this.diveTimer        = this.diveDuration;
        this.lastDiveTime     = Date.now();
        this.diveTargetX      = target.position.x;
        this.hitDealtThisDive = false;
        this.setAnim(this.statesObj.DIVE);
    }

    startRecover() {
        this.state           = this.statesObj.RECOVER;
        this.recoverTimer    = this.recoverDuration;
        this.recoverTargetY  = canvasHeight * 0.3;
        this.setAnim(this.statesObj.RECOVER);
    }

    checkContactDamage(frog) {
        if (boxOverlap(this, frog)) this.dealDamageToFrog(frog);
    }

    dealDamageToFrog(frog) {
        if (frog.invincibilityTimer > 0) return;
        currentHealth -= this.damage;
        frog.invincibilityTimer = frog.invincibilityDuration;
        console.log(`Eagle hit frog for ${this.damage}. Frog HP: ${currentHealth}`);
        if (currentHealth <= 0) gameOver();
    }

    // Changes animation only when state changes to avoid restarting frames
    setAnim(state) {
        const data = eagleMotion[state];
        if (!data) return;
        const frames = this.facing === 1 ? data.moveFrames : data.moveFrames2;
        this.setAnimation(frames[0], frames[1], data.repeat, data.duration);
    }

    takeDamage(amount) {
        super.takeDamage(amount);
    }

    draw(ctx) {
        ctx.save();

        // Flip horizontally when facing left
        if (this.facing === -1) {
            ctx.translate(this.position.x, this.position.y);
            ctx.scale(-1, 1);
            ctx.translate(-this.position.x, -this.position.y);
        }

        // Draw sprite (set from bossScene2.js after instantiation)
        if (this.spriteImage && this.spriteImage.complete && this.spriteRect) {
            ctx.drawImage(
                this.spriteImage,
                this.spriteRect.x,
                this.spriteRect.y,
                this.spriteRect.width,
                this.spriteRect.height,
                this.position.x - this.halfSize.x,
                this.position.y - this.halfSize.y,
                this.size.x,
                this.size.y
            );
        } else {
            ctx.fillStyle = this.isEnraged ? "#8B0000" : "#8B6914";
            ctx.fillRect(
                this.position.x - this.halfSize.x,
                this.position.y - this.halfSize.y,
                this.size.x,
                this.size.y
            );
        }

        ctx.restore();

        // Health bar
        const barW    = 160;
        const barH    = 12;
        const barX    = this.position.x - barW / 2;
        const barY    = this.position.y - this.halfSize.y - 24;
        let hpRatio = this.health / this.maxHealth;
        if (hpRatio < 0) hpRatio = 0;

        ctx.save();
        ctx.fillStyle = "#333";
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = this.isEnraged ? "#ff6600" : "#8B0000";
        ctx.fillRect(barX, barY, barW * hpRatio, barH);
        ctx.strokeStyle = "#000";
        ctx.lineWidth   = 1;
        ctx.strokeRect(barX, barY, barW, barH);


        if (showBBox) this.drawBoundingBox(ctx);
    }

    die() {
        super.die();
        console.log("The Eagle has been defeated!");
    }
=======
/*
 * EagleBoss — Final boss of Anura.
 */
"use strict";

const EAGLE_STATE = {
    HOVER:   "hover",
    SWOOP:   "swoop",
    DIVE:    "dive",
    RECOVER: "recover",
    ENRAGED: "enraged",
    STUNNED: "stunned"
};

// Frame ranges for each animation state
// moveFrames  = facing right | moveFrames2 = facing left (same frames, draw() flips)
const eagleMotion = {
    hover: {
        repeat: true,
        duration: 100,
        moveFrames:  [12, 15],  // FLY row
        moveFrames2: [12, 15],
    },
    swoop: {
        repeat: true,
        duration: 70,
        moveFrames:  [16, 19],  // ATTACK row — fast flap
        moveFrames2: [16, 19],
    },
    dive: {
        repeat: true,
        duration: 60,
        moveFrames:  [16, 19],
        moveFrames2: [16, 19],
    },
    recover: {
        repeat: true,
        duration: 100,
        moveFrames:  [12, 15],
        moveFrames2: [12, 15],
    },
    enraged: {
        repeat: true,
        duration: 70,
        moveFrames:  [4, 7],    // ENRAGED IDLE row
        moveFrames2: [4, 7],
    },
    stunned: {
        repeat: true,
        duration: 150,
        moveFrames:  [0, 3],    // IDLE perched row — briefly lands when stunned
        moveFrames2: [0, 3],
    },
};

class EagleBoss extends Enemy {
    constructor(x, y, width, height, color, mob_name, speed, range, hp, dmg, motion, statesObj) {
        super(x, y, width, height, color, mob_name, 4, range, hp, dmg, motion, statesObj);

        this.maxHealth  = hp;
        this.state      = this.statesObj.HOVER;
        this.isEnraged  = false;
        this.facing     = 1; // 1 = right, -1 = left

        // --- FLY (no gravity) ---
        this.flySpeed     = speed * 0.8;
        this.enragedSpeed = speed * 1.6;

        // --- HOVER ---
        this.hoverY         = y;
        this.hoverAmplitude = 15;
        this.hoverTime      = 0;
        this.hoverDuration  = 1800;
        this.hoverTimer     = this.hoverDuration;

        // --- SWOOP ---
        this.swoopSpeed      = speed * 3.5;
        this.swoopDuration   = 600;
        this.swoopTimer      = 0;
        this.swoopDirectionX = 1;
        this.swoopCooldown   = 2500;
        this.lastSwoopTime   = 0;

        // --- DIVE ---
        this.diveSpeed        = speed * 4;
        this.diveTargetX      = 0;
        this.diveDuration     = 500;
        this.diveTimer        = 0;
        this.diveCooldown     = 3000;
        this.lastDiveTime     = 0;
        this.hitDealtThisDive = false;

        // --- RECOVER ---
        this.recoverSpeed    = speed * 1.5;
        this.recoverTargetY  = 0;
        this.recoverTimer    = 0;
        this.recoverDuration = 800;

        // Start in fly animation
        this.setAnim(this.statesObj.HOVER);
    }

    update(target, deltaTime) {
        // Parent stun logic
        if (this.state === this.statesObj.STUNNED) {
            this.stunTimer -= deltaTime;
            if (this.stunTimer <= 0) {
                this.state = this.statesObj.HOVER;
                this.setAnim(this.statesObj.HOVER);
            }
            this.updateFrame(deltaTime);
            this.updateCollider();
            return;
        }

        // --- PHASE TRANSITION at 40% HP ---
        if (!this.isEnraged && this.health <= this.maxHealth * 0.4) {
            this.isEnraged      = true;
            this.state          = this.statesObj.ENRAGED;
            this.flySpeed       = this.enragedSpeed;
            this.swoopSpeed    *= 1.3;
            this.diveSpeed     *= 1.3;
            this.hoverDuration  = 900;
            this.swoopCooldown  = 1400;
            this.diveCooldown   = 1600;
            this.setAnim(this.statesObj.ENRAGED);
            console.log("Phase 2: The eagle is enraged!");
        }

        const dx  = target.position.x - this.position.x;
        const dy  = target.position.y - this.position.y;
        const now = Date.now();

        // Update facing direction
        if (dx > 0) this.facing =  1;
        if (dx < 0) this.facing = -1;

        if (this.state === this.statesObj.HOVER || this.state === this.statesObj.ENRAGED) {

            // Gentle horizontal drift toward frog
            this.position.x += Math.sign(dx) * this.flySpeed * 0.4 * (deltaTime / 16);

            // Sinusoidal vertical bob
            this.hoverTime  += deltaTime;
            this.position.y  = this.hoverY + Math.sin(this.hoverTime / 400) * this.hoverAmplitude;

            // Count down hover timer then pick an attack
            this.hoverTimer -= deltaTime;
            if (this.hoverTimer <= 0) {
                this.hoverTimer = this.hoverDuration;
                this.pickAttack(target, now);
            }

            // Contact damage during hover
            this.checkContactDamage(target);

        } else if (this.state === this.statesObj.SWOOP) {
            this.swoopTimer -= deltaTime;
            this.position.x += this.swoopDirectionX * this.swoopSpeed * (deltaTime / 16);

            // Deal damage on contact during swoop
            if (boxOverlap(this, target)) this.dealDamageToFrog(target);

            if (this.swoopTimer <= 0) {
                this.state  = this.isEnraged ? this.statesObj.ENRAGED : this.statesObj.HOVER;
                this.hoverY = this.position.y;
                this.setAnim(this.state);
            }

        } else if (this.state === this.statesObj.DIVE) {
            this.diveTimer -= deltaTime;

            // Lock X to target, charge straight down
            this.position.x += (this.diveTargetX - this.position.x) * 0.15;
            this.position.y += this.diveSpeed * (deltaTime / 16);

            // Deal damage once per dive
            if (!this.hitDealtThisDive && boxOverlap(this, target)) {
                this.dealDamageToFrog(target);
                this.hitDealtThisDive = true;
            }

            // Hit floor or timer expired → recover
            const floorY = canvasHeight - this.halfSize.y - TILE_SIZE;
            if (this.diveTimer <= 0 || this.position.y >= floorY) {
                if (this.position.y > floorY) this.position.y = floorY;
                this.startRecover();
            }

        } else if (this.state === this.statesObj.RECOVER) {
            this.recoverTimer -= deltaTime;

            const distY = this.recoverTargetY - this.position.y;
            this.position.y += Math.sign(distY) * this.recoverSpeed * (deltaTime / 16);

            if (this.recoverTimer <= 0 || Math.abs(distY) < 5) {
                this.position.y = this.recoverTargetY;
                this.hoverY     = this.recoverTargetY;
                this.state      = this.isEnraged ? this.statesObj.ENRAGED : this.statesObj.HOVER;
                this.setAnim(this.state);
            }
        }

        // Arena wall clamp — prevents eagle from flying outside bounds
        // eagleArenaLeft and eagleArenaRight are defined in bossScene2.js
        if (typeof eagleArenaLeft !== "undefined" && typeof eagleArenaRight !== "undefined") {
            if (this.position.x - this.halfSize.x < eagleArenaLeft) {
                this.position.x = eagleArenaLeft + this.halfSize.x;
                // Reverse swoop direction if hitting a wall mid-swoop
                if (this.state === this.statesObj.SWOOP) this.swoopDirectionX *= -1;
            }
            if (this.position.x + this.halfSize.x > eagleArenaRight) {
                this.position.x = eagleArenaRight - this.halfSize.x;
                if (this.state === this.statesObj.SWOOP) this.swoopDirectionX *= -1;
            }
        }

        // Ceiling and floor clamp — eagle stays within vertical arena bounds
        const ceilY  = this.halfSize.y + TILE_SIZE;
        const floorY = canvasHeight - this.halfSize.y - TILE_SIZE;
        if (this.position.y < ceilY)  this.position.y = ceilY;
        if (this.position.y > floorY) this.position.y = floorY;

        this.updateFrame(deltaTime);
        this.updateCollider();
    }

    // Picks the next attack based on what cooldown is ready
    pickAttack(target, now) {
        const canDive  = now - this.lastDiveTime  > this.diveCooldown;
        const canSwoop = now - this.lastSwoopTime > this.swoopCooldown;

        if (canDive && canSwoop) {
            Math.random() < 0.5 ? this.startDive(target) : this.startSwoop(target.position.x - this.position.x);
        } else if (canDive) {
            this.startDive(target);
        } else if (canSwoop) {
            this.startSwoop(target.position.x - this.position.x);
        }
    }

    startSwoop(dx) {
        this.state           = this.statesObj.SWOOP;
        this.swoopTimer      = this.swoopDuration;
        this.lastSwoopTime   = Date.now();
        this.swoopDirectionX = dx > 0 ? 1 : -1;
        this.setAnim(this.statesObj.SWOOP);
    }

    startDive(target) {
        this.state            = this.statesObj.DIVE;
        this.diveTimer        = this.diveDuration;
        this.lastDiveTime     = Date.now();
        this.diveTargetX      = target.position.x;
        this.hitDealtThisDive = false;
        this.setAnim(this.statesObj.DIVE);
    }

    startRecover() {
        this.state           = this.statesObj.RECOVER;
        this.recoverTimer    = this.recoverDuration;
        this.recoverTargetY  = canvasHeight * 0.3;
        this.setAnim(this.statesObj.RECOVER);
    }

    checkContactDamage(frog) {
        if (boxOverlap(this, frog)) this.dealDamageToFrog(frog);
    }

    dealDamageToFrog(frog) {
        if (frog.invincibilityTimer > 0) return;
        currentHealth -= this.damage;
        frog.invincibilityTimer = frog.invincibilityDuration;
        console.log(`Eagle hit frog for ${this.damage}. Frog HP: ${currentHealth}`);
        if (currentHealth <= 0) gameOver();
    }

    // Changes animation only when state changes to avoid restarting frames
    setAnim(state) {
        const data = eagleMotion[state];
        if (!data) return;
        const frames = this.facing === 1 ? data.moveFrames : data.moveFrames2;
        this.setAnimation(frames[0], frames[1], data.repeat, data.duration);
    }

    takeDamage(amount) {
        super.takeDamage(amount);
    }

    draw(ctx) {
        ctx.save();

        // Flip horizontally when facing left
        if (this.facing === -1) {
            ctx.translate(this.position.x, this.position.y);
            ctx.scale(-1, 1);
            ctx.translate(-this.position.x, -this.position.y);
        }

        // Draw sprite (set from bossScene2.js after instantiation)
        if (this.spriteImage && this.spriteImage.complete && this.spriteRect) {
            ctx.drawImage(
                this.spriteImage,
                this.spriteRect.x,
                this.spriteRect.y,
                this.spriteRect.width,
                this.spriteRect.height,
                this.position.x - this.halfSize.x,
                this.position.y - this.halfSize.y,
                this.size.x,
                this.size.y
            );
        } else {
            ctx.fillStyle = this.isEnraged ? "#8B0000" : "#8B6914";
            ctx.fillRect(
                this.position.x - this.halfSize.x,
                this.position.y - this.halfSize.y,
                this.size.x,
                this.size.y
            );
        }

        ctx.restore();

        // Health bar
        const barW    = 160;
        const barH    = 12;
        const barX    = this.position.x - barW / 2;
        const barY    = this.position.y - this.halfSize.y - 24;
        let hpRatio = this.health / this.maxHealth;
        if (hpRatio < 0) hpRatio = 0;

        ctx.save();
        ctx.fillStyle = "#333";
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = this.isEnraged ? "#ff6600" : "#8B0000";
        ctx.fillRect(barX, barY, barW * hpRatio, barH);
        ctx.strokeStyle = "#000";
        ctx.lineWidth   = 1;
        ctx.strokeRect(barX, barY, barW, barH);


        if (showBBox) this.drawBoundingBox(ctx);
    }

    die() {
        super.die();
        console.log("The Eagle has been defeated!");
    }
>>>>>>> main
=======
/*
 * EagleBoss — Final boss of Anura.
 */
"use strict";

const EAGLE_STATE = {
    HOVER:   "hover",
    SWOOP:   "swoop",
    DIVE:    "dive",
    RECOVER: "recover",
    ENRAGED: "enraged",
    STUNNED: "stunned"
};

// Frame ranges for each animation state
// moveFrames  = facing right | moveFrames2 = facing left (same frames, draw() flips)
const eagleMotion = {
    hover: {
        repeat: true,
        duration: 100,
        moveFrames:  [12, 15],  // FLY row
        moveFrames2: [12, 15],
    },
    swoop: {
        repeat: true,
        duration: 70,
        moveFrames:  [16, 19],  // ATTACK row — fast flap
        moveFrames2: [16, 19],
    },
    dive: {
        repeat: true,
        duration: 60,
        moveFrames:  [16, 19],
        moveFrames2: [16, 19],
    },
    recover: {
        repeat: true,
        duration: 100,
        moveFrames:  [12, 15],
        moveFrames2: [12, 15],
    },
    enraged: {
        repeat: true,
        duration: 70,
        moveFrames:  [4, 7],    // ENRAGED IDLE row
        moveFrames2: [4, 7],
    },
    stunned: {
        repeat: true,
        duration: 150,
        moveFrames:  [0, 3],    // IDLE perched row — briefly lands when stunned
        moveFrames2: [0, 3],
    },
};

class EagleBoss extends Enemy {
    constructor(x, y, width, height, color, mob_name, speed, range, hp, dmg, motion, statesObj) {
        super(x, y, width, height, color, mob_name, 4, range, hp, dmg, motion, statesObj);

        this.maxHealth  = hp;
        this.state      = this.statesObj.HOVER;
        this.isEnraged  = false;
        this.facing     = 1; // 1 = right, -1 = left

        // --- FLY (no gravity) ---
        this.flySpeed     = speed * 0.8;
        this.enragedSpeed = speed * 1.6;

        // --- HOVER ---
        this.hoverY         = y;
        this.hoverAmplitude = 15;
        this.hoverTime      = 0;
        this.hoverDuration  = 1800;
        this.hoverTimer     = this.hoverDuration;

        // --- SWOOP ---
        this.swoopSpeed      = speed * 3.5;
        this.swoopDuration   = 600;
        this.swoopTimer      = 0;
        this.swoopDirectionX = 1;
        this.swoopCooldown   = 2500;
        this.lastSwoopTime   = 0;

        // --- DIVE ---
        this.diveSpeed        = speed * 4;
        this.diveTargetX      = 0;
        this.diveDuration     = 500;
        this.diveTimer        = 0;
        this.diveCooldown     = 3000;
        this.lastDiveTime     = 0;
        this.hitDealtThisDive = false;

        // --- RECOVER ---
        this.recoverSpeed    = speed * 1.5;
        this.recoverTargetY  = 0;
        this.recoverTimer    = 0;
        this.recoverDuration = 800;

        // Start in fly animation
        this.setAnim(this.statesObj.HOVER);
    }

    update(target, deltaTime) {
        // Parent stun logic
        if (this.state === this.statesObj.STUNNED) {
            this.stunTimer -= deltaTime;
            if (this.stunTimer <= 0) {
                this.state = this.statesObj.HOVER;
                this.setAnim(this.statesObj.HOVER);
            }
            this.updateFrame(deltaTime);
            this.updateCollider();
            return;
        }

        // --- PHASE TRANSITION at 40% HP ---
        if (!this.isEnraged && this.health <= this.maxHealth * 0.4) {
            this.isEnraged      = true;
            this.state          = this.statesObj.ENRAGED;
            this.flySpeed       = this.enragedSpeed;
            this.swoopSpeed    *= 1.3;
            this.diveSpeed     *= 1.3;
            this.hoverDuration  = 900;
            this.swoopCooldown  = 1400;
            this.diveCooldown   = 1600;
            this.setAnim(this.statesObj.ENRAGED);
            console.log("Phase 2: The eagle is enraged!");
        }

        const dx  = target.position.x - this.position.x;
        const dy  = target.position.y - this.position.y;
        const now = Date.now();

        // Update facing direction
        if (dx > 0) this.facing =  1;
        if (dx < 0) this.facing = -1;

        if (this.state === this.statesObj.HOVER || this.state === this.statesObj.ENRAGED) {

            // Gentle horizontal drift toward frog
            this.position.x += Math.sign(dx) * this.flySpeed * 0.4 * (deltaTime / 16);

            // Sinusoidal vertical bob
            this.hoverTime  += deltaTime;
            this.position.y  = this.hoverY + Math.sin(this.hoverTime / 400) * this.hoverAmplitude;

            // Count down hover timer then pick an attack
            this.hoverTimer -= deltaTime;
            if (this.hoverTimer <= 0) {
                this.hoverTimer = this.hoverDuration;
                this.pickAttack(target, now);
            }

            // Contact damage during hover
            this.checkContactDamage(target);

        } else if (this.state === this.statesObj.SWOOP) {
            this.swoopTimer -= deltaTime;
            this.position.x += this.swoopDirectionX * this.swoopSpeed * (deltaTime / 16);

            // Deal damage on contact during swoop
            if (boxOverlap(this, target)) this.dealDamageToFrog(target);

            if (this.swoopTimer <= 0) {
                this.state  = this.isEnraged ? this.statesObj.ENRAGED : this.statesObj.HOVER;
                this.hoverY = this.position.y;
                this.setAnim(this.state);
            }

        } else if (this.state === this.statesObj.DIVE) {
            this.diveTimer -= deltaTime;

            // Lock X to target, charge straight down
            this.position.x += (this.diveTargetX - this.position.x) * 0.15;
            this.position.y += this.diveSpeed * (deltaTime / 16);

            // Deal damage once per dive
            if (!this.hitDealtThisDive && boxOverlap(this, target)) {
                this.dealDamageToFrog(target);
                this.hitDealtThisDive = true;
            }

            // Hit floor or timer expired → recover
            const floorY = canvasHeight - this.halfSize.y - TILE_SIZE;
            if (this.diveTimer <= 0 || this.position.y >= floorY) {
                if (this.position.y > floorY) this.position.y = floorY;
                this.startRecover();
            }

        } else if (this.state === this.statesObj.RECOVER) {
            this.recoverTimer -= deltaTime;

            const distY = this.recoverTargetY - this.position.y;
            this.position.y += Math.sign(distY) * this.recoverSpeed * (deltaTime / 16);

            if (this.recoverTimer <= 0 || Math.abs(distY) < 5) {
                this.position.y = this.recoverTargetY;
                this.hoverY     = this.recoverTargetY;
                this.state      = this.isEnraged ? this.statesObj.ENRAGED : this.statesObj.HOVER;
                this.setAnim(this.state);
            }
        }

        // Arena wall clamp — prevents eagle from flying outside bounds
        // eagleArenaLeft and eagleArenaRight are defined in bossScene2.js
        if (typeof eagleArenaLeft !== "undefined" && typeof eagleArenaRight !== "undefined") {
            if (this.position.x - this.halfSize.x < eagleArenaLeft) {
                this.position.x = eagleArenaLeft + this.halfSize.x;
                // Reverse swoop direction if hitting a wall mid-swoop
                if (this.state === this.statesObj.SWOOP) this.swoopDirectionX *= -1;
            }
            if (this.position.x + this.halfSize.x > eagleArenaRight) {
                this.position.x = eagleArenaRight - this.halfSize.x;
                if (this.state === this.statesObj.SWOOP) this.swoopDirectionX *= -1;
            }
        }

        // Ceiling and floor clamp — eagle stays within vertical arena bounds
        const ceilY  = this.halfSize.y + TILE_SIZE;
        const floorY = canvasHeight - this.halfSize.y - TILE_SIZE;
        if (this.position.y < ceilY)  this.position.y = ceilY;
        if (this.position.y > floorY) this.position.y = floorY;

        this.updateFrame(deltaTime);
        this.updateCollider();
    }

    // Picks the next attack based on what cooldown is ready
    pickAttack(target, now) {
        const canDive  = now - this.lastDiveTime  > this.diveCooldown;
        const canSwoop = now - this.lastSwoopTime > this.swoopCooldown;

        if (canDive && canSwoop) {
            Math.random() < 0.5 ? this.startDive(target) : this.startSwoop(target.position.x - this.position.x);
        } else if (canDive) {
            this.startDive(target);
        } else if (canSwoop) {
            this.startSwoop(target.position.x - this.position.x);
        }
    }

    startSwoop(dx) {
        this.state           = this.statesObj.SWOOP;
        this.swoopTimer      = this.swoopDuration;
        this.lastSwoopTime   = Date.now();
        this.swoopDirectionX = dx > 0 ? 1 : -1;
        this.setAnim(this.statesObj.SWOOP);
    }

    startDive(target) {
        this.state            = this.statesObj.DIVE;
        this.diveTimer        = this.diveDuration;
        this.lastDiveTime     = Date.now();
        this.diveTargetX      = target.position.x;
        this.hitDealtThisDive = false;
        this.setAnim(this.statesObj.DIVE);
    }

    startRecover() {
        this.state           = this.statesObj.RECOVER;
        this.recoverTimer    = this.recoverDuration;
        this.recoverTargetY  = canvasHeight * 0.3;
        this.setAnim(this.statesObj.RECOVER);
    }

    checkContactDamage(frog) {
        if (boxOverlap(this, frog)) this.dealDamageToFrog(frog);
    }

    dealDamageToFrog(frog) {
        if (frog.invincibilityTimer > 0) return;
        currentHealth -= this.damage;
        frog.invincibilityTimer = frog.invincibilityDuration;
        console.log(`Eagle hit frog for ${this.damage}. Frog HP: ${currentHealth}`);
        if (currentHealth <= 0) gameOver();
    }

    // Changes animation only when state changes to avoid restarting frames
    setAnim(state) {
        const data = eagleMotion[state];
        if (!data) return;
        const frames = this.facing === 1 ? data.moveFrames : data.moveFrames2;
        this.setAnimation(frames[0], frames[1], data.repeat, data.duration);
    }

    takeDamage(amount) {
        super.takeDamage(amount);
    }

    draw(ctx) {
        ctx.save();

        // Flip horizontally when facing left
        if (this.facing === -1) {
            ctx.translate(this.position.x, this.position.y);
            ctx.scale(-1, 1);
            ctx.translate(-this.position.x, -this.position.y);
        }

        // Draw sprite (set from bossScene2.js after instantiation)
        if (this.spriteImage && this.spriteImage.complete && this.spriteRect) {
            ctx.drawImage(
                this.spriteImage,
                this.spriteRect.x,
                this.spriteRect.y,
                this.spriteRect.width,
                this.spriteRect.height,
                this.position.x - this.halfSize.x,
                this.position.y - this.halfSize.y,
                this.size.x,
                this.size.y
            );
        } else {
            ctx.fillStyle = this.isEnraged ? "#8B0000" : "#8B6914";
            ctx.fillRect(
                this.position.x - this.halfSize.x,
                this.position.y - this.halfSize.y,
                this.size.x,
                this.size.y
            );
        }

        ctx.restore();

        // Health bar
        const barW    = 160;
        const barH    = 12;
        const barX    = this.position.x - barW / 2;
        const barY    = this.position.y - this.halfSize.y - 24;
        let hpRatio = this.health / this.maxHealth;
        if (hpRatio < 0) hpRatio = 0;

        ctx.save();
        ctx.fillStyle = "#333";
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = this.isEnraged ? "#ff6600" : "#8B0000";
        ctx.fillRect(barX, barY, barW * hpRatio, barH);
        ctx.strokeStyle = "#000";
        ctx.lineWidth   = 1;
        ctx.strokeRect(barX, barY, barW, barH);


        if (showBBox) this.drawBoundingBox(ctx);
    }

    die() {
        super.die();
        console.log("The Eagle has been defeated!");
    }
>>>>>>> main
}