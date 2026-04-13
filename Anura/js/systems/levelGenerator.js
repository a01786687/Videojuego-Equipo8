
/*
 * Procedural level generation using chunk stitching and tile-based object placement for platforms, enemies, and boss entrance.
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */
"use strict";

let caveEntrance = null; // stores the cave position, its null until createLevel() finds the ! tile

function generateLevelPlan() {
    // we could choose the number of middle chunks based on the current level, for now its set to 4 for testing
    let middleCount = 5;
    let sequence = [START_CHUNK]; // always start with the START_CHUNK

    // build the sequence of chunks: START + random middle chunks + END
    for (let i = 0; i < middleCount; i++) {
        let randomIndex = Math.floor(Math.random() * LEVEL_CHUNKS.length);
        sequence.push(LEVEL_CHUNKS[randomIndex]);
    }

    // final chunk is always the END_CHUNK
    sequence.push(END_CHUNK);

    // clean the chunks and split them into arrays of lines, so we can stitch them together horizontally
    let cleanChunks = sequence.map(chunk => chunk.trim().split('\n'));
    let finalPlan = [];
    let height = cleanChunks[0].length; // Debería ser 10 según tus nuevos niveles

    // stitch the chunks together horizontally, iterating line by line
    for (let i = 0; i < height; i++) {
        // Stitch the i-th line of each chunk together to form the full i-th line of the level
        let fullRow = cleanChunks.map(chunk => chunk[i]).join('');
        finalPlan.push(fullRow);
    }

    return finalPlan.join('\n');
}

// function for the objects
function createLevel() {
    platforms = []; // clean platforms array to avoid duplicates when creating a new level
    enemies = [];   // Clean enemies array to avoid duplicates when creating a new level
    caveEntrance = null; // reset on every new level

    let fullPlan = generateLevelPlan();
    let rows = fullPlan.split('\n');

    let yOffset = canvasHeight - (rows.length * TILE_SIZE);
    
    rows.forEach((row, y) => {
        [...row].forEach((char, x) => {
            let posX = x * TILE_SIZE;
            let posY = y * TILE_SIZE + yOffset;

            if (char === "#") {
                // create a platform
                platforms.push(new Platform(posX + TILE_SIZE/2, posY + TILE_SIZE/2, TILE_SIZE, TILE_SIZE));
            } 
            else if (char === "@") {
                frog.x = posX;
                // Ajust Y to place the frog on top of the tilteado, not inside it
                frog.y = posY - frog.height; 
    
                
                frog.position.x = frog.x + frog.width / 2;
                frog.position.y = frog.y + frog.height / 2;
            }
            else if (char === "$") {
                if(Math.random() < 0.75){
                    enemies.push(new Enemy(posX, posY, 40, 40, "black", "mosquito", 4, 100, 2, 0));
                }
                else{
                    enemies.push(new Enemy(posX, posY, 60, 60, "red", "spider", 4, 100, 5, 10));
                }
                    
            }
            else if (char === "!") {
                caveEntrance = {
                    position: { x: posX + TILE_SIZE / 2, y: posY + TILE_SIZE / 2 },
                    halfSize: { x: TILE_SIZE, y: TILE_SIZE }
                };
            }
        });
    });
}