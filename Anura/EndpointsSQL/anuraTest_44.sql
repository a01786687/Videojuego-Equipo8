#Corroborar issue 44
SELECT * FROM anura.users;
SELECT * FROM anura.playable_character;
SELECT * FROM anura.cards;

INSERT INTO user_character (uc_user_id,uc_character_id)
VALUES (2,1),(3,1);

INSERT INTO character_deck (cd_card_id, cd_user_character_id)
VALUES (1,1),(2,1),(1,2),(2,2);

SELECT * FROM anura.character_deck WHERE cd_user_character_id = 1; #usuario de renata y sus cartas de manera general

