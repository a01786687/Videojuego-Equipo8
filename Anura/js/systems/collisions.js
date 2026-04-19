/*
 * Frog-enemy collision detection.
 * Handles both enemies hurting the frog and the frog attacking enemies.
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */
"use strict";

// checkFrogEnemyCollisions() checks for collisions between enemies and frog
function checkFrogEnemyCollisions(deltaTime) {
    // Safety check to ensure frog exists before checking collisions
    if (!frog) return;

    // --- 1. FROG ATTACKING ENEMIES (Tongue Collision) ---
    // Get the dynamic bounding box of the tongue if attacking
    let tongueRect = frog.getTongueCollider();
    
    if (tongueRect) {
        enemies.forEach(enemy => {
            // check overlap to see if the tongue hit the enemy
            if (boxOverlap(tongueRect, enemy)) {
                // only hit if the enemy is not already stunned
                if (enemy.state !== ENEMY_STATE.STUNNED) {
                    // deal damage using the frog's modular tongueDamage property
                    enemy.takeDamage(frog.tongueDamage);
                    
                    // spawn damage number above enemy
                    damageNumbers.push(new DamageNumber(enemy.position.x, enemy.position.y - 30, frog.tongueDamage));
                    
                    // [FUTURE DB HOOK] apply status effect based on frog.tongueElement here
                }
            }
        });
    }

    // --- 2. ENEMIES HITTING THE FROG ---
    // We only check if enemies hurt the frog if the frog is NOT invincible AND not dashing
    if (frog.invincibilityTimer <= 0 && !frog.isDashing) {
        
        // loop through enemies
        enemies.forEach(enemy => { 
            // if the enemy state is stunned it doesn't deal damage so we skip it
            if(enemy.state === ENEMY_STATE.STUNNED) return; 

            // check overlap using boxOverlap() to see if the frog and enemy are touching
            if (boxOverlap(frog, enemy)) {
                if (enemy.damage > 0) { // only if the current enemy deals damage
                    currentHealth -= enemy.damage; 
                    
                    // FIX: Using frog.position.x and frog.position.y
                    damageNumbers.push(new DamageNumber(frog.position.x, frog.position.y - 30, enemy.damage));
                }
        
                // trigger the invincibility frames (the timer is handled inside frog.update)
                frog.invincibilityTimer = frog.invincibilityDuration; 
                console.log('Frog hit, Health: ', currentHealth);

                // UPDATE HEALTH HUD GOES HERE
                if (typeof updateHealthHUD === "function") {
                    updateHealthHUD();
                }

                if (currentHealth <= 0) {
                    currentHealth = 0; // avoids health errors like -5, -1, etc
                    gameOver();
                }
            }
        });
    }
}