/*
 * bossScene2.js
 * Eagle Boss arena: initialization, camera, rendering, HUD.
 * Final boss — reached after completing level 2.
 *
 * KEY DIFFERENCES vs bossScene1.js:
 *   - Eagle flies freely (no ground — no platform collision needed for boss)
 *   - Camera follows frog normally inside eagle arena bounds
 *   - Victory screen shown when eagle is defeated instead of exit door
 */
"use strict";

let eagleBoss        = null;
let eagleArenaBg     = new Image();
eagleArenaBg.src     = "../Anura/assets/predator_arena/predator_arena_background.png";

let eagleArenaWidth   = 0;
let eagleTargetCameraX = 0;
let eagleArenaLeft    = 30;
let eagleArenaRight   = 0;

// --- INITIALIZATION ---
async function initEagleBossLevel() {
    platforms   = [];
    enemies     = [];
    eagleBoss   = null;

    const rows    = EAGLE_ARENA_CHUNK.trim().split("\n");
    const yOffset = canvasHeight - rows.length * TILE_SIZE;

    eagleArenaWidth = rows[0].length * TILE_SIZE;
    eagleArenaLeft  = 30;
    eagleArenaRight = eagleArenaWidth - 30;

    for (let y = 0; y < rows.length; y++) {
        const row = rows[y];

        for (let x = 0; x < row.length; x++) {
            const char = row[x];
            const posX = x * TILE_SIZE;
            const posY = y * TILE_SIZE + yOffset;

            if (char === "#") {
                platforms.push(new Platform(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, TILE_SIZE, TILE_SIZE));

            } else if (char === "@") {
                if (!frog) {
                    frog = new Frog({ x: posX + TILE_SIZE / 2, y: posY - 50 }, 50, 50, 4);
                } else {
                    frog.position.x  = posX + TILE_SIZE / 2;
                    frog.position.y  = posY - 80;
                    frog.velocityY   = 0;
                    frog.isDashing   = false;
                    frog.isAttacking = false;
                    frog.dashTimer   = 0;
                }

                // Pre-sync camera to avoid a jump on the first frame
                cameraX = frog.position.x - canvasWidth / 2;
                if (cameraX < 0) cameraX = 0;
                eagleTargetCameraX = cameraX;

            } else if (char === "E") {
                const mob_name = "eagle_boss";
                let hp = 80, dmg = 15;

                try {
                    const values = await receiveMobData(mob_name);
                    if (values && values.length >= 2) { hp = values[0]; dmg = values[1]; }
                } catch (e) {
                    console.warn("Using default stats for eagle_boss");
                }

                // Pass eagleMotion and EAGLE_STATE — same pattern as Enemy in levelGenerator.js
                eagleBoss = new EagleBoss(posX, posY, 100, 100, "#8B6914", mob_name, 6, 400, hp, dmg, eagleMotion, EAGLE_STATE);
                eagleBoss.setSprite(
                    "../Anura/assets/enemies/eagleBoss.png",
                    new Rect(0, 0, 448, 479)
                );
                eagleBoss.sheetCols = 4;
                eagleBoss.setAnim(EAGLE_STATE.HOVER);
            }
        }
    }
}

// --- RENDERING ---
function drawBossScene2(deltaTime) {
    if (!deltaTime || isNaN(deltaTime) || deltaTime > 50) deltaTime = 16.6;

    if (pause) return;

    ctx.drawImage(eagleArenaBg, 0, 0, canvasWidth, canvasHeight);

    if (!isGameOver && frog) {

        // --- CAMERA LERP ---
        eagleTargetCameraX = frog.position.x - canvasWidth / 2;
        if (eagleTargetCameraX < 0)                              eagleTargetCameraX = 0;
        if (eagleTargetCameraX > eagleArenaWidth - canvasWidth)  eagleTargetCameraX = eagleArenaWidth - canvasWidth;
        cameraX += (eagleTargetCameraX - cameraX) * 0.12;

        frog.update(deltaTime, keys, platforms, canvasHeight, cameraX, eagleArenaLeft, eagleArenaRight);

        // --- WORLD-SPACE RENDERING ---
        ctx.save();
        ctx.translate(-cameraX, 0);

        // Platforms
        platforms.forEach(plat => {
            if (typeof plat.draw === "function") {
                plat.draw(ctx);
            } else {
                ctx.fillStyle = "#4b3621";
                ctx.fillRect(
                    plat.position.x - plat.halfSize.x,
                    plat.position.y - plat.halfSize.y,
                    plat.size.x,
                    plat.size.y
                );
            }
        });

        // Eagle boss update + draw
        if (eagleBoss) {
            eagleBoss.update(frog, deltaTime);

            // --- EAGLE BURN TICK (Fire Kiss) ---
            if (eagleBoss.burnTimer > 0) {
                eagleBoss.burnTimer -= deltaTime;
                eagleBoss.burnTickTimer = (eagleBoss.burnTickTimer || 0) - deltaTime;
                if (eagleBoss.burnTickTimer <= 0) {
                    eagleBoss.burnTickTimer = 1000;
                    const dmg = eagleBoss.burnDamage || 0;
                    eagleBoss.health -= dmg;
                    damageNumbers.push(new DamageNumber(eagleBoss.position.x, eagleBoss.position.y - 50, dmg));
                }
            }

            // --- EAGLE POISON TICK (Venom Lash) ---
            if (eagleBoss.poisonTimer > 0) {
                eagleBoss.poisonTimer -= deltaTime;
                eagleBoss.poisonTickTimer = (eagleBoss.poisonTickTimer || 0) - deltaTime;
                if (eagleBoss.poisonTickTimer <= 0) {
                    eagleBoss.poisonTickTimer = 1000;
                    const dmg = frog.poisonDamage || 0;
                    eagleBoss.health -= dmg;
                    damageNumbers.push(new DamageNumber(eagleBoss.position.x, eagleBoss.position.y - 30, dmg));
                }
            }

            // Tongue collision — eagleBoss is not in enemies array
            if (frog && frog.isAttacking) {
                const tongue = frog.getTongueCollider();
                if (tongue && boxOverlap(tongue, eagleBoss)) {
                    eagleBoss.takeDamage(frog.tongueDamage);
                    damageNumbers.push(new DamageNumber(
                        eagleBoss.position.x,
                        eagleBoss.position.y - eagleBoss.halfSize.y,
                        frog.tongueDamage
                    ));
                    // Apply combat card effects to the eagle
                    applyTongueCardEffects(eagleBoss, [eagleBoss]);
                }
            }

            // Eagle defeated — show victory screen
            if (eagleBoss.health <= 0) {
                eagleBoss = null;
                drawVictory();
                return;
            } else {
                eagleBoss.draw(ctx);
            }
        }

        frog.draw(ctx);

        ctx.restore();

        // Damage numbers (screen space)
        damageNumbers.forEach(dn => { dn.update(); dn.draw(ctx); });
        damageNumbers = damageNumbers.filter(dn => dn.alpha > 0);

        // --- HUD ---
        HealthBarDisplay();
        updateMosquitoHUD();
        if (typeof drawCardHUD === "function") drawCardHUD(deck);

    } else if (isGameOver) {
        drawGameOver();
    }

    backButton();
}

// --- VICTORY SCREEN ---
function drawVictory() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "#FFD700";
    ctx.font      = "60px Pixelify Sans";
    ctx.textAlign = "center";
    ctx.fillText("YOU WIN!", canvasWidth / 2, canvasHeight / 2 - 40);

    ctx.fillStyle = "#ffffff";
    ctx.font      = "24px Pixelify Sans";
    ctx.fillText("The Eagle has fallen.", canvasWidth / 2, canvasHeight / 2 + 20);
    ctx.fillText("Mosquitos collected: " + runMosquitos, canvasWidth / 2, canvasHeight / 2 + 55);

    // Auto return to title after 4 seconds
    if (!drawVictory.timer) {
        drawVictory.timer = setTimeout(() => {
            drawVictory.timer = null;
            currentScene = "title";
        }, 4000);
    }
}

