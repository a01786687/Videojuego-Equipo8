/*
 * bossScene1.js
 * Snake Boss arena: initialization, camera, rendering, HUD.
 *
 */
"use strict";

let snakeBoss = null;

let predatorArenaBg = new Image();
predatorArenaBg.src = "../Anura/assets/predator_arena/predator_arena_background.png";

let arenaPixelWidth   = 0;
let bossTargetCameraX = 0;

// Fixed world-space walls — set once in initBossLevel, reused every frame
let arenaLeft  = 30;
let arenaRight = 0; // set after arenaPixelWidth is known

// --- INITIALIZATION ---
async function initBossLevel() {
    platforms = [];
    enemies   = [];
    snakeBoss = null;

    const rows    = BOSS_ARENA_CHUNK.trim().split("\n");
    const yOffset = canvasHeight - rows.length * TILE_SIZE;

    arenaPixelWidth = rows[0].length * TILE_SIZE;
    arenaLeft       = 30;
    arenaRight      = arenaPixelWidth - 30;

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

                cameraX           = Math.max(0, frog.position.x - canvasWidth / 2);
                bossTargetCameraX = cameraX;

            } else if (char === "S") {
                const mob_name = "snake_boss";
                let hp = 50, dmg = 10;

                try {
                    const values = await receiveMobData(mob_name);
                    if (values && values.length >= 2) { hp = values[0]; dmg = values[1]; }
                } catch (e) {
                    console.warn("Using default stats for snake_boss");
                }

                snakeBoss = new SnakeBoss(posX, posY, 120, 60, "green", mob_name, 8, 300, hp, dmg);
            }
        }
    }
}

// --- RENDERING ---
function drawBossScene1(deltaTime) {
    if (!deltaTime || isNaN(deltaTime) || deltaTime > 50) deltaTime = 16.6;

    if (pause) return;

    ctx.drawImage(predatorArenaBg, 0, 0, canvasWidth, canvasHeight);

    if (!isGameOver && frog) {

        // --- CAMERA LERP ---
        bossTargetCameraX = frog.position.x - canvasWidth / 2;
        if (bossTargetCameraX < 0)                             bossTargetCameraX = 0;
        if (bossTargetCameraX > arenaPixelWidth - canvasWidth) bossTargetCameraX = arenaPixelWidth - canvasWidth;
        cameraX += (bossTargetCameraX - cameraX) * 0.12;

        // FIX: pass fixed world bounds (arenaLeft / arenaRight), NOT cameraX.
        // cameraX moves every frame with lerp using it as a bound was pushing
        // the frog forward constantly, causing the x5 speed sensation.
        frog.update(deltaTime, keys, platforms, canvasHeight, cameraX, arenaLeft, arenaRight);

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

        // Boss update + draw (world space)
        if (snakeBoss) {
            snakeBoss.update(frog, deltaTime);

            // Check tongue attack against boss — snakeBoss is NOT in the enemies array
            // so checkFrogEnemyCollisions() in playScene never reaches it.
            // We handle it here directly instead.
            if (frog && frog.isAttacking) {
                const tongue = frog.getTongueCollider();
                if (tongue && boxOverlap(tongue, snakeBoss)) {
                    snakeBoss.takeDamage(frog.tongueDamage);
                    damageNumbers.push(new DamageNumber(
                        snakeBoss.position.x,
                        snakeBoss.position.y - snakeBoss.halfSize.y,
                        frog.tongueDamage
                    ));
                }
            }

            snakeBoss.draw(ctx);
        }

        // Frog draw (world space — camera transform handles screen offset)
        frog.draw(ctx);

        ctx.restore();

        // Draw damage numbers (screen space, after restore)
        damageNumbers.forEach(dn => { dn.update(); dn.draw(ctx); });
        damageNumbers = damageNumbers.filter(dn => dn.alpha > 0);

        // --- HUD (screen space, after restore) ---
        HealthBarDisplay();
        updateMosquitoHUD();
        if (typeof drawCardHUD === "function") drawCardHUD(deck);

    } else if (isGameOver) {
        drawGameOver();
    }

    backButton();
}