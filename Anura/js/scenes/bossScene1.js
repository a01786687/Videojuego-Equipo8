/*
 * bossScene1.js
 * Snake Boss arena: initialization, camera, rendering, HUD.
 *
 */
"use strict";

let snakeBoss = null;

let predatorArenaBg = new Image();
predatorArenaBg.src = "../Anura/assets/predator_arena/predator_arena_background.png";

// cave exit
let caveExitImg = new Image();
caveExitImg.src = "../Anura/assets/caveExit.png";

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
                cameraX           = frog.position.x - canvasWidth / 2;
                if (cameraX < 0) cameraX = 0;
                bossTargetCameraX = cameraX;

            } else if (char === "S") {
                const boss_name = "snake_boss";
                let hp = 10, dmg = 5;

                try {
                    const values = await getBossValues(boss_name);
                    hp = values[0];
                    dmg = values[1];

                } catch (e) {
                    console.warn("Using default stats for snake_boss");
                }

                snakeBoss = new SnakeBoss(posX, posY, 120, 60, "green", boss_name, 4, 300, hp, dmg, bossMotion, BOSS_STATE, 8, false);
                snakeBoss.setSprite("./assets/finalSnakeSprites.png", new Rect(0,0,192,73.14));
                snakeBoss.setAnimation(4,7,true,100);
            }
        }
    }
}

// --- RENDERING ---
function drawBossScene1(deltaTime) {
    if (!deltaTime || isNaN(deltaTime) || deltaTime > 50) deltaTime = 16.6;

    //if (pause) return;

    ctx.drawImage(predatorArenaBg, 0, 0, canvasWidth, canvasHeight);

    if (!isGameOver && !pause && frog) {

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

            // --- BOSS BURN TICK (Fire Kiss) ---
            if (snakeBoss.burnTimer > 0) {
                snakeBoss.burnTimer -= deltaTime;
                snakeBoss.burnTickTimer = (snakeBoss.burnTickTimer || 0) - deltaTime;
                if (snakeBoss.burnTickTimer <= 0) {
                    snakeBoss.burnTickTimer = 1000;
                    const dmg = snakeBoss.burnDamage || 0;
                    snakeBoss.health -= dmg;
                    damageNumbers.push(new DamageNumber(snakeBoss.position.x, snakeBoss.position.y - 50, dmg));
                }
            }

            // --- BOSS POISON TICK (Venom Lash) ---
            if (snakeBoss.poisonTimer > 0) {
                snakeBoss.poisonTimer -= deltaTime;
                snakeBoss.poisonTickTimer = (snakeBoss.poisonTickTimer || 0) - deltaTime;
                if (snakeBoss.poisonTickTimer <= 0) {
                    snakeBoss.poisonTickTimer = 1000;
                    const dmg = frog.poisonDamage || 0;
                    snakeBoss.health -= dmg;
                    damageNumbers.push(new DamageNumber(snakeBoss.position.x, snakeBoss.position.y - 30, dmg));
                }
            }

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
                    // Apply all active combat card effects to the boss
                    // pass [snakeBoss] as targetList so shockwave can push the boss too
                    applyTongueCardEffects(snakeBoss, [snakeBoss]);
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
            const size = 96;

            // draw exit door image
            ctx.drawImage(
                caveExitImg,
                bossExitDoor.position.x - size / 2,
                bossExitDoor.position.y - (size / 2) - 15,
                size,
                size
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

    // pause menu
    if (pause && !isGameOver) {
        drawPauseMenu();
    }

    // backButton();
}

async function getBossValues(boss_name){
    const res = await fetch(`http://localhost:8080/bossValues/${boss_name}`);
    const data = await res.json();

    if(data.length > 0){
        const attributes = await data[0];
    
        return [attributes.base_hp,attributes.base_damage,attributes.mosquito_reward];
    }
    
    return;
}




