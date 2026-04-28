/*
 * Enemy class with patrol/chase/stunned AI states, health, damage, and combat mechanics including stun duration on multiple hits.
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */
"use strict";

// --- ENEMY CLASS ---
const frameW = 88; // Ancho total del frame en la imagen
const frameH = 64; // Alto total del frame en la imagen

// Estimación de recorte (ajusta estos valores si ves que se corta una pata)
const offsetX = 22; // Píxeles que nos saltamos desde la izquierda
const offsetY = 15; // Píxeles que nos saltamos desde arriba
const cropW = 44;   // Ancho real de la araña (88 - 15 de cada lado aprox)
const cropH = 34;



const ENEMY_STATE = {
    PATROL: "patrol",
    CHASE: "chase",
    STUNNED: "stunned"
};

const mobsMotion = {
    patrol: {
        status: false,
        axis: "x",
        sign: 1,
        repeat: true,
        duration: 100,
        moveFrames: [14, 20],
        moveFrames2: [21, 27],
    },
    chase: {
        status: false,
        axis: "x",
        sign: 1,
        repeat: true,
        duration: 100,
        moveFrames: [28, 34],
        moveFrames2: [35, 41],
    },
    stunned: {
        status: false,
        axis: "x",
        sign: 1,
        repeat: true,
        duration: 100,
        moveFrames: [0,6],
        moveFrames2: [7, 13],
    },
};

class Enemy extends AnimatedObject {
    constructor(x, y, width, height, color, type, sheetCols, range, health, damage = 0, motion, statesObj) {
        // Initialize GameObject with Vector position
        super(new Vector(x, y), width, height, color, type, sheetCols);
       
        
        this.speed = 1.5;
        this.range = range;      // Patrol range
        this.startX = x;         // Pivot point
        this.direction = 1;      // Horizontal direction
        this.detectionRadius = 150;
        this.statesObj = statesObj;
        this.state = this.statesObj.PATROL;
       
        // Combat and Stun properties
        this.health = health;    // Each enemy can now have different health values
        this.stunTimer = 0;
        this.stunDuration = 800; // Time the enemy is disabled after being hit
       
        this.damage = damage;
        //hit counter to set a longer stun duration in enemies
        this.hitCounter = 0;

        this.motion = motion;
        this.dirData;




        // Initialize spriteRect for AnimatedObject.js
        this.spriteRect = new Rect(0, 0, width, height);
    }


    // Method to handle receiving damage
    takeDamage(amount) {
        if (this.state === this.statesObj.STUNNED) return; // Invulnerability frames during stun
        this.health -= amount;
        this.hitCounter = this.hitCounter + 1;
        console.log('Enemy took a hit: '+ this.hitCounter);


        if (this.health <= 0) {
            this.die();
        }
        else {
            if(this.hitCounter > 3){
                if(this.state != this.statesObj.STUNNED){
                    this.state = this.statesObj.STUNNED;
                    this.dirData = this.motion[this.state];

                    if(this.direction == 1){
                        this.setAnimation(this.dirData.moveFrames[0],this.dirData.moveFrames[1], this.dirData.repeat, this.dirData.duration);
                    }
                    else{
                        this.setAnimation(this.dirData.moveFrames2[0],this.dirData.moveFrames2[1], this.dirData.repeat, this.dirData.duration);
                    }
                    
                    this.stunTimer = this.stunDuration * 4;
                    this.hitCounter = 0;
                }
                    
            }
            else{
                if(this.state != this.statesObj.STUNNED){
                    this.state = this.statesObj.STUNNED;
                    this.dirData = this.motion[this.state];

                    if(this.direction == 1){
                        this.setAnimation(this.dirData.moveFrames[0],this.dirData.moveFrames[1], this.dirData.repeat, this.dirData.duration);
                    }
                    else{
                        this.setAnimation(this.dirData.moveFrames2[0],this.dirData.moveFrames2[1], this.dirData.repeat, this.dirData.duration);
                    }

                    this.stunTimer = this.stunDuration;
                    this.hitCounter = 0;
                }
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
    // changeAnimation(){
    //     if (this.type === 'mosquito') {
    //         // Asumiendo dimensiones similares para el mosquito
    //         this.setSprite("./assets/enemies/finalMosqSprites.png", new Rect(offsetX, offsetY, cropW, cropH));
    //         this.setAnimation(0, 6, true, 250); 
    //     } 
    //     else if (this.type === 'spider') {
    //         // Rect(x, y, ancho_frame, alto_frame) -> Tomamos el primer frame de la cuadrícula
    //         this.setSprite("./assets/enemies/finalSpiderSprites.png", new Rect(offsetX, offsetY, cropW, cropH));
    //         this.setAnimation(2, 6, true, 250); 
    //     }
    // }

    update(target, deltaTime) {
        // Stop movement logic if the enemy is stunned
        if (this.state === this.statesObj.STUNNED) {
            this.stunTimer -= deltaTime;
            if (this.stunTimer <= 0) {
                this.state = this.statesObj.PATROL;
                // this.dirData = this.motion[this.state];
                // this.setAnimation(dirData.moveFrames[0],dirData.moveFrames[1], dirData.repeat, dirData.duration);
            }
            return;
        }

        // Logic to track the player (frog)
        let dx = target.position.x - this.position.x;
        let dy = target.position.y - this.position.y;
        let distance = (dx * dx + dy * dy);

        // State switching
        if (distance < this.detectionRadius**2) {
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
            
        } else {
            if(this.state != this.statesObj.PATROL){
                this.state = this.statesObj.PATROL;
                this.dirData = this.motion[this.state];

                if(this.direction == 1){
                    this.setAnimation(this.dirData.moveFrames[0],this.dirData.moveFrames[1], this.dirData.repeat, this.dirData.duration);
                    }
                else{
                    this.setAnimation(this.dirData.moveFrames2[0],this.dirData.moveFrames2[1], this.dirData.repeat, this.dirData.duration);
                }
            }
                
        }

        // Movement execution
        if (this.state === this.statesObj.CHASE) {
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
        // this.updateAnimation(deltaTime);
    }

    draw(ctx) {
        // Visual feedback when stunned
        if (this.state === this.statesObj.STUNNED) {
            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.position.x - this.halfSize.x, this.position.y - this.halfSize.y, this.size.x, this.size.y);
        }
        
        super.draw(ctx);
        ctx.globalAlpha = 1.0;
    }
}