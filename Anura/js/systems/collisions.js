/*
 * Frog-enemy collision detection.
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */
"use strict";

// checkFrogEnemyCollisions() checks for collisions between enemies and frog
function checkFrogEnemyCollisions(deltaTime) {
    if (frog.invincibilityTimer > 0) {
        frog.invincibilityTimer -= deltaTime;
        return; // if the timer is still runing, we exit the function, collisions aren't checked
    }

    // loop through enemies, when the frog is NOT invincible, normal state, each enemy must be checked
    enemies.forEach(enemy => { 
        // check enemy against the frog
        if(enemy.state === ENEMY_STATE.STUNNED) return; // if the enemy state is stunned it doesnt deal damage so we skip it

        // check overlap using boxOverlap() to see if the frog and enemy are touching
        if (boxOverlap(frog, enemy)){
            if (enemy.damage > 0){ // only if the current enemy deals damage
                currentHealth -= enemy.damage; // use the enemy damage value,
                damageNumbers.push(new DamageNumber(frog.x + frog.width / 2, frog.y, enemy.damage));
            }
    
            frog.invincibilityTimer = frog.invincibilityDuration; // the 1.5s timer starts
            console.log('Frog hit, Health: ', currentHealth)

            // UPDATE HEALTH HUD GOES HERE
            updateHealthHUD();

            if (currentHealth <= 0) {
                currentHealth = 0; // avoids health errors like -5, -1, etc
                gameOver();
            }

        }
    });
}