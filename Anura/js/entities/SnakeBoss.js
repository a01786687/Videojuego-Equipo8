/* * SnakeBoss class - First Boss for Anura
 * Inherits from Enemy to reuse stun and health logic
 */
class SnakeBoss extends Enemy {
    constructor(x, y, range) {
        // Stats de jefe: Más vida (50) y daño (10)
        super(x, y, 120, 60, "green", "boss_snake", 8, range, 50, 10);
        
        this.phase = 1;
        this.dashSpeed = 4.5;
        this.isDashing = false;
        this.dashCooldown = 2000; // 2 segundos entre ataques especiales
        this.lastDashTime = 0;
    }

    // Sobrescribimos update para añadir las fases de jefe
    update(target, deltaTime) {
        // Si está aturdida, usamos la lógica de la clase padre
        if (this.state === ENEMY_STATE.STUNNED) {
            super.update(target, deltaTime);
            return;
        }

        // Cambio de fase según la vida
        if (this.health < 25 && this.phase === 1) {
            this.phase = 2;
            this.speed *= 1.2; // Se vuelve más errática
            console.log("Fase 2: ¡La serpiente está furiosa!");
        }

        // Lógica de ataque especial (Dash)
        let dx = target.position.x - this.position.x;
        let distance = Math.abs(dx);

        if (distance < 200 && Date.now() - this.lastDashTime > this.dashCooldown) {
            this.performDash(dx);
        }

        super.update(target, deltaTime);
    }

    performDash(dx) {
        this.isDashing = true;
        this.lastDashTime = Date.now();
        // Lógica para que se mueva rápido hacia el jugador
        this.position.x += (dx > 0 ? 1 : -1) * this.dashSpeed * 5;
        
        // Pequeño feedback visual o delay
        setTimeout(() => { this.isDashing = false; }, 500);
    }

    die() {
        super.die();
        console.log("¡Has derrotado a la Gran Serpiente!");
        // Aquí podrías disparar un evento para que Renata o Emilio 
        // guarden la estadística del jefe en la DB de MySQL
    }
}