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
 
    // --- POISON TICK (Venom Lash) ---
    // Runs every frame — decrements each poisoned enemy's timer and deals damage once per second
    enemies.forEach(enemy => {
        if (!enemy.poisonTimer || enemy.poisonTimer <= 0) return;
 
        enemy.poisonTimer -= deltaTime;
        enemy.poisonTickTimer = (enemy.poisonTickTimer || 0) - deltaTime;
 
        if (enemy.poisonTickTimer <= 0) {
            enemy.poisonTickTimer = 1000; // reset tick every 1000ms
            const dmg = frog.poisonDamage || 0;
            enemy.health -= dmg;
            damageNumbers.push(new DamageNumber(enemy.position.x, enemy.position.y - 30, dmg));
            if (enemy.health <= 0) enemy.die();
        }
    });
 
    // --- BURN TICK (Fire Kiss) ---
    // Same structure as poison — deals burn damage once per second for 2 seconds
    enemies.forEach(enemy => {
        if (!enemy.burnTimer || enemy.burnTimer <= 0) return;
 
        enemy.burnTimer -= deltaTime;
        enemy.burnTickTimer = (enemy.burnTickTimer || 0) - deltaTime;
 
        if (enemy.burnTickTimer <= 0) {
            enemy.burnTickTimer = 1000;
            const dmg = enemy.burnDamage || 0;
            enemy.health -= dmg;
            damageNumbers.push(new DamageNumber(enemy.position.x, enemy.position.y - 30, dmg));
            if (enemy.health <= 0) enemy.die();
        }
    });
 
    // --- 1. FROG ATTACKING ENEMIES (Tongue Collision) ---
    // Get the dynamic bounding box of the tongue if attacking
    let tongueRect = frog.getTongueCollider();
    
    if (tongueRect) {
        enemies.forEach(enemy => {
            // check overlap to see if the tongue hit the enemy
            if (boxOverlap(tongueRect, enemy)) {
                // only hit if the enemy is not already stunned
                if (enemy.state != ENEMY_STATE.STUNNED) {
                    // deal damage using the frog's modular tongueDamage property
                    enemy.takeDamage(frog.tongueDamage);
                    
                    // spawn damage number above enemy
                    damageNumbers.push(new DamageNumber(enemy.position.x, enemy.position.y - 30, frog.tongueDamage));
 
                    // --- FIRE KISS (tongueElement === "fire") ---
                    // Applies a burn DoT to the hit enemy — no splash, just the direct target
                    if (frog.tongueElement == "fire") {
                        enemy.burnTimer     = 2000; // 2 seconds of burn
                        enemy.burnTickTimer = 1000; // first tick after 1 second
                        enemy.burnDamage    = Math.floor(frog.tongueDamage * 0.3); // 30% per tick
                    }
 
                    // --- VENOM LASH (tongueElement === "poison") ---
                    // Apply a poison DoT to the hit enemy
                    if (frog.tongueElement == "poison" && frog.poisonDuration > 0) {
                        enemy.poisonTimer     = frog.poisonDuration;
                        enemy.poisonTickTimer = 1000; // first tick after 1 second
                    }
 
                    // --- THUNDER TONGUE (thunderChance > 0) ---
                    // Roll a chance to apply a longer stun on top of the normal one
                    if (frog.thunderChance > 0 && Math.random() < frog.thunderChance) {
                        enemy.state     = ENEMY_STATE.STUNNED;
                        enemy.stunTimer = enemy.stunDuration * 3; // 3x normal stun
                    }
 
                    // --- CHAMELEON VEIL (canChameleon) ---
                    // After a successful attack, the frog turns invisible for a short time
                    if (frog.canChameleon && frog.chameleonTimer <= 0) {
                        frog.chameleonTimer     = frog.chameleonDuration;
                        frog.invincibilityTimer = frog.chameleonDuration;
                    }
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
            if(enemy.state == ENEMY_STATE.STUNNED) return; 
 
            // check overlap using boxOverlap() to see if the frog and enemy are touching
            if (boxOverlap(frog, enemy)) {
                if (enemy.damage > 0) { // only if the current enemy deals damage
                    currentHealth -= enemy.damage; 
                    
                    damageNumbers.push(new DamageNumber(frog.position.x, frog.position.y - 30, enemy.damage));
                }
        
                // trigger the invincibility frames (the timer is handled inside frog.update)
                frog.invincibilityTimer = frog.invincibilityDuration; 
                console.log('Frog hit, Health: ', currentHealth);
 
                // --- TOAD SHOCKWAVE (canShockwave) ---
                // On taking damage, push all nearby enemies away from the frog
                if (frog.canShockwave) {
                    enemies.forEach(nearby => {
                        if (nearby.state == ENEMY_STATE.STUNNED) return;
                        const dx = nearby.position.x - frog.position.x;
                        const dy = nearby.position.y - frog.position.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist <= frog.shockwaveRadius && dist > 0) {
                            // push in the direction away from the frog, scaled by distance
                            const pushX = (dx / dist) * frog.shockwaveForce * 8;
                            nearby.position.x += pushX;
                            // brief stun so the push is visible before the enemy resumes chasing
                            nearby.state     = ENEMY_STATE.STUNNED;
                            nearby.stunTimer = 400;
                        }
                    });
                }
 
                // UPDATE HEALTH HUD GOES HERE
                if (typeof updateHealthHUD == "function") {
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