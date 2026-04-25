-- anura-seed.sql
-- Seed data for Anura database
-- Run after anura-schema.sql

DROP SCHEMA IF EXISTS anura;
CREATE SCHEMA anura;
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
('Rocket Frog', 25, 'Movement', 1.5, 'jumpForce', 'Launches the frog with rocket power.'),

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

-- use UPDATES to make game rogue-like:
UPDATE anura.mobs SET base_damage = 17 -- make mosquitoes have damage
WHERE mob_name = 'spider';

UPDATE mobs SET base_damage = 3 -- make spiders stronger
WHERE mob_name = 'mosquito';

UPDATE mobs SET base_hp = 7
WHERE mob_name = 'spider';

-- VIEWS
CREATE OR REPLACE VIEW mosquitoesPerSessionView AS
SELECT run_session_id AS session_id, SUM(mosquitoes_collected) AS mosquitoesPerSession
FROM anura.runs
GROUP BY run_session_id;

-- deckBySession: returns the full deck of cards for a session_id
-- it is used by GET /deck/session_id to load the player's saved deck when the run starts

CREATE OR REPLACE VIEW deckBySession AS
SELECT S.session_id, -- S (sessions table), C (cards table)
       C.card_id, 
       C.card_name, 
       C.card_type, 
       C.card_cost, 
       C.effect_parameter, 
       C.effect_value, 
       C.card_description
FROM anura.sessions AS S -- start from S (sessions table) 
INNER JOIN anura.playable_character AS PC on PC.pc_user_id = S.session_user_id -- Connect sessions to playable_character, to find the character that belongs to this session's user
INNER JOIN anura.character_deck AS CD ON CD.cd_character_id = PC.character_id -- Connect playable_character to character_deck, to find all cards saved for that character
INNER JOIN anura.cards AS C ON C.card_id = CD.cd_card_id; -- Get the full card details for each saved card

CREATE OR REPLACE VIEW sampleView as
SELECT X.run_session_id AS session_id, COUNT(X.run_id) as totalRunPerSession
FROM anura.runs AS X
GROUP BY run_session_id;

CREATE OR REPLACE VIEW runsPerUser as
SELECT X.session_user_id, Y.username, SUM(Z.totalRunPerSession)
FROM anura.sessions AS X INNER JOIN anura.sampleView AS Z
USING (session_id)
INNER JOIN anura.users AS Y
ON session_user_id = user_id
GROUP BY (user_id);

CREATE OR REPLACE VIEW timeToKillBoss as 
SELECT X.boss_name, AVG(Y.time_to_defeat) AS avgTime2Defeat
FROM anura.boss AS X INNER JOIN anura.run_boss AS Y 
WHERE Y.defeated = FALSE
GROUP BY (boss_id);

DROP PROCEDURE IF EXISTS newCharacter2newUser;  -- Each time new user registers 
DELIMITER $$                                    -- create a playable character
CREATE PROCEDURE newCharacter2newUser(IN user_id2 SMALLINT)
	BEGIN
		SET @username2 = NULL;
        SELECT username INTO @username2 FROM users WHERE user_id = user_id2;
        
		INSERT INTO playable_character(pc_user_id, character_name, base_hp, base_speed, base_damage)
        VALUES (user_id2, CONCAT('Froggy_',@username2), 100, 10, 15);
    END$$
DELIMITER ;

DROP TRIGGER IF EXISTS addFrog2User;
DELIMITER $$        -- Procedure to call inside trigger: newCharacter2newUser
CREATE TRIGGER addFrog2User
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    CALL newCharacter2newUser(NEW.user_id);
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS calculateRunTime;
DELIMITER $$
CREATE TRIGGER calculateRunTime -- We calculate a runs time duration
BEFORE INSERT ON anura.runs     -- based on start_time column and end_time column
FOR EACH ROW
BEGIN
    IF NEW.end_time IS NOT NULL
        THEN
            SET NEW.run_time = TIMESTAMPDIFF(SECOND, NEW.start_time, NEW.end_time);
    END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS set_end_time_on_victory;
DELIMITER $$
CREATE TRIGGER set_end_time_on_victory -- We're missing implementation of win
BEFORE UPDATE ON anura.runs            -- so we could use a boolean to determine if won or lost
FOR EACH ROW
BEGIN
    IF NEW.victory = TRUE AND OLD.victory = FALSE THEN
        SET NEW.end_time = CURRENT_TIMESTAMP;
    END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS addEndTime2Run;
DELIMITER $$
CREATE TRIGGER addEndTime2Run
BEFORE INSERT ON runs
FOR EACH ROW
BEGIN
    IF NEW.mosquitoes_collected IS NOT NULL 
        THEN
            SET NEW.end_time = CURRENT_TIMESTAMP;
    END IF;
END$$
DELIMITER ;

-- Save after run
DROP PROCEDURE IF EXISTS saveRun;   
DELIMITER $$
CREATE PROCEDURE saveRun(IN run_id2 SMALLINT, 
IN mosquitoes_collected2 SMALLINT, 
IN bosses_defeated2 SMALLINT, 
IN victory2 BOOLEAN)
    BEGIN
        UPDATE anura.runs 
        SET mosquitoes_collected = mosquitoes_collected2  
        WHERE run_id = run_id2;

        UPDATE anura.runs
        SET bosses_defeated = bosses_defeated2
        WHERE run_id = run_id2;

        UPDATE anura.runs
        SET victory = victory2
        WHERE run_id = run_id2;
    END$$
DELIMITER ; 

DROP PROCEDURE IF EXISTS boughtCard;
DELIMITER $$
CREATE PROCEDURE boughtCard(IN cost SMALLINT, IN session_id2 SMALLINT)
BEGIN
	UPDATE anura.mosquitoesPerSessionView
    SET mosquitoes_collected = mosquitoes_collected - cost
    WHERE session_id = session_id2;
END$$
DELIMITER ;

