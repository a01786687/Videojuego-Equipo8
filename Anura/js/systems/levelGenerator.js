
/*
 * Procedural level generation using chunk stitching and tile-based object placement for platforms, enemies, and boss entrance.
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */
"use strict";

let caveEntrance = null; // stores the cave position, its null until createLevel() finds the ! tile
let exitDoor = null; // stores the exit door position for level 2, its null until createLevel2() finds the > tile

async function receiveMobData(mob_name){
    const res = await fetch(`http://localhost:8080/getMobData/${mob_name}`);
    const data = await res.json();

    if(data.length > 0){
        const attributes = await data[0];
    
        return [attributes.base_hp,attributes.base_damage];
    }
    
    return;
           
}

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

// Generates the level plan for level 2 (harder enemies, exit door at end)
function generateLevelPlan2() {
    let middleCount = 5;
    let sequence = [START_CHUNK_2];
 
    for (let i = 0; i < middleCount; i++) {
        let randomIndex = Math.floor(Math.random() * LEVEL_CHUNKS_2.length);
        sequence.push(LEVEL_CHUNKS_2[randomIndex]);
    }
 
    sequence.push(END_CHUNK_2);
 
    let cleanChunks = sequence.map(chunk => chunk.trim().split('\n'));
    let finalPlan = [];
    let height = cleanChunks[0].length;
 
    for (let i = 0; i < height; i++) {
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
        [...row].forEach(async (char, x) => {
            let posX = x * TILE_SIZE;
            let posY = y * TILE_SIZE + yOffset;

            if (char === "#") {
                // create a platform
                platforms.push(new Platform(posX + TILE_SIZE/2, posY + TILE_SIZE/2, TILE_SIZE, TILE_SIZE));
            } 
            else if (char === "@") {
                frog = new Frog(
                    { x: posX + TILE_SIZE / 2, y: posY - 25 }, // Centered position
                    60, // width
                    60, // height
                    4   // sheetCols (adjust based on your spritesheet)
                );  
            }
            else if (char === "$") {
                if(Math.random() < 0.75){
                    const mob_name = "mosquito";
                    const values = await receiveMobData(mob_name);
                    
                    console.log(values);
                    let enemy = new Enemy(posX, posY, 70, 70, "black", mob_name, 7, 100, values[0], values[1], mobsMotion);
                    enemies.push(enemy);
                    enemy.setSprite("./assets/enemies/finalMosqSprites.png", new Rect(0, 0, 613/7, 384/6));
                    enemy.setAnimation(14, 20, true, 100); 
                }
                else{
                    const mob_name = "spider"
                    const values = await receiveMobData(mob_name);
                    
                    console.log(values);
                    let enemy = new Enemy(posX, posY, 100, 100, "red", mob_name, 7, 100, values[0], values[1], mobsMotion);
                    enemies.push(enemy);
                    enemy.setSprite("./assets/enemies/finalSpiderSprites.png", new Rect(0, 0, 613/7, 384/6));
                    enemy.setAnimation(14, 20, true, 100); 
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

function createLevel2() {
    platforms    = [];
    enemies      = [];
    caveEntrance = null;
    exitDoor     = null;
 
    let fullPlan = generateLevelPlan2();
    let rows = fullPlan.split('\n');
    let yOffset = canvasHeight - (rows.length * TILE_SIZE);
 
    rows.forEach((row, y) => {
        [...row].forEach(async (char, x) => {
            let posX = x * TILE_SIZE;
            let posY = y * TILE_SIZE + yOffset;
 
            if (char === "#") {
                platforms.push(new Platform(posX + TILE_SIZE/2, posY + TILE_SIZE/2, TILE_SIZE, TILE_SIZE));
            }
            else if (char === "@") {
                // Reuse existing frog to keep cards and stats
                if (frog) {
                    frog.position.x = posX + TILE_SIZE / 2;
                    frog.position.y = posY - 25;
                    frog.velocityY  = 0;
                    frog.isDashing   = false;
                    frog.isAttacking = false;
                } else {
                    frog = new Frog({ x: posX + TILE_SIZE / 2, y: posY - 25 }, 50, 50, 4);
                }
            }
            else if (char === "%") {
                const mob_name = "spider";
                const values = await receiveMobData(mob_name);
                console.log(values);
                enemies.push(new Enemy(posX, posY, 60, 60, "red", mob_name, 4, 100, values[0], values[1]));
            }
            else if (char === ">") {
                // > = exit door — triggers transition to next level (or victory)
                exitDoor = {
                    position: { x: posX + TILE_SIZE / 2, y: posY + TILE_SIZE / 2 },
                    halfSize:  { x: TILE_SIZE, y: TILE_SIZE }
                };
            }
        });
    });
}