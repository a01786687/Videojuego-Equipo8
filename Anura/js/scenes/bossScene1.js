/*
 * Boss fight scene .
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */

"use strict";

async function initBossLevel() {
    platforms = [];      // Limpiamos plataformas (usando tu variable global)
    enemies = [];        // Limpiamos enemigos
    snakeBoss = null;    // Reset del jefe

    // Usamos el chunk fijo del jefe en lugar de generar uno aleatorio
    let rows = BOSS_ARENA_CHUNK.trim().split('\n');
    let yOffset = canvasHeight - (rows.length * TILE_SIZE);

    // Recorremos el chunk igual que en tu generador procedural
    for (let y = 0; y < rows.length; y++) {
        let row = rows[y];
        for (let x = 0; x < row.length; x++) {
            let char = row[x];
            let posX = x * TILE_SIZE;
            let posY = y * TILE_SIZE + yOffset;

            if (char === "#") {
                // Crea plataforma usando tu clase Platform
                platforms.push(new Platform(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, TILE_SIZE, TILE_SIZE));
            } 
            else if (char === "@") {
                // TELETRANSPORTE: En lugar de "new Frog", movemos la existente
                if (frog) {
                    frog.position.x = posX + TILE_SIZE / 2;
                    frog.position.y = posY - 25;
                    frog.velocityX = 0;
                    frog.velocityY = 0;
                }
            }
            else if (char === "S") {
                // SPAWN DEL JEFE: Usamos los datos de la DB como haces con los mosquitos
                const mob_name = "snake_boss";
                const values = await receiveMobData(mob_name); 
                
                // Si la DB no tiene los datos aún, usamos valores por defecto (50 HP, 10 DMG)
                let hp = values ? values[0] : 50;
                let dmg = values ? values[1] : 10;
                
                snakeBoss = new SnakeBoss(posX, posY, 40, 40, "green", mob_name, 8, 300, hp, dmg);
            }
        }
    }
}

function drawBossScene1(deltaTime) {
    if (pause) return;


    if (!isGameOver) {
        // CÁMARA FIJA: Forzamos cameraX a 0
        let currentCameraX = 0; 

        // Actualizar y limitar a la rana
        if (frog) {
            frog.update(deltaTime, keys, bossPlatforms, canvasHeight, currentCameraX);
            // Bordes de pantalla para que no se salga de la arena
            if (frog.position.x < 30) frog.position.x = 30;
            if (frog.position.x > canvasWidth - 30) frog.position.x = canvasWidth - 30;
        }

        // Dibujar Jefe
        if (snakeBoss) {
            snakeBoss.update(frog, deltaTime);
            snakeBoss.draw(ctx);
        }

        // Dibujar Plataformas de la Arena
        ctx.fillStyle = "rgba(0,0,0,0)"; // O el color que prefieras para depurar
        bossPlatforms.forEach(plat => {
            ctx.fillRect(
                plat.position.x - plat.halfSize.x, 
                plat.position.y - plat.halfSize.y, 
                plat.size.x, 
                plat.size.y
            );
        });

        if (frog) frog.draw(ctx);

        // UI
        HealthBarDisplay();
        updateMosquitoHUD();
    } else {
        drawGameOver();
    }
    backButton();
}