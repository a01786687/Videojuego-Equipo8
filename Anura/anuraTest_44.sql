#Corroborar issue 44
SELECT * FROM anura.users;
SELECT * FROM anura.playable_character;

INSERT INTO cards (card_name, card_type, effect_value)
VALUES ('Sticky tongue', 'combat', 25),
('Volley legs', 'movement',0),
('Shiny skin', 'utility',0),
('Reni attack','combat',30);

INSERT INTO user_character (uc_user_id,uc_character_id)
VALUES (2,1),(3,1);

INSERT INTO character_cards (cc_card_id, cc_user_character_id, slot_number, card_rank)
VALUES (1,1,1,12),(2,1,2,5), (3,2,3,13);

SELECT * FROM anura.character_cards WHERE cc_user_character_id = 1; #usuario de renata y sus cartas de manera general