// --- RENDERING ---
function drawBossScene2(deltaTime) {
    if (!deltaTime || isNaN(deltaTime) || deltaTime > 50) deltaTime = 16.6;

    if (pause) return;

    ctx.drawImage(eagleArenaBg, 0, 0, canvasWidth, canvasHeight);

    if (!isGameOver && frog) {

        // --- CAMERA LERP ---
        eagleTargetCameraX = frog.position.x - canvasWidth / 2;
        if (eagleTargetCameraX < 0)                              eagleTargetCameraX = 0;
        if (eagleTargetCameraX > eagleArenaWidth - canvasWidth)  eagleTargetCameraX = eagleArenaWidth - canvasWidth;
        cameraX += (eagleTargetCameraX - cameraX) * 0.12;

        frog.update(deltaTime, keys, platforms, canvasHeight, cameraX, eagleArenaLeft, eagleArenaRight);

        // --- WORLD-SPACE RENDERING ---
        ctx.save();
        ctx.translate(-cameraX, 0);

        // Platforms
        platforms.forEach(plat => {
            if (typeof plat.draw === "function") {
                plat.draw(ctx);
            } else {
                ctx.fillStyle = "#4b3621";
                ctx.fillRect(
                    plat.position.x - plat.halfSize.x,
                    plat.position.y - plat.halfSize.y,
                    plat.size.x,
                    plat.size.y
                );
            }
        });

        // Eagle boss update + draw
        if (eagleBoss) {
            eagleBoss.update(frog, deltaTime);

            // --- EAGLE BURN TICK (Fire Kiss) ---
            if (eagleBoss.burnTimer > 0) {
                eagleBoss.burnTimer -= deltaTime;
                eagleBoss.burnTickTimer = (eagleBoss.burnTickTimer || 0) - deltaTime;
                if (eagleBoss.burnTickTimer <= 0) {
                    eagleBoss.burnTickTimer = 1000;
                    const dmg = eagleBoss.burnDamage || 0;
                    eagleBoss.health -= dmg;
                    damageNumbers.push(new DamageNumber(eagleBoss.position.x, eagleBoss.position.y - 50, dmg));
                }
            }

            // --- EAGLE POISON TICK (Venom Lash) ---
            if (eagleBoss.poisonTimer > 0) {
                eagleBoss.poisonTimer -= deltaTime;
                eagleBoss.poisonTickTimer = (eagleBoss.poisonTickTimer || 0) - deltaTime;
                if (eagleBoss.poisonTickTimer <= 0) {
                    eagleBoss.poisonTickTimer = 1000;
                    const dmg = frog.poisonDamage || 0;
                    eagleBoss.health -= dmg;
                    damageNumbers.push(new DamageNumber(eagleBoss.position.x, eagleBoss.position.y - 30, dmg));
                }
            }

            // Tongue collision — eagleBoss is not in enemies array
            if (frog && frog.isAttacking) {
                const tongue = frog.getTongueCollider();
                if (tongue && boxOverlap(tongue, eagleBoss)) {
                    eagleBoss.takeDamage(frog.tongueDamage);
                    damageNumbers.push(new DamageNumber(
                        eagleBoss.position.x,
                        eagleBoss.position.y - eagleBoss.halfSize.y,
                        frog.tongueDamage
                    ));
                    // Apply combat card effects to the eagle
                    applyTongueCardEffects(eagleBoss, [eagleBoss]);
                }
            }

            // Eagle defeated — show victory screen
            if (eagleBoss.health <= 0) {
                eagleBoss = null;
                drawVictory();
                return;
            } else {
                eagleBoss.draw(ctx);
            }
        }

        frog.draw(ctx);

        ctx.restore();

        // Damage numbers (screen space)
        damageNumbers.forEach(dn => { dn.update(); dn.draw(ctx); });
        damageNumbers = damageNumbers.filter(dn => dn.alpha > 0);

        // --- HUD ---
        HealthBarDisplay();
        updateMosquitoHUD();
        if (typeof drawCardHUD === "function") drawCardHUD(deck);

    } else if (isGameOver) {
        drawGameOver();
    }

    backButton();
}
