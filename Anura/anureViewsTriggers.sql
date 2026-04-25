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

-- deckBySession: returns the full deck of cards for a session_id
-- it is used by GET /deck/session_id to load the player's saved deck when the run starts

CREATE VIEW deckBySession AS
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


-- TRIGGERS

DELIMITER $$
CREATE TRIGGER addRun_end_time
BEFORE INSERT ON runs
FOR EACH ROW
BEGIN
    IF NEW.mosquitoes_collected IS NOT NULL
        THEN
            SET NEW.end_time = CURRENT_TIMESTAMP;
    END IF;
END$$
DELIMITER ;
