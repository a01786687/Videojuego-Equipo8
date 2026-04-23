SELECT * FROM anura.users;
SELECT * FROM anura.sessions;
SELECT * FROM anura.user_character;
SELECT * FROM anura.character_deck;
SELECT * FROM anura.cards;
SELECT * FROM anura.playable_character;
SELECT * FROM anura.runs;
SELECT * FROM anura.run_stages WHERE rs_run_id = 1;
SELECT * FROM anura.run_mob;
SELECT * FROM anura.mobs;
SELECT * FROM anura.boss;
SELECT * FROM anura.run_boss;

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

SELECT * FROM totalRunsPerUser WHERE totalRuns < 3;

CREATE VIEW verifyLogIn AS
SELECT username, password FROM users;

SELECT * FROM verifyLogIn;

-- Cartas del usuario

CREATE VIEW usersDeck AS  -- Cambiar a create la primera vez que se corrió
SELECT A.username, B.uc_character_id AS character_id, D.card_name FROM anura.users AS A
INNER JOIN anura.user_character AS B
ON uc_user_id = user_id
INNER JOIN character_deck AS C
ON cd_user_character_id = user_character_id
INNER JOIN cards AS D
ON card_id = cd_card_id;

CREATE VIEW nombres AS
SELECT X.username, Y.character_name, X.card_name FROM usersDeck AS X
INNER JOIN playable_character AS Y
USING (character_id);

CREATE VIEW 


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

DELIMITER $$
CREATE PROCEDURE cardEffectFrog(IN effect_value2 SMALLINT, IN effect_parameter2 VARCHAR(30))
    BEGIN 
        IF effect_parameter2 = 'Damage'
            THEN
                UPDATE playable_character SET base_damage = base_damage * effect_value2;
        ELSEIF effect_parameter2 = 'HP'
            THEN
                UPDATE playable_character SET base_hp = base_hp * effect_value2; 
        ELSEIF effect_parameter2 = 'Speed' 
            THEN
                UPDATE playable_character SET base_speed = base_speed * effect_value2;
        END IF;
    END$$
DELIMITER ;

DELIMITER ##
CREATE TRIGGER updateFrogStats
AFTER INSERT ON character_deck
FO
        
