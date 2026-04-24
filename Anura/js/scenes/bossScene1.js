/*
 * Boss fight scene .
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */

"use strict";

async function initBossLevel() {
    platforms = [];      // Usando el arreglo global de plataformas
    enemies = [];        // Limpiamos enemigos
    snakeBoss = null;    // Reset del jefe

    let rows = BOSS_ARENA_CHUNK.trim().split('\n');
    let yOffset = canvasHeight - (rows.length * TILE_SIZE);

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
                if (frog) {
                    frog.position.x = posX + TILE_SIZE / 2;
                    frog.position.y = posY - 25;
                    frog.velocityX = 0;
                    frog.velocityY = 0;
                }
            }
            else if (char === "S") {
                const mob_name = "snake_boss";
                const values = await receiveMobData(mob_name); 
                
                let hp = values ? values[0] : 50;
                let dmg = values ? values[1] : 10;
                
                snakeBoss = new SnakeBoss(posX, posY, 40, 40, "green", mob_name, 8, 300, hp, dmg);
            }
        }
    }
}

function drawBossScene1(deltaTime) {
    if (pause) return;

    // IMPORTANTE: Si quieres que el fondo se limpie o tenga una imagen, 
    // debes dibujarlo aquí. Si no, se verá un rastro negro.
    // ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // ctx.drawImage(predatorArenaBg, 0, 0, canvasWidth, canvasHeight);

    if (!isGameOver) {
        let currentCameraX = 0; 

        if (frog) {
            // CORRECCIÓN 1: Pasar 'platforms' en lugar de 'bossPlatforms'
            frog.update(deltaTime, keys, platforms, canvasHeight, currentCameraX);
            
            if (frog.position.x < 30) frog.position.x = 30;
            if (frog.position.x > canvasWidth - 30) frog.position.x = canvasWidth - 30;
        }

        if (snakeBoss) {
            snakeBoss.update(frog, deltaTime);
            snakeBoss.draw(ctx);
        }

        // CORRECCIÓN 2: Dibujar usando el arreglo 'platforms'
        // Como usas tu clase Platform, es probable que tenga su propio método draw()
        platforms.forEach(plat => {
            if (typeof plat.draw === "function") {
                plat.draw(ctx); // Usa esto si tu clase Platform ya sabe dibujarse
            } else {
                ctx.fillStyle = "rgba(0,0,0,0)"; 
                ctx.fillRect(
                    plat.position.x - plat.halfSize.x, 
                    plat.position.y - plat.halfSize.y, 
                    plat.size.x, 
                    plat.size.y
                );
            }
        });

        if (frog) frog.draw(ctx);

        // UI
        HealthBarDisplay();
        updateMosquitoHUD();
        
        // CORRECCIÓN 3: Llamar al dibujo de tu mazo
        if (typeof drawCardHUD === "function") {
            drawCardHUD(deck);
        }
        
    } else {
        drawGameOver();
    }
    backButton();
}