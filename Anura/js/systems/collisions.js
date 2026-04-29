/*
 * Frog-enemy collision detection.
 * Handles both enemies hurting the frog and the frog attacking enemies.
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */
"use strict";

// applyTongueCardEffects() — applies all active combat card effects to a hit target.
// target: the enemy or boss that was hit
// targetList: array for bosses
function applyTongueCardEffects(target, targetList) {

    // --- FIRE KISS ---
    // Applies a burn DoT — first tick is immediate so the card feels responsive
    if (frog.fireKiss) {
        const burnDmg       = 2;
        target.burnTimer     = 2000; // 2 seconds of burn
        target.burnTickTimer = 1000; // next tick after 1 second
        target.burnDamage    = burnDmg;
        // first tick immediate
        target.health -= burnDmg;
        damageNumbers.push(new DamageNumber(target.position.x, target.position.y - 50, burnDmg));
        if (target.health <= 0) target.die();
    }

    // --- VENOM LASH ---
    // Apply a poison DoT — poisonDamage is set in cards.js effect()
    if (frog.poisonDuration > 0) {
        target.poisonTimer     = frog.poisonDuration;
        target.poisonTickTimer = 1000; // first tick after 1 second
    }

    // --- THUNDER TONGUE ---
    // Roll a chance to apply a longer stun on top of the normal one
    if (frog.thunderChance > 0 && Math.random() < frog.thunderChance) {
        target.state     = ENEMY_STATE.STUNNED;
        target.stunTimer = target.stunDuration * 3; // 3x normal stun
    }

    // --- TOAD SHOCKWAVE ---
    // Pushes the hit enemy directly away from the frog's facing direction
    if (frog.canShockwave) {
        const pushDir = frog.facing; // 1 = right, -1 = left
        target.position.x += pushDir * frog.shockwaveForce * 8;
        // brief stun so the push is visible before the enemy resumes chasing
        target.state     = ENEMY_STATE.STUNNED;
        target.stunTimer = 400;
    }

    // --- CHAMELEON VEIL ---
    // After a successful attack, the frog turns invisible for a short time
    if (frog.canChameleon && frog.chameleonTimer <= 0) {
        frog.chameleonTimer     = frog.chameleonDuration;
        frog.invincibilityTimer = frog.chameleonDuration;
    }
}

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
            const dmg = frog.poisonDamage;
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

                    // apply all active combat card effects to this enemy
                    // pass full enemies array so shockwave can push nearby ones too
                    applyTongueCardEffects(enemy, enemies);
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