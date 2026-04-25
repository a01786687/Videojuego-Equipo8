"use strict";
 
let snakeBoss = null; 
let predatorArenaBg = new Image(); 
predatorArenaBg.src = "../Anura/assets/predator_arena/predator_arena_background.png";
 
let arenaPixelWidth = 0;
let targetCameraX = 0; // cámara objetivo para interpolación suave
 
async function initBossLevel() {
    
    platforms = []; 
    enemies = [];
    snakeBoss = null;
    
    let rows = BOSS_ARENA_CHUNK.trim().split('\n');
    let yOffset = canvasHeight - (rows.length * TILE_SIZE);
    
    arenaPixelWidth = rows[0].length * TILE_SIZE; 
 
    for (let y = 0; y < rows.length; y++) {
        let row = rows[y];
        for (let x = 0; x < row.length; x++) {
            let char = row[x];
            let posX = x * TILE_SIZE;
            let posY = y * TILE_SIZE + yOffset;
 
            if (char === "#") {
                platforms.push(new Platform(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, TILE_SIZE, TILE_SIZE));
            } 
            else if (char === "@") {
                if (!frog) {
                    frog = new Frog({ x: posX + TILE_SIZE / 2, y: posY - 50 }, 50, 50, 4);
                } else {
                    frog.position.x = posX + TILE_SIZE / 2;
                    frog.position.y = posY - 80; 
                    // Limpiamos velocidad completamente para evitar el teletransporte
                    frog.velocityX = 0;
                    frog.velocityY = 0;
                    frog.isDashing = false;
                    frog.isAttacking = false;
                }
                // Sincronizamos la cámara con la posición inicial de la rana
                // para que no haya un salto brusco al entrar a la arena
                cameraX = Math.max(0, (posX + TILE_SIZE / 2) - canvasWidth / 2);
                targetCameraX = cameraX;
            }
            else if (char === "S") {
                const mob_name = "snake_boss";
                let hp = 50, dmg = 10; 
                try {
                    const values = await receiveMobData(mob_name); 
                    if (values && values.length >= 2) { hp = values[0]; dmg = values[1]; }
                } catch (e) { console.warn("Usando stats por defecto para el Boss"); }
                
                // Pasamos todos los parámetros que espera el constructor corregido
                snakeBoss = new SnakeBoss(posX, posY, 120, 60, "green", mob_name, 8, 300, hp, dmg);
            }
        }
    }
}
 
function drawBossScene1(deltaTime) {
 
    if (deltaTime === undefined || isNaN(deltaTime) || deltaTime > 50) {
        deltaTime = 16.6;
    }
 
    if (pause) return;
 
    ctx.drawImage(predatorArenaBg, 0, 0, canvasWidth, canvasHeight);
 
    if (!isGameOver && frog) {
        
        // Calculamos la cámara objetivo
        targetCameraX = frog.position.x - canvasWidth / 2;
 
        // Clamp dentro de los límites de la arena
        if (targetCameraX < 0) targetCameraX = 0;
        if (targetCameraX > arenaPixelWidth - canvasWidth) {
            targetCameraX = arenaPixelWidth - canvasWidth;
        }
 
        // Interpolación suave de la cámara (lerp) — elimina el jitter
        // Factor 0.12: más bajo = más suave pero más lento, 0.2 = más responsivo
        cameraX += (targetCameraX - cameraX) * 0.12;
 
        frog.update(deltaTime, keys, platforms, canvasHeight, cameraX);
        
        // Límites de la arena para la rana
        if (frog.position.x < 30) frog.position.x = 30;
        if (frog.position.x > arenaPixelWidth - 30) frog.position.x = arenaPixelWidth - 30;
 
        if (snakeBoss) {
            snakeBoss.update(frog, deltaTime);
            snakeBoss.draw(ctx);
        }
 
        platforms.forEach(plat => {
            if (typeof plat.draw === "function") plat.draw(ctx);
        });
 
        frog.draw(ctx);
 
        HealthBarDisplay();
        updateMosquitoHUD();
        if (typeof drawCardHUD === "function") drawCardHUD(deck); 
    } else if (isGameOver) {
        drawGameOver();
    }
    backButton();
}