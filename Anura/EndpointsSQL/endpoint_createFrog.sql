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

DELIMITER $$
CREATE TRIGGER addFrog2User
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    CALL newCharacter2newUser(NEW.user_id);
END$$
DELIMITER ;