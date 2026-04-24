-- anura-seed.sql
-- Seed data for Anura database
-- Run after anura-schema.sql

USE anura;

-- TEST USERS (for local development only) REMOVE LATER
INSERT IGNORE INTO users (username, email, password) VALUES
('Renata', 'renata@mail.com', '1234'),
('Carlos', 'carlos@mail.com', '1234'),
('Emilio', 'emilio@mail.com', '1234');

-- TEST PLAYABLE CHARACTERS (one per user) REMOVE LATER
INSERT IGNORE INTO playable_character (pc_user_id, character_name, base_hp, base_speed, base_damage) VALUES
(1, 'Froggy_Renata', 100, 10, 15),
(2, 'Froggy_Carlos', 100, 10, 15),
(3, 'Froggy_Emilio', 100, 10, 15);

-- CARDS
INSERT IGNORE INTO cards (card_name, card_cost, card_type, effect_value, effect_parameter, card_description) VALUES

-- MOVEMENT CARDS
('Iron Hindlegs', 15, 'Movement', 1, 'extraJumps', 'Grants the frog a double jump.'),
('Dragonfly Hop', 10, 'Movement', 2, 'extraJumps', 'Replaces normal jump with three rapid micro jumps.'),
('Glide Membrane', 20, 'Movement', 1, 'canGlide', 'Allows the frog to glide through the air.'),
('Bubble Dash', 5, 'Movement', 1, 'canDash', 'A quick dash encased in a bubble.'),
('Rocket Frog', 25, 'Movement', 2, 'jumpForce', 'Launches the frog with rocket power.'),

-- COMBAT CARDS
('Chameleon Veil', 20, 'Combat', 1, 'isInvisible', 'Briefly turns the frog invisible.'),
('Fire Kiss', 15, 'Combat', 10, 'fireDamage', 'Coats the tongue in fire for extra damage.'),
('Thunder Tongue', 20, 'Combat', 15, 'thunderDamage', 'Electrifies the tongue attack.'),
('Toad Shockwave', 25, 'Combat', 20, 'shockwaveDamage', 'Releases a shockwave on landing.'),
('Venom Lash', 10, 'Combat', 5, 'venomDamage', 'Poisons enemies on hit.'),

-- UTILITY CARDS
('Lucky Pond', 10, 'Utility', 1, 'extraMosquitos', 'Chance to double mosquito drops.'),
('Metamorphosis', 25, 'Utility', 1, 'canMetamorph', 'Temporarily transforms the frog.'),
('Spiked Whip', 15, 'Utility', 5, 'whipDamage', 'Extends tongue range with spikes.'),
('Tadpole Heart', 20, 'Utility', 25, 'bonusHealth', 'Grants bonus health at run start.'),
('Thorn Skin', 15, 'Utility', 5, 'thornDamage', 'Reflects damage back to attackers.');

-- MOBS DATA

INSERT INTO mobs (mob_name,base_damage,base_hp,mosquito_reward)
VALUES ('mosquito',0,2,1),('spider',10,5,5);

-- VIEWS
CREATE OR REPLACE VIEW mosquitoesPerSessionView AS
SELECT run_session_id AS session_id, SUM(mosquitoes_collected) AS mosquitoesPerSession
FROM anura.runs
GROUP BY run_session_id;