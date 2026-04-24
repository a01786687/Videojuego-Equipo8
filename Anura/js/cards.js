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
    "Chameleon Veil": "assets/cards/combatCards/chameleon_veil.png",
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

// --- FROG BASE VALUES
// copies the frog constructor defaults for every property a card can touch
// reset() uses these to know what value to restore the frog to
// if a default value in frog.js constructor it must be updated here too

const FROG_BASE_VALUES = {
    extraJumps:     0, // no extra jumps by default
    jumpsRemaining: 0, // no jumps remaining by default
    canGlide: false, // glide locked by default
    canDash: false, // dash locked by default
    jumpForce: -15, // must match frog.js constructor exactly
};


// --- CARD BASE ---
// this function takes a card from the database and turns it into a usable card object
// it makes the effect() and reset() functions automatically using the DB data
// so hardcode shouldn't happen for any card here
// to add a new card in the future, just add a new row to the database so not new code at all :D

function createCardFromDatabase(dbCard) {

    // param = the frog property that the card will change (e.g. canGlide, extraJumps, etc)
    // cardValue = the number stored in the database for this card
    const param = dbCard.effect_parameter;
    const cardValue = dbCard.effect_value;

    // db only stores numbers, but some frog properties are true/false values
    // FROG_BASE_VALUES is checked to see what type the property should be
    // true/false -> convert the DB number 1 to true
    // number -> keep it as a number

    const isBoolean   = param in FROG_BASE_VALUES && typeof FROG_BASE_VALUES[param] === "boolean";
    const effectValue = isBoolean ? Boolean(cardValue) : cardValue;

    // Rocket Frog is different, its DB value is a multiplier, not a direct value
    // effect_value: 2 means multiply the base jump force by 2
    const isMultiplier = (param === "jumpForce");

     return {
        card_id:          dbCard.card_id,
        name:             dbCard.card_name,
        category:         dbCard.card_type,
        cost:             dbCard.card_cost,
        description:      dbCard.card_description,
        effect_parameter: param,
        effect_value:     effectValue,
        image:            getImageByName(dbCard.card_name),

        // effect() runs when the player burns this card 
        effect() {
            if (isMultiplier) {
                // rocket frog -> multiply base jumpForce by 2 for example
                frog[param] = FROG_BASE_VALUES[param] * effectValue;

            } else {
                // all other cards directly set the frog property to true true false etc
                frog[param] = effectValue;

                // extra jumps needs jumpsRemaining updated asap so the player can use them without landing
                if (param === "extraJumps") frog.jumpsRemaining = effectValue;
            }
        },

        // reset() runs when the player burns a new card replacing this one or when the run ends
        reset() {
            frog[param] = FROG_BASE_VALUES[param];

            // if we reset extraJumps, also clear jumpsRemaining
            // so no leftover jumps stay after the card is gone
            if (param === "extraJumps") frog.jumpsRemaining = 0;

            // if we reset canDash also stop any dash happening right now
            // this prevents the frog from dashing forever if the card is replaced mid-dash
            if (param === "canDash") {
                frog.isDashing = false;
                frog.dashTimer = 0;
            }
        }
    }
}

// --- CLEAR ALL MOVEMENT EFFECTS ---
// this runs when the player dies or starts a new game
// it makes sure the frog goes back to its normal state with no card abilities active

function clearAllMovementEffects() {

    // first try to use the last burned card's own reset function
    if (lastBurnedSlot1 && lastBurnedSlot1.reset) {
        lastBurnedSlot1.reset();
    }
    lastBurnedSlot1 = null;

    // for safety issues, manually restore every frog property to its base value, handling cases like player dying before burning a card
    if (frog) {
        for (const [param, baseValue] of Object.entries(FROG_BASE_VALUES)) {
            frog[param] = baseValue;
        }
        // also reset the states that are not in FROG_BASE_VALUES
        frog.isDashing              = false;  // stop any active dash
        frog.dashTimer              = 0;      // clear dash timer
        frog.isGliding              = false;  // stop any active glide
        frog.extraJumpCooldownTimer = 0;      // clear jump cooldown
    }

    console.log("All movement effects cleared.");
}

// --- DECK ---

let deck = {
    slot1_Movement: [],
    slot2_Combat: [],
    slot3_Utility: []  
};

// --- CARD POOL ---
let cardPool = [
    createCardFromDatabase({ card_id: 1, card_name: "Iron Hindlegs",  card_type: "Movement", card_cost: 15, effect_value: 1, effect_parameter: "extraJumps", card_description: "Grants the frog a double jump." }),
    createCardFromDatabase({ card_id: 2, card_name: "Dragonfly Hop",  card_type: "Movement", card_cost: 10, effect_value: 2, effect_parameter: "extraJumps", card_description: "Replaces normal jump with three rapid micro jumps." }),
    createCardFromDatabase({ card_id: 3, card_name: "Glide Membrane", card_type: "Movement", card_cost: 20, effect_value: 1, effect_parameter: "canGlide",   card_description: "Allows the frog to glide through the air." }),
    createCardFromDatabase({ card_id: 4, card_name: "Bubble Dash",    card_type: "Movement", card_cost: 5,  effect_value: 1, effect_parameter: "canDash",    card_description: "A quick dash encased in a bubble." }),
    createCardFromDatabase({ card_id: 5, card_name: "Rocket Frog",    card_type: "Movement", card_cost: 25, effect_value: 1.5, effect_parameter: "jumpForce",  card_description: "Launches the frog with rocket power." }),
];

// loadDeck() will replace this when the API is connected
deck.slot1_Movement = [...cardPool];


