/*
 * Enemy class with patrol/chase/stunned AI states, health, damage, and combat mechanics including stun duration on multiple hits.
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */
"use strict";

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
        //hit counter to set a longer stun duration in enemies
        this.hitCounter = 0;




        // Initialize spriteRect for AnimatedObject.js
        this.spriteRect = new Rect(0, 0, width, height);
    }


    // Method to handle receiving damage
    takeDamage(amount) {
        if (this.state === ENEMY_STATE.STUNNED) return; // Invulnerability frames during stun
        this.health -= amount;
        this.hitCounter = this.hitCounter + 1;
        console.log('Enemy took a hit: '+ this.hitCounter);


        if (this.health <= 0) {
            this.die();
        }
        else {
            if(this.hitCounter > 3){
                this.state = ENEMY_STATE.STUNNED;
                this.stunTimer = this.stunDuration * 4;
                this.hitCounter = 0;
            }
            else{
                this.state = ENEMY_STATE.STUNNED;
                this.stunTimer = this.stunDuration;
            }
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