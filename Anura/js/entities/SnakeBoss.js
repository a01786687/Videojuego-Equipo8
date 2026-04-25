/* * SnakeBoss class - First Boss for Anura
 * Inherits from Enemy to reuse stun and health logic
 */
class SnakeBoss extends Enemy {
    constructor(x, y, width, height, color, mob_name, speed, range, hp, dmg) {
        super(x, y, width, height, color, mob_name, speed, range, hp, dmg);
        
        this.phase = 1;
        this.dashSpeed = 6;
        this.isDashing = false;
        this.dashCooldown = 2000; // ms entre dashes
        this.lastDashTime = 0;
        this.dashDuration = 300;  // ms que dura el dash
        this.dashTimer = 0;
        this.dashDirectionX = 0;
    }
 
    update(target, deltaTime) {
        if (this.state === ENEMY_STATE.STUNNED) {
            super.update(target, deltaTime);
            return;
        }
 
        // Cambio de fase según vida
        if (this.health < 25 && this.phase === 1) {
            this.phase = 2;
            this.speed *= 1.2;
            this.dashCooldown = 1200; // más agresivo en fase 2
            console.log("Fase 2: ¡La serpiente está furiosa!");
        }
 
        // Tick del dash activo
        if (this.isDashing) {
            this.dashTimer -= deltaTime;
            // Aplicamos velocidad de dash directo (la clase padre moverá con esto)
            this.velocityX = this.dashDirectionX * this.dashSpeed;
            if (this.dashTimer <= 0) {
                this.isDashing = false;
                this.velocityX = 0;
            }
        } else {
            // Solo intentar dash si estamos cerca y el cooldown terminó
            let dx = target.position.x - this.position.x;
            let distance = Math.abs(dx);
 
            if (distance < 250 && Date.now() - this.lastDashTime > this.dashCooldown) {
                this.performDash(dx);
            }
        }
 
        super.update(target, deltaTime);
    }
 
    performDash(dx) {
        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        this.lastDashTime = Date.now();
        // Guardamos la dirección, la velocidad se aplica en update()
        this.dashDirectionX = dx > 0 ? 1 : -1;
    }
 
    die() {
        super.die();
        console.log("¡Has derrotado a la Gran Serpiente!");
    }
}