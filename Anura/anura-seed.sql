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
	('Iron Hindlegs', 30, 'Movement', 1, 'extraJumps', 'Grants the frog a double jump.'),
	('Dragonfly Hop', 35, 'Movement', 2, 'extraJumps', 'Three rapid micro jumps.'),
	('Glide Membrane', 40, 'Movement', 1, 'canGlide', 'Gliding through the air.'),
	('Bubble Dash', 45, 'Movement', 1, 'canDash', 'A quick dash encased in a bubble.'),
	('Rocket Frog', 50, 'Movement', 1.5, 'jumpForce', 'Launches frog with rocket power.'),
    

	-- COMBAT CARDS
	('Chameleon Veil',  30, 'Combat',  1,    'canChameleon',   'Briefly turns the frog invisible.'),
	('Fire Kiss',       35, 'Combat',  1,    'fireKiss',       'Fire tongue deals extra damage.'),
	('Thunder Tongue',  40, 'Combat',  0.4,  'thunderChance',  'Electrifies the tongue attack.'),
	('Toad Shockwave',  45, 'Combat',  1,    'canShockwave',   'Releases a shockwave on landing.'),
	('Venom Lash',      50, 'Combat',  3000, 'poisonDuration', 'Poisons enemies on hit.'),

	-- UTILITY CARDS
	('Lucky Pond',      30, 'Utility', 1,  'luckyPond',           'Chance to double mosquito drops.'),
	('Metamorphosis',   35, 'Utility', 1,  'metamorphosisActive', 'Temporarily transforms the frog.'),
	('Spiked Whip',     40, 'Utility', 2, 'tongueRangeBonus',    'Extends tongue range with spikes.'),
	('Tadpole Heart',   45, 'Utility', 1,  'tadpoleHeart',        'Grants bonus health at run start.'),
	('Thorn Skin',      50, 'Utility', 1,  'thornSkin',           'Reflects damage back to attackers.');

	-- BOSS DATA
    
    INSERT INTO boss (boss_name,base_hp,base_damage, mosquito_reward)
    VALUES ('snake',50,20,20);
    
	-- MOBS DATA

	INSERT IGNORE INTO mobs (mob_name,base_damage,base_hp,mosquito_reward)
	VALUES ('mosquito',0,2,1),('spider',10,5,5);

	-- use UPDATES to make game rogue-like:
	UPDATE anura.mobs SET base_damage = 12 -- make mosquitoes have damage
	WHERE mob_name = 'spider';
    
    UPDATE anura.mobs SET mosquito_reward = 3  -- Final changes to damage values and mosquitoe reward from spiders
    WHERE mob_name = 'spider';

	UPDATE mobs SET base_damage = 3 -- make spiders stronger
	WHERE mob_name = 'mosquito';

	UPDATE mobs SET base_hp = 7
	WHERE mob_name = 'spider';

	-- VIEWS
	CREATE OR REPLACE VIEW mosquitoesPerSessionView AS
	SELECT run_session_id AS session_id, SUM(mosquitoes_collected) AS mosquitoesPerSession
	FROM anura.runs
	GROUP BY session_id;

	-- usersMosquitoes: sums up all the mosquitoes a user has collected across ALL their sessions (logins, play sessions ever)
	CREATE OR REPLACE VIEW usersMosquitoes AS
	SELECT 
		X.session_user_id AS user_id, 
		Y.username AS username, 
		SUM(Z.mosquitoesPerSession) AS mosquitoes_total
	FROM anura.sessions AS X 
	INNER JOIN mosquitoesPerSessionView AS Z USING (session_id)
	INNER JOIN anura.users AS Y ON X.session_user_id = Y.user_id
	GROUP BY Y.user_id;

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
	SELECT X.session_user_id, Y.username, SUM(Z.totalRunPerSession) AS totalRuns
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


	-- TRIGGER for calulating run_time when a run is UPDATED (victory/death)
	-- Needed because the existing trigger calculateRunTime only fires on INSERT (run start), 
	-- but run_time needs to be calculated when end_time is set during 
	-- UPDATE (when saveRun procedure is called with victory status)
	-- IDENTIFIED WITH AI, I asked AI what the problem was and why was the run time not updating, and it pointed this out
	DROP TRIGGER IF EXISTS calculateRunTimeOnUpdate;
	DELIMITER $$
	CREATE TRIGGER calculateRunTimeOnUpdate
	BEFORE UPDATE ON anura.runs  -- We had small issue since it was on insert instead of UPDATE
	FOR EACH ROW					-- Most of the TRIGGER was implemented by us just the correction with AI on UPDATE
	BEGIN						
		-- if end_time was just set victory or death, calculate the run time
		IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
			SET NEW.run_time = TIMESTAMPDIFF(SECOND, NEW.start_time, NEW.end_time);  -- We asked AI if it was possible calculate time from TIMESTAMPS
		END IF;																		-- and gave us this native procedure from MySQL called TIMESTAPDIFF
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
		UPDATE anura.runs
		SET mosquitoes_collected = mosquitoes_collected - cost
		WHERE run_session_id = session_id2 LIMIT 1;
	END$$
	DELIMITER ;

-- UPDATE COMBAT CARDS
UPDATE cards SET effect_value = 1.00, effect_parameter = 'canChameleon' WHERE card_id = 6;
UPDATE cards SET effect_value = 1.00, effect_parameter = 'fireKiss' WHERE card_id = 7;
UPDATE cards SET effect_value = 0.40, effect_parameter = 'thunderChance' WHERE card_id = 8;
UPDATE cards SET effect_value = 1.00, effect_parameter = 'canShockwave' WHERE card_id = 9;
UPDATE cards SET effect_value = 999.99, effect_parameter = 'poisonDuration' WHERE card_id = 10;

-- TRIGGERS and PROCEDURES to set data to run_mob table

DROP PROCEDURE IF EXISTS startRunMob;
DELIMITER $$
CREATE PROCEDURE startRunMob(IN run_id2 SMALLINT, IN mob_name2 VARCHAR(25))
	BEGIN 
		SET @mobID = NULL;
		SELECT mob_id INTO @mobID FROM mobs
		WHERE mob_name = mob_name2;

		INSERT INTO run_mob(rm_mob_id, rm_run_id)
		VALUES (@mobID, run_id2);

	END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS saveRunMob;
DELIMITER $$
CREATE PROCEDURE saveRunMob(IN run_id2 SMALLINT, IN mob_name2 VARCHAR(25), IN mobKills SMALLINT)
	BEGIN
		SET @mobID = NULL;
		SELECT mob_id INTO @mobID FROM mobs
		WHERE mob_name = mob_name2;

		UPDATE run_mob SET mobs_killed = mobKills
		WHERE rm_run_id = run_id2 AND rm_mob_id = @mobID;
	END$$
DELIMITER ;

-- UTILITY CARDS
UPDATE cards SET effect_parameter = 'luckyPond',           effect_value = 1  WHERE card_id = 11;
UPDATE cards SET effect_parameter = 'metamorphosisActive', effect_value = 1  WHERE card_id = 12;
UPDATE cards SET effect_parameter = 'tongueRangeBonus',    effect_value = 2 WHERE card_id = 13;
UPDATE cards SET effect_parameter = 'tadpoleHeart',        effect_value = 1  WHERE card_id = 14;
UPDATE cards SET effect_parameter = 'thornSkin',           effect_value = 1  WHERE card_id = 15;

SET SQL_SAFE_UPDATES = 0;  -- run this first
UPDATE playable_character SET base_damage = 1; -- first
SET SQL_SAFE_UPDATES = 1; -- then this

-- CARD COST UPDATE
UPDATE cards SET card_cost = 30 WHERE card_id IN (1, 6, 11);
UPDATE cards SET card_cost = 35 WHERE card_id IN (2, 7, 12);
UPDATE cards SET card_cost = 40 WHERE card_id IN (3, 8, 13);
UPDATE cards SET card_cost = 45 WHERE card_id IN (4, 9, 14);
UPDATE cards SET card_cost = 50 WHERE card_id IN (5, 10, 15);

-- CARD DESC UPDATE
UPDATE cards SET card_description = "Three rapid micro jumps." WHERE card_id = 2;
UPDATE cards SET card_description = "Gliding through the air." WHERE card_id = 3;
UPDATE cards SET card_description = "Launches the frog with rocket power." WHERE card_id = 5;

UPDATE cards SET card_description = "Fire tongue deals extra damage." WHERE card_id = 7;





