/*
 * Platform class for creating tileable level structures used in level generation.
 * Authors: Renata Uruchurtu, Carlos Rosete, Emilio Torres
 */
"use strict";

const TILE_SIZE = 30; // size of the tiles for level design
let platforms = []; // Array to hold platform objects, to be implemented in the future for jumping and level design

// --- PLATFORM CLASS  ---

class Platform extends GameObject {
    constructor(x, y, width, height) {
        super(new Vector(x, y), width, height, "#4b3621", "platform");
        this.spriteRect = new Rect(0, 0, width, height);
    }
}

