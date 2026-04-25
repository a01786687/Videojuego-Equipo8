USE anura;

SELECT username, password FROM users;

-- Usamos TRIGGER para mandar tiempo final al acabar un run 
-- Ya sea por muerte o victoria
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

SELECT * FROM runs WHERE run_session_id = 20;
UPDATE mobs SET base_damage = 3
WHERE mob_name = 'mosquito';

SELECT * FROM sessions 
WHERE session_user_id = ? 
AND login_time = (SELECT MAX(login_time) FROM sessions 
WHERE session_user_id = ?);

SELECT * FROM sessions WHERE session_id = 12;

SELECT * FROM mosquitoesPerSessionView WHERE session_id = 22;

CREATE VIEW usersMosquitoes AS
SELECT X.session_user_id, Y.username, SUM(Z.mosquitoesPerSession) AS mosquitoes_total
        FROM anura.sessions AS X INNER JOIN mosquitoesPerSessionView AS Z
        USING (session_id)
        INNER JOIN anura.users AS Y
        ON session_user_id = user_id
        GROUP BY user_id;
        
SELECT * FROM runs;

DROP PROCEDURE IF EXISTS newCharacter2newUser;
DELIMITER $$
CREATE PROCEDURE newCharacter2newUser(IN user_id2 SMALLINT)
	BEGIN
		SET @username2 = NULL;
        SELECT username INTO @username2 FROM users WHERE user_id = user_id2;
        
		INSERT INTO playable_character(pc_user_id, character_name, base_hp, base_speed, base_damage)
        VALUES (user_id2, CONCAT('Froggy_',@username2), 100, 10, 15);
    END$$
DELIMITER ;

CALL newCharacter2newUser(4);
DELETE FROM playable_character WHERE pc_user_id = 4;
SELECT * FROM playable_character;

INSERT INTO runs(run_session_id, start_time)
VALUES (1,NOW());



-- Calcular tiempo al finalizar runs
DELIMITER $$
CREATE TRIGGER calculateRunTime
BEFORE INSERT ON anura.runs
FOR EACH ROW
BEGIN
    IF NEW.end_time IS NOT NULL
        THEN
            SET NEW.run_time = TIMESTAMPDIFF(SECOND, NEW.start_time, NEW.end_time);
    END IF;
END$$
DELIMITER ;

SELECT * FROM usersMosquitoes;


        
        
