/*
cards.js
card definition and deck management
*/

"use strict";

let slot1FlashTimer = 0;
let slot2FlashTimer = 0;
let slot3FlashTimer = 0;

let lastBurnedSlot1 = null;
let lastBurnedSlot2 = null;
let lastBurnedSlot3 = null;

// --- CARD IMAGE OBJECT ---

const cardImages = {

    // MOVEMENT CARDS
    "Bubble Dash": "assets/cards/movementCards/bubble_dash.png",
    "Dragonfly Hop": "assets/cards/movementCards/dragonfly_hop.png",
    "Glide Membrane": "assets/cards/movementCards/glide_membrane.png",
    "Iron Hindlegs": "assets/cards/movementCards/iron_hindlegs.png",
    "Rocket Frog": "assets/cards/movementCards/rocket_frog.png",

    // COMBAT CARDS
    "Chamaleon Veil": "assets/cards/combatCards/chamaleon_veil.png",
    "Fire Kiss": "assets/cards/combatCards/fire_kiss.png",
    "Thunder Tongue": "assets/cards/combatCards/thunder_tongue.png",
    "Toad Shockwave": "assets/cards/combatCards/toad_shockwave.png",
    "Venom Lash": "assets/cards/combatCards/venom_lash.png",

    // UTILITY CARDS
    "Lucky Pond": "assets/cards/utilityCards/lucky_pond.png",
    "Metamorphosis": "assets/cards/utilityCards/metamorphosis.png",
    "Spiked Whip": "assets/cards/utilityCards/spiked_whip.png",
    "Tadpole Heart": "assets/cards/utilityCards/tadpole_heart.png",
    "Thorn Skin": "assets/cards/utilityCards/thorn_skin.png",
}

function getImageByName(name) {

    let path = cardImages[name];

    if(!path) {
        console.log("No image for:", name);
        return null;
    }

    let img = new Image();
    img.src = path;

    return img;

}
// --- MOVEMENT CARD DEFINITIONS ---

let ironHindlegs = {
    name: "Iron Hindlegs",
    category: "Movement",
    cost: 15,
    description: "Grants the frog a double jump.",
    effect: function() {
        frog.canDoubleJump = true;
        frog.hasDoubleJump = true;
    },

    reset: function() {
        frog.canDoubleJump = false
        frog.hasDoubleJump = false;
    },

    image: getImageByName("Iron Hindlegs")
};


let dragonflyHop = {
    name: "Dragonfly Hop",
    category: "Movement",
    cost: 10,
    description: "Grants the frog a double jump.",
    effect: function() {
        console.log("Dragonfly hop test card");
    }
};

let glideMembrane = {
    name: "Glide Membrane",
    category: "Movement",
    cost: 20,
    description: "Grants the frog a double jump.",
    effect: function() {
        console.log("Glide Membrane");
    }
};

let bubbleDash = {
    name: "Bubble Dash",
    category: "Movement",
    cost: 5,
    description: "Grants the frog a double jump.",
    effect: function() {
        console.log("Bubble Dash");
    }
};

let rocketFrog = {
    name: "Rocket Frog",
    category: "Movement",
    cost: 25,
    description: "Grants the frog a double jump.",
    effect: function() {
        console.log("Rocket Frog");
    }
};

ironHindlegs.image = getImageByName(ironHindlegs.name);
dragonflyHop.image = getImageByName(dragonflyHop.name);
glideMembrane.image = getImageByName(glideMembrane.name);
bubbleDash.image = getImageByName(bubbleDash.name);
rocketFrog.image = getImageByName(rocketFrog.name);



// --- DECK ---

let deck = {
    slot1_Movement: [],
    slot2_Combat: [],
    slot3_Utility: []

    
};

deck.slot1_Movement.push(ironHindlegs);
deck.slot1_Movement.push(dragonflyHop);
deck.slot1_Movement.push(glideMembrane);
deck.slot1_Movement.push(bubbleDash);
deck.slot1_Movement.push(rocketFrog);

// CARD POOL
let cardPool = [ironHindlegs, dragonflyHop, glideMembrane, bubbleDash, rocketFrog];





