/*
 * bossScene1.js
 * Snake Boss arena: initialization, camera, rendering, HUD.
 *
 * FROG SPEED FIX:
 *   frog.update() receives worldBoundsLeft and worldBoundsRight as fixed arena
 *   walls (30 and arenaPixelWidth-30). The old code was passing cameraX as the
 *   left bound — since cameraX moves every frame with lerp, the frog was being
 *   pushed forward constantly, making it feel like x5 speed.
 *
 * CAMERA:
 *   Uses lerp (factor 0.12) clamped to arena bounds.
 *   bossTargetCameraX is kept separate from the play-scene camera.
 *
 * DRAW ORDER:
 *   ctx.save() → ctx.translate(-cameraX, 0) → draw world objects → ctx.restore()
 *   HUD is drawn after restore() so it stays in screen space.
 */
"use strict";

let snakeBoss = null;

let predatorArenaBg = new Image();
predatorArenaBg.src = "../Anura/assets/predator_arena/predator_arena_background.png";

let arenaPixelWidth   = 0;
let bossTargetCameraX = 0;
let bossExitDoor      = null; // spawns after boss is defeated, leads to level 2

// Fixed world-space walls — set once in initBossLevel, reused every frame
let arenaLeft  = 30;
let arenaRight = 0; // set after arenaPixelWidth is known

// --- INITIALIZATION ---
async function initBossLevel() {
    platforms    = [];
    enemies      = [];
    snakeBoss    = null;
    bossExitDoor = null;

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

                // Pre-sync camera to avoid a jump on the first frame
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
        // cameraX moves every frame with lerp — using it as a bound was pushing
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

            // Tongue collision — snakeBoss is not in the enemies array so
            // checkFrogEnemyCollisions() never reaches it; we check here instead
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

            // Boss defeated — remove it and spawn the exit door
            if (snakeBoss.health <= 0) {
                snakeBoss = null;
                if (!bossExitDoor) {
                    bossExitDoor = {
                        position: { x: arenaPixelWidth / 2, y: canvasHeight - TILE_SIZE * 2 },
                        halfSize:  { x: TILE_SIZE, y: TILE_SIZE }
                    };
                }
            } else {
                snakeBoss.draw(ctx);
            }
        }

        // Draw exit door and handle level 2 transition
        if (bossExitDoor) {
            ctx.fillStyle = "#00cc44";
            ctx.fillRect(
                bossExitDoor.position.x - bossExitDoor.halfSize.x,
                bossExitDoor.position.y - bossExitDoor.halfSize.y,
                bossExitDoor.halfSize.x * 2,
                bossExitDoor.halfSize.y * 2
            );
            ctx.fillStyle = "#ffffff";
            ctx.font = "10px Pixelify Sans";
            ctx.textAlign = "center";
            ctx.fillText("EXIT", bossExitDoor.position.x, bossExitDoor.position.y + 4);

            // Frog touches exit → load level 2
            if (frog && boxOverlap(frog, bossExitDoor)) {
                bossExitDoor    = null;
                lastActiveScene = "play";
                currentLevel    = 2;
                cameraX         = 0;
                createLevel2();
                // createLevel2 uses async enemy fetches inside forEach,
                // a short delay ensures platforms are built before rendering
                setTimeout(() => { currentScene = "play"; }, 200);
            }
        }

        // Frog draw (world space — camera transform handles screen offset)
        frog.draw(ctx);

        ctx.restore();

        // Damage numbers (screen space)
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