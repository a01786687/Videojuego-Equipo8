-- SELECT * FROM anura.users;
-- SELECT * FROM anura.sessions;
-- SELECT * FROM anura.character_deck;
-- SELECT * FROM anura.cards;
-- SELECT * FROM anura.playable_character;
-- SELECT * FROM anura.runs;
-- SELECT * FROM anura.run_stages WHERE rs_run_id = 1;
-- SELECT * FROM anura.run_mob;
-- SELECT * FROM anura.mobs;
-- SELECT * FROM anura.boss;
-- SELECT * FROM anura.run_boss;

-- Para checar si hay tablas
-- Creaciones de view
CREATE VIEW sampleView as
SELECT X.run_session_id AS session_id, COUNT(X.run_id) as totalRunPerSession
FROM anura.runs AS X
GROUP BY run_session_id;
 
-- Implementacion runs per user USAR EN ENDPOINTS
CREATE VIEW totalRunsPerUser AS
SELECT X.session_user_id AS user_id, Y.username, SUM(Z.totalRunPerSession) AS totalRuns
FROM anura.sessions AS X INNER JOIN anura.sampleView AS Z
USING (session_id)
INNER JOIN anura.users AS Y
ON session_user_id = user_id
GROUP BY (user_id);

-- SELECT * FROM totalRunsPerUser WHERE totalRuns < 3;

CREATE VIEW verifyLogIn AS
SELECT username, password FROM users;



-- SELECT * FROM verifyLogIn;

-- Cartas del usuario

DROP VIEW IF EXISTS usersDeck;
ALTER VIEW usersDeck AS  -- Cambiar a create la primera vez que se corrió
SELECT A.username, B.character_name, D.card_name FROM anura.users AS A
INNER JOIN anura.playable_character AS B
ON pc_user_id = user_id
INNER JOIN character_deck AS C
ON cd_character_id = character_id
INNER JOIN cards AS D
ON card_id = cd_card_id;

-- SELECT * FROM usersDeck;

CREATE VIEW character_data AS
SELECT base_hp, base_damage, base_speed FROM playable_character;

CREATE VIEW mobReward AS 
SELECT mob_name, mosquito_reward FROM mobs;

CREATE VIEW bossReward AS
SELECT boss_name, mosquito_reward FROM boss;

CREATE VIEW cardCost AS 
SELECT card_name, card_cost FROM cards;


CREATE VIEW cardDetails AS
SELECT card_name, card_type, effect_value, effect_parameter
FROM anura.cards;

CREATE VIEW mobStats AS
SELECT mob_name, base_damage, base_hp 
FROM anura.mobs;


-- TRIGGERS

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

DROP PROCEDURE IF EXISTS cardEffectFrog;
DELIMITER $$
CREATE PROCEDURE cardEffectFrog(IN effect_value2 SMALLINT, IN effect_parameter2 VARCHAR(30), IN character_id2 SMALLINT)
    BEGIN 
        IF effect_parameter2 = 'Damage'
            THEN
                UPDATE playable_character SET base_damage = base_damage + effect_value2 WHERE character_id = character_id2;
        ELSEIF effect_parameter2 = 'HP'
            THEN
                UPDATE playable_character SET base_hp = base_hp + effect_value2 WHERE character_id = character_id2; 
        ELSEIF effect_parameter2 = 'Speed' 
            THEN
                UPDATE playable_character SET base_speed = base_speed + effect_value2 WHERE character_id = character_id2;
        END IF;
    END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE addNewUser(IN u_name VARCHAR(50), IN u_email VARCHAR(50), IN u_pass VARCHAR(255))
BEGIN
    INSERT INTO anura.users (username, email, password) 
    VALUES (u_name, u_email, u_pass);
END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE addNewCard(IN name_c VARCHAR(50), IN cost_c SMALLINT, IN type_c VARCHAR(25), IN param_c VARCHAR(30), IN desc_c VARCHAR(250))
BEGIN
    INSERT INTO anura.cards (card_name, card_cost, card_type, effect_parameter, card_description)
    VALUES (name_c, cost_c, type_c, param_c, desc_c);
END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE addRunStage(IN id_run SMALLINT, IN num_stage SMALLINT)
BEGIN
    INSERT INTO anura.run_stages (rs_run_id, stage_number) VALUES (id_run, num_stage);
END$$
DELIMITER ;


DROP TRIGGER IF EXISTS updateFrogStats;
DELIMITER $$
CREATE TRIGGER updateFrogStats
AFTER INSERT ON character_deck  -- INSERCION IMPLICA QUE UN JUGAOR ANADIO UNA CARTA
FOR EACH ROW
BEGIN 
    SET @effect_value3 = NULL;
    SET @effect_parameter3 = NULL;

    SELECT effect_value , effect_parameter INTO @effect_value3, @effect_parameter3 
    FROM cards
    WHERE card_id = NEW.cd_card_id;

    CALL cardEffectFrog(@effect_value3, @effect_parameter3, NEW.cd_character_id);

END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER set_end_time_on_victory
BEFORE UPDATE ON anura.runs
FOR EACH ROW
BEGIN
    IF NEW.victory = TRUE AND OLD.victory = FALSE THEN
        SET NEW.end_time = CURRENT_TIMESTAMP;
    END IF;
END$$
DELIMITER ;


DELIMITER $$
CREATE TRIGGER default_card_cost
BEFORE INSERT ON anura.cards
FOR EACH ROW
BEGIN
    IF NEW.card_cost < 0 THEN
        SET NEW.card_cost = 1;
    END IF;
END$$
DELIMITER ;


SET @card_id2 = NULL;
SET @character_id2 = NULL;

SELECT character_id INTO  @character_id2 FROM playable_character WHERE character_id = 22;
SELECT card_id INTO @card_id2  FROM cards WHERE card_id = 10;


INSERT INTO character_deck(cd_card_id, cd_character_id) 
VALUES (@card_id2, @character_id2);


-- SELECT * FROM playable_character WHERE character_id = 22;
-- SELECT  *  FROM cards WHERE card_id = 10;


USE anura;
        
