# **Anura**

## _Game Design Document_

---

##### **Copyright notice / author information / boring legal stuff nobody likes**

##
## _Index_

---

1. [Index](#index)
2. [Game Design](#game-design)
    1. [Summary](#summary)
    2. [Gameplay](#gameplay)
    3. [Mindset](#mindset)
3. [Technical](#technical)
    1. [Screens](#screens)
    2. [Controls](#controls)
    3. [Mechanics](#mechanics)
4. [Level Design](#level-design)
    1. [Themes](#themes)
        1. Ambience
        2. Objects
            1. Ambient
            2. Interactive
        3. Challenges
    2. [Game Flow](#game-flow)
5. [Development](#development)
    1. [Abstract Classes](#abstract-classes--components)
    2. [Derived Classes](#derived-classes--component-compositions)
6. [Graphics](#graphics)
    1. [Style Attributes](#style-attributes)
    2. [Graphics Needed](#graphics-needed)
7. [Sounds/Music](#soundsmusic)
    1. [Style Attributes](#style-attributes-1)
    2. [Sounds Needed](#sounds-needed)
    3. [Music Needed](#music-needed)
8. [Schedule](#schedule)

## _Game Design_

---

### **Summary**

A small frog fights its way up the food chain in a 2D roguelite fighting game set in a swamp. Players collect mosquitoes, defeat increasingly larger animal bosses, and use power-up cards the frog eats to gain abilities and survive each run.

### **Gameplay**

What should the gameplay be like? What is the goal of the game, and what kind of obstacles are in the way? What tactics should the player use to overcome them?

The player controls a small frog moving through swamp areas filled with mosquitoes, obstacles, and boss encounters. Mosquitoes act as a currency and are collected using the frog's tongue while navigating platforming sections and preparing for fights.

Combat happens in 1v1 boss battles against animals higher in the food chain. Before each run, the player chooses a small set of power-up cards (3 cards to be exact), which the frog eats during combat to activate special abilities like speed boots, poison attacks, shields, or stronger jumps. Each boss has a unique attack pattern and weakness, encouraging players to experiment with different card combinations and strategies.

If the player dies, the run ends and the collected mosquitoes can be spent in the shop to unlock new cards or upgrades, making future runs stronger and allowing the player to progress in the game.


Roguelite Structure:

Anura follows a run-based progression system. Each run is self contained, and death resets the current attempt. However, collected mosquitoes function as persistent currency that can be spent in the shop to permanently unlock new cards.

This creates a classic roguelite loop:

- Attempt run
- Defeat bosses or die
- Earn currency
- Unlock stronger or more complex cards
- Start a new run with improved strategic options

### **Mindset**

What kind of mindset do you want to provoke in the player? Do you want them to feel powerful, or weak? Adventurous, or nervous? Hurried, or calm? How do you intend to provoke those emotions?

Anura is built around a strong emotional contrast between calmness and tension.

The main mindset can be summarized as:
“Small creature, big world, smart survival.”

At the beginning of each run, the player should feel vulnerable and cautious. The frog is small, visually cute and at a first glance quite fragile. When encountering the enemies they seem intimidating in size and presence to the player. This creates tension and a sense of danger.

Between boss encounters, platforming sections are designed to feel calm and cozy. The swamp environment is soft and atmospheric even though it still has some obstacles for the player. This peaceful exploration and obstacle course phase reinforces the feeling of safety.

However, this calm state is disrupted during boss fights and shifts the player's mentality from relaxed exploration and casual game to tension and alertness. 

As the player progresses, learns boss patterns, experiments with card combinations and purchases permanent upgrades, the mindset changes from trying to survive to dominating the game. 

The game aims to provoke:

- Strategic thinking (not just randomly smashing buttons)
- Tension during boss fights
- Experimentation through card combinations
- Satisfaction from defeating more dangerous bosses
- Resilience through the roguelite loop which would be "failure is progress"

Visually, the game supports this whole mindset through a blend of cute, cozy aesthetics and dangerous bosses. The intended emotional experience is for the player to think:

"I'm just a cute little frog in a peaceful swamp" right before facing a 1v1 boss fight that forces them to adapt and survive.



## _Technical_

---

### **Screens**

1. Title Screen

    The title screen sets the identity and tone of Anura

    Visually there's:
    The frog sitting peacefully on a lily pad
    Soft swamp ambience in the background
    The game title ANURA in big letters centered

    This screen transmits calmness and charm before the tension of the gameplay

    ![alt text](<Open Drawing 5.png>)

    1. Options
    
        Accessible from the Title screen
        Includes:
        
        New game

        Continue Run (if available)
        
        Settings: audio, volume, music on/off (NOTA: SIENTO QUE NO ES TAN ESENCIAL PARA PROPOSITOS DEL PROYECTO POR LO TANTO UNICAMENTE SE DESARROLLARÁ SI HAY TIEMPO SUFICIENTE)
        
        Quit

        

2. Level Select -> Run Prep Screen

    The player selects 3 cards before starting a run
    The player can review unlocked cards
    The player can see base stats like health, damage, speed

3. Game
    1. Inventory
    2. Assessment / Next Level
4. End Credits

_(example)_

### **Controls**

How will the player interact with the game? Will they be able to choose the controls? What kind of in-game events are they going to be able to trigger, and how? (e.g. pressing buttons, opening doors, etc.)

The player interacts with the game through direct character control in a 2D side environment. The controls are designed to be simple, supporting fast reactions during boss fights while remaining comfortable throughout the platform sections.

#### **Basic Movement Controls**

- Walk to the right -> D button
- Walk to the left -> A button
- Crouch -> S button
- Jump -> spacebar
- Double jump (if unlocked) -> Press jump (space button) again mid air

#### **Combat controls**
- Basic attack (tongue strike) -> left click button
- Activate card 1 -> #1 button 
- Activate card 2 -> #2 button
- Activate card 3 -> #3 button

Cards are activated manually during combat

#### **Interaction with the environment**
Players can trigger in game events such as:

- Collecting mosquitoes by hitting them with the tongue
- Entering boss arenas by walking through doors or caves
- Navigating obstacles by jumping, dodging or using abilities

#### **Menu and system controls**

- Pause menu -> esc

### **Mechanics**

Are there any interesting mechanics? If so, how are you going to accomplish them? Physics, algorithms, etc.

Anura combines platforming, 1v1 boss combat, and a strategic card activation system within a roguelite progression loop. 

The following are the core mechanics and how they function at a systems level.

1. Tongue collection and attack system
    
    The frog uses its tongue as both a collection and combat mechanic. (tongue = weapon)
    
    - Mosquitoes are collected then the tongue collider overlaps with their hitbox.

    La lengua tiene una caja invisible, el mosquito tiene otra caja invisible, las dos cajas se tocan, el mosquito desaparece y se incrementa el contador de monedas disponibles

    - The tongue acts as a short range directional attack, it will funcion as a fast meele hitbox in front of the frog.

    need: collision detection system for mosquito collection, hitbox activation during attack animation frames, cooldown timer to prevent spamming.

    La lengua hace daño en corto alcance hacia donde se este mirando, el ataque sera meele, es decir golpe corto, rapido, no viaja lejos

2. Card System

    Cards are activated by selecting them during combat

    Mechanically:

    - The player has a deck of 3 equipped cards:
        
        - Pressing the assigned key to the card slot triggers a shiny border around the selected card, each card has a cooldown, effecto modifier.

    Card activation logic

    Each card functions as an ability object with:

    - cooldown timer
    - effect value (damage, shield, speed modifier, etc)
    - activation condition
    - optional synergy interaction

    Cards are stored in a structured array representing the player's active build:


    playerDeck = [card1, card2, card3]

    When a key (1, 2, 3) is pressed:

    - the system checks if cooldown <= 0
    - if true -> applies the card effect
    - cooldown resets
    - visual feeback is triggered

    Strategic component
    
    Although the player only equips 3 cards per run, the full collection of unlocked cards creates build diversity. Different combinations lead to different playstyles (aggressive, defensive, sustain based, mobility focused)

    This limited deck size reinforces strategic pre run decision making, aligning with TCG design principles.

    NOTES:

    CARDS ARE OBJECTS WITH PROPERTIES
    
    THERE'S COOLDOWN

    POSSIBLE SINERGY

    Sinergy: synergistic deck is one where every card benefits from every other card 



3. Boss pattern system

    Boss behavior is driven by structured pattern based logic, implemented through *state management* in JavaScript.

    Each boss operates using a *Finite State Machine (FSM) model. This means the boss can only be in one state at a time, and it transitions between states based on predefined conditions such as timers, player distance or remaining health.

    Example boss states:

    - Idle - the boss waits or prepares an attack.
    - Attack - the boss performs a specific attack animation and activates its hitbox.
    - Recovery - a short vulnerability window afer attacking
    - Phase 2 - activated when health drops below a certain threshold (ex. 50% can vary)

    State transitions are controlled using conditional logic an timers. For example:

    - Afer a certain time in idle -> transition to attack
    - After Attack completes -> transition to recovery
    - When health is below or 50% -> activate phase 2 behavior

    This system ensures predictable but challenging encounters, reinforcing pattern recognition and startegic gameplay instead of complete randomness.

    Since the game is built using HTML and JS mechanics are implemented using:

    - Game loop logic (e.g., requestAnimationFrame)

    - Collision detection systems (hitboxes and bounding boxes)

    - State variables

    - Timers and cooldown counters

    - Health threshold checks

    ----------------------------------------------

    logica programada con estados

    necesitamos un sistema de estados (state machine), es decir pura logica con if, variables y temporizadores.

    un boss pattern system es:

    el boss tiene un estado actual ya sea idle, attacking, recovering, etc, y se cambia ese estado dependiendo del tiempo o la vida, se implementara de la siguiente forma:


## _Level Design_

#### Game Flow

**Run Flow**
1. Title Screen
2. Card Selection (Run Prep)
3. Platform Section
4. Boss Fight
5. Reward / Death
6. Shop (unlock cards)
7. New Run



---

_(Note : These sections can safely be skipped if they&#39;re not relevant, or you&#39;d rather go about it another way. For most games, at least one of them should be useful. But I&#39;ll understand if you don&#39;t want to use them. It&#39;ll only hurt my feelings a little bit.)_

### **Themes**



1. Swamp Surface (Initial Zone)
    1. Mood
        1. Calm, humid, cozy, slightly tense, natural and alive
    2. Objects
        1. _Ambient_
            1. Fireflies
            2. lily pads floating
            3. Swamp cane (reeds)
            4. Soft water reflections
            5. Tiny flying insects
            6. Swamp fauna

        2. _Interactive_
            1. Mosquitoes (coin)
            2. Shallow water pools
            3. Mud and moss platforms
            4. Floating logs
            4. boss arena entrance (possibly a cave)

2. Dense Swamp (mid game zone): this area reflects progression, the frog is no longer in a safe space, the environment starts to feel more hostile.

    1. Mood
        1. Darker, more enclosed, slightly oppressive, more dangerous, less visually open
    2. Objects
        1. _Ambient_
            1. Thick tree trunks
            2. Large exposed roots
            3. Light mist or fod
            4. Glowing mushrooms
            5. distant predator sounds
        2. _Interactive_
            1. Narrow platforms
            2. Thorny plants (Damage on contact)
            3. Deep water (slows movement)
            2. Unstable logs
            3. MAYBE MINOR ENEMIES (aggressive insects)


3. Predator Arena (boss zone)

    1. Mood
        1. Tense, focused, quiet before combat, isolated
    2. Objects
        1. _Ambient_
            1. broken vegetations
            2. bone fragments
            3. Darker water
            4. Heavy shadows
        2. _Interactive_
            1. Boss entity
            2. Arena boundaries (invisible walls or natural barriers)
            3. Terrain elements that influence movement (roots, shallow/deep patches)

         en el 3. roots -> serian como raices que sobresalen del suelo, pueden bloquear el paso, hacer que el jugador tenga que saltar, etc y las shallow deep patches son zonas de agua que reduzcan la velocidad, mas dificil esquivar ataques, etc
    
    Gameplay purpose
    - 1v1 confrontation
    - pattern recognition
    - card strategy execution
    - shift from calm to danger
    - smart survival

_(example)_

### **Game Flow**

**Run Flow**
1. Title screen
2. Hub (if player previously died)
3. Card selection (run prep)
4. Platform section 1
5. Boss 1
6. Platform section 2 (increased difficulty)
7. Boss 2
8. Platform Section 3 (increased difficulty)
9. Final Boss
10. Victory Screen

If the player dies at any point during the run:

- The run ends immediately
- The player respawns in the Hub
- The Shop becomes available
- The player may unlock new cards
- The player starts a new run

#### Level Structure

The game uses environmental teaching instead of explicit tutorials

Mechanics are introduced naturally:
- Early mosquito placement encourages tongue usage
- Small gaps teach jumping
- Moving platforms teach timing
- Boss teaches pattern recognition


#### Difficulty progression

Boss 1
- Simple attack pattern
- Clear visual signal before excecuting the attack
- Long recovery window

Boss 2 
- Faster attacks
- Shorter recovery window
- Requires better positioning

Boss 3
- Multiple phases
- Combined attack patterns
- Higher tension

Platform sections between bosses gradually increase in:

- Obstacle density
- Precision requirements
- Environmental hazards

The difficulty escalates without introducing entirely new mechanics late in the run. Instead it demands mastery of the existing systems.

#### Hub Structure (post death area)
The hub is a safe, calm area only accessible after death

It contains:
- Shop (permanent card unlocks)
- Card inventory view
- Option to start a new run


## _Development_

---

### **Abstract Classes / Components**

1. BasePhysics
    1. BasePlayer
    2. BaseEnemy
    3. BaseObject
2. BaseObstacle
3. BaseInteractable

_(example)_

### **Derived Classes / Component Compositions**

1. BasePlayer
    1. PlayerMain
    2. PlayerUnlockable
2. BaseEnemy
    1. EnemyWolf
    2. EnemyGoblin
    3. EnemyGuard (may drop key)
    4. EnemyGiantRat
    5. EnemyPrisoner
3. BaseObject
    1. ObjectRock (pick-up-able, throwable)
    2. ObjectChest (pick-up-able, throwable, spits gold coins with key)
    3. ObjectGoldCoin (cha-ching!)
    4. ObjectKey (pick-up-able, throwable)
4. BaseObstacle
    1. ObstacleWindow (destroyed with rock)
    2. ObstacleWall
    3. ObstacleGate (watches to see if certain buttons are pressed)
5. BaseInteractable
    1. InteractableButton

_(example)_

## _Graphics_

---

### **Style Attributes**

What kinds of colors will you be using? Do you have a limited palette to work with? A post-processed HSV map/image? Consistency is key for immersion.

What kind of graphic style are you going for? Cartoony? Pixel-y? Cute? How, specifically? Solid, thick outlines with flat hues? Non-black outlines with limited tints/shades? Emphasize smooth curvatures over sharp angles? Describe a set of general rules depicting your style here.

Well-designed feedback, both good (e.g. leveling up) and bad (e.g. being hit), are great for teaching the player how to play through trial and error, instead of scripting a lengthy tutorial. What kind of visual feedback are you going to use to let the player know they&#39;re interacting with something? That they \*can\* interact with something?

### **Graphics Needed**

1. Characters
    1. Human-like
        1. Goblin (idle, walking, throwing)
        2. Guard (idle, walking, stabbing)
        3. Prisoner (walking, running)
    2. Other
        1. Wolf (idle, walking, running)
        2. Giant Rat (idle, scurrying)
2. Blocks
    1. Dirt
    2. Dirt/Grass
    3. Stone Block
    4. Stone Bricks
    5. Tiled Floor
    6. Weathered Stone Block
    7. Weathered Stone Bricks
3. Ambient
    1. Tall Grass
    2. Rodent (idle, scurrying)
    3. Torch
    4. Armored Suit
    5. Chains (matching Weathered Stone Bricks)
    6. Blood stains (matching Weathered Stone Bricks)
4. Other
    1. Chest
    2. Door (matching Stone Bricks)
    3. Gate
    4. Button (matching Weathered Stone Bricks)

_(example)_


## _Sounds/Music_

---

### **Style Attributes**

Again, consistency is key. Define that consistency here. What kind of instruments do you want to use in your music? Any particular tempo, key? Influences, genre? Mood?

Stylistically, what kind of sound effects are you looking for? Do you want to exaggerate actions with lengthy, cartoony sounds (e.g. mario&#39;s jump), or use just enough to let the player know something happened (e.g. mega man&#39;s landing)? Going for realism? You can use the music style as a bit of a reference too.

 Remember, auditory feedback should stand out from the music and other sound effects so the player hears it well. Volume, panning, and frequency/pitch are all important aspects to consider in both music _and_ sounds - so plan accordingly!

### **Sounds Needed**

1. Effects
    1. Soft Footsteps (dirt floor)
    2. Sharper Footsteps (stone floor)
    3. Soft Landing (low vertical velocity)
    4. Hard Landing (high vertical velocity)
    5. Glass Breaking
    6. Chest Opening
    7. Door Opening
2. Feedback
    1. Relieved &quot;Ahhhh!&quot; (health)
    2. Shocked &quot;Ooomph!&quot; (attacked)
    3. Happy chime (extra life)
    4. Sad chime (died)

_(example)_

### **Music Needed**

1. Slow-paced, nerve-racking &quot;forest&quot; track
2. Exciting &quot;castle&quot; track
3. Creepy, slow &quot;dungeon&quot; track
4. Happy ending credits track
5. Rick Astley&#39;s hit #1 single &quot;Never Gonna Give You Up&quot;

_(example)_


## _Schedule_

---

_(define the main activities and the expected dates when they should be finished. This is only a reference, and can change as the project is developed)_

1. develop base classes
    1. base entity
        1. base player
        2. base enemy
        3. base block
  2. base app state
        1. game world
        2. menu world
2. develop player and basic block classes
    1. physics / collisions
3. find some smooth controls/physics
4. develop other derived classes
    1. blocks
        1. moving
        2. falling
        3. breaking
        4. cloud
    2. enemies
        1. soldier
        2. rat
        3. etc.
5. design levels
    1. introduce motion/jumping
    2. introduce throwing
    3. mind the pacing, let the player play between lessons
6. design sounds
7. design music

_(example)_
