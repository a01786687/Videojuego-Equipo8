/*
cards.js
card definition and deck management
*/

"use strict";

// --- MOVEMENT CARD DEFINITIONS ---

let ironHindlegs = {
    name: "Iron Hindlegs",
    category: "Movement",
    effect: function() {
        frog.canDoubleJump = true;
        frog.hasDoubleJump = true;
        console.log("ironHindlegs activated, canDoubleJump:", frog.canDoubleJump);

    }
};

// --- DECK ---

let deck = {
    slot1_Movement: [],
    slot2_Combat: [],
    slot3_Utility: []

    
};

deck.slot1_Movement.push(ironHindlegs);
