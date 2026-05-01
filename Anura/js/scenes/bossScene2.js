/*
 * bossScene2.js
 * Eagle Boss arena: initialization, camera, rendering, HUD.
 * Final boss — reached after completing level 2.
 */
"use strict";

let eagleBoss          = null;
let eagleArenaBg       = new Image();
eagleArenaBg.src       = "../Anura/assets/predator_arena/predator_arena_background.png";

let eagleArenaWidth    = 0;
let eagleTargetCameraX = 0;
let eagleArenaLeft     = 30;
let eagleArenaRight    = 0;

// --- INITIALIZATION ---
async function initEagleBossLevel() {
    platforms = [];
    enemies   = [];
    eagleBoss = null;

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
                let platform = new Platform(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
                platform.setSprite("../Anura/assets/tileset/Tile_61.png");
                platforms.push(platform);
                
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
                const boss_name = "eagle_boss";
                let hp = 10, dmg = 10;

                try {
                    const values = await getBossValues(boss_name);
                    hp = values[0];
                    dmg = values[1];
                    
                } catch (e) {
                    console.warn("Using default stats for eagle_boss");
                }

                eagleBoss = new EagleBoss(posX, posY, 100, 100, "#8B6914", boss_name, 6, 400, hp, dmg, eagleMotion, EAGLE_STATE, false);
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

    
    console.log("drawBossScene2 running, frog:", !!frog, "eagleBoss:", !!eagleBoss);

    if (!deltaTime || isNaN(deltaTime) || deltaTime > 50) deltaTime = 16.6;

    //if (pause) return;

    // Clear canvas first — prevents black screen if background image hasn't loaded yet
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background — fallback dark color if image not loaded
    if (eagleArenaBg.complete && eagleArenaBg.naturalWidth !== 0) {
        ctx.drawImage(eagleArenaBg, 0, 0, canvasWidth, canvasHeight);
    } else {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // if VICTORY
    if (isVictory) {
        drawVictory();
        return;  // stop drawing the game
    }

    if (!isGameOver && !pause && frog) {

        // --- CAMERA LERP ---
        eagleTargetCameraX = frog.position.x - canvasWidth / 2;
        if (eagleTargetCameraX < 0)                             eagleTargetCameraX = 0;
        if (eagleTargetCameraX > eagleArenaWidth - canvasWidth) eagleTargetCameraX = eagleArenaWidth - canvasWidth;
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

            // Tongue collision — eagleBoss is not in the enemies array
            if (frog && frog.isAttacking) {
                const tongue = frog.getTongueCollider();
                if (tongue && boxOverlap(tongue, eagleBoss)) {
                    eagleBoss.takeDamage(frog.tongueDamage);
                    damageNumbers.push(new DamageNumber(
                        eagleBoss.position.x,
                        eagleBoss.position.y - eagleBoss.halfSize.y,
                        frog.tongueDamage
                    ));
                    applyTongueCardEffects(eagleBoss, [eagleBoss]);
                }
            }

            // Eagle defeated — show victory screen
            if (eagleBoss.health <= 0) {
                eagleBoss = null;
                isVictory = true; // activate state

            // implemented with AI help, 
            // calls saveProgress(true) to save victory state to database, AI helped identify that it was 
            // needed to pass 'true' ad a parameter to indicate victory (not death)
            // related to changes in app_anura.js /run/death ndpoint, playScene.js saveProgress() function
            
            saveProgress(true).then(response => {
                console.log("Victory saved:", response);
                sessionMosquitos = response.savedData.mosquitoes_total;
            });

            } else {
                eagleBoss.draw(ctx);
            }
        }

        frog.draw(ctx);

        ctx.restore();

        // Damage numbers (screen space, after restore)
        damageNumbers.forEach(dn => { dn.update(); dn.draw(ctx); });
        damageNumbers = damageNumbers.filter(dn => dn.alpha > 0);

        // HUD
        HealthBarDisplay();
        updateMosquitoHUD();
        if (typeof drawCardHUD === "function") drawCardHUD(deck);

    } else if (isGameOver) {
        drawGameOver();
    }

    // pause menu
    if (pause && !isGameOver) {
        drawPauseMenu();
    }

    // backButton();
}
