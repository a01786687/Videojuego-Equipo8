USE anura;

INSERT INTO playable_character (character_name, base_hp, base_speed, base_damage)
VALUES ('Froggy', 100, 10, 15);


INSERT INTO users (username, email, password)
VALUES ('emilio', 'emilio@mail.com', '1234'),('reni','reni@outlook.com','4567'),
('carlos','carlos@hotmail.com','1111');


INSERT INTO sessions (session_user_id)
VALUES (1),(2),(3);


INSERT INTO runs (run_session_id, mosquitoes_collected, bosses_defeated, victory, start_time)
VALUES (1, 50, 1, FALSE, NOW()),(2,15,1,FALSE,NOW()),(3,35,1,FALSE,NOW());


INSERT INTO boss (boss_name, base_hp, base_damage, mosquito_reward)
VALUES ('Snake', 200, 25, 30);


INSERT INTO run_boss (rb_boss_id, rb_run_id, time_to_defeat, defeated)
VALUES (1, 1, 120, TRUE),(1,2,150,FALSE),(1,3,140,FALSE);

INSERT INTO mobs (mob_name,base_damage,base_hp,mosquito_reward)
VALUES ('mosquito',0,2,1),('spider',10,5,5);

#CHECAR ISSUE 50 CONSULTAS:

#Consultas simples
SELECT * FROM anura.playable_character;
SELECT * FROM anura.users AS X;

SELECT * FROM anura.runs;
SELECT * FROM anura.run_boss;

#Creaciones de view
ALTER VIEW sampleView as
SELECT X.run_sesSion_id, COUNT(X.run_id) as totalRunPerSesSion
FROM anura.runs AS X
 GROUP BY run_session_id;
 
SELECT * FROM anura.sampleView;

#Checar cambio si se añade una run
INSERT INTO runs (run_session_id, mosquitoes_collected, bosses_defeated, victory, start_time)
VALUES (1, 24,1,FALSE,NOW());
 
#Consulta compleja

#Calcular tiempo promedio de pelea de un jefe
SELECT X.boss_name, AVG(Y.time_to_defeat) AS avgTime2Defeat
FROM anura.boss AS X INNER JOIN anura.run_boss AS Y 
WHERE Y.defeated = FALSE
GROUP BY (boss_id);

#Mostrar UPDATES ISSUE 48

#Cambiable

UPDATE anura.users AS X
SET X.username = "Em1Pro"
WHERE X.username = "emilio";

UPDATE anura.boss AS X
SET X.boss_name = "Anaconda"
WHERE X.boss_name = "Snake";

SELECT * FROM anura.boss;
SELECT * FROM anura.sesions;

#No cambiable

UPDATE anura.users AS X
SET X.user_id = 445
WHERE X.username = "Em1Pro";  #En este caso si hay datos en sesions con ese ID no se puede cambiar el id del user

#Si cambiable
UPDATE anura.boss AS Y
SET Y.boss_id = 10
WHERE Y.boss_id = 1;

SELECT * FROM anura.users;
SELECT * FROM anura.run_boss;

#DELETES ISSUE 50

DELETE FROM anura.users AS X
WHERE X.user_id = 1; 

DELETE FROM anura.boss AS Y
WHERE Y.boss_id = 10;

DELETE FROM anura.runs AS Z
WHERE Z.run_id = 1;




