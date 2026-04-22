-- =============================================
-- DUMMY DATA
-- =============================================



-- Personajes jugables
INSERT INTO playable_character (character_name, base_hp, base_speed, base_damage) VALUES 
('Rana de Bosque', 100, 10, 15), 
('Sapo Blindado', 150, 5, 20), 
('Renacuajo Veloz', 80, 20, 10), 
('Rana Venenosa', 90, 12, 18);

-- Enemigos (Mobs) - 30 registros
INSERT INTO mobs (mob_name, base_damage, base_hp, mosquito_reward) VALUES
('Mosquito Común', 5, 20, 1), ('Mosca de Fruta', 3, 15, 1), ('Libélula Azul', 8, 40, 2),
('Abeja Obrera', 10, 30, 2), ('Araña de Jardín', 12, 45, 3), ('Escarabajo', 6, 60, 2),
('Grillo Saltarín', 7, 25, 1), ('Hormiga Guerrera', 9, 35, 2), ('Ciempiés', 15, 50, 4),
('Mariposa Nocturna', 4, 30, 1), ('Tábano', 11, 35, 2), ('Avispón', 18, 55, 5),
('Cucaracha', 5, 80, 2), ('Mantis Religiosa', 20, 70, 6), ('Gusano de Seda', 2, 25, 1),
('Mariquita Biónica', 8, 40, 3), ('Pulga Saltarina', 14, 20, 2), ('Garrapata', 4, 15, 1),
('Escorpión Joven', 22, 65, 7), ('Luciérnaga', 3, 20, 5), ('Chinche', 6, 30, 1),
('Gorgojo', 7, 45, 2), ('Caracol Sin Concha', 4, 50, 2), ('Mosca Tsé-Tsé', 12, 30, 3),
('Abejorro', 15, 60, 4), ('Oruga Peluda', 9, 40, 2), ('Termita', 5, 25, 1),
('Piojo', 2, 10, 1), ('Saltamontes Gigante', 16, 80, 5), ('Polilla de Cera', 8, 45, 3);

-- Cartas de Habilidad - 30 registros
INSERT INTO cards (card_name, card_cost, card_type, effect_value, effect_parameter, card_description) VALUES
('Lengüetazo', 1, 'Ataque', 15, 'Damage', 'Lanza la lengua para golpear'),
('Salto Alto', 1, 'Defensa', 10, 'Evasión', 'Esquiva el siguiente ataque'),
('Piel Babosa', 2, 'Defensa', 20, 'Armor', 'Reduce el daño recibido'),
('Croar Potente', 2, 'Ataque', 25, 'Damage', 'Onda sonora que aturde'),
('Lluvia de Moscas', 3, 'Curación', 30, 'HP', 'Recupera vida comiendo'),
('Veneno Débil', 1, 'Debuff', 5, 'Poison', 'Daño por turno'),
('Emboscada', 2, 'Ataque', 35, 'Damage', 'Ataque desde el lodo'),
('Meditación Zen', 1, 'Buff', 5, 'Speed', 'Aumenta velocidad'),
('Lanzamiento de Lodo', 2, 'Control', 0, 'Blind', 'Ciega al enemigo'),
('Lengua Larga', 2, 'Ataque', 20, 'Damage', 'Ataca a enemigos lejanos'),
('Piel Espinosa', 3, 'Pasiva', 10, 'Reflect', 'Devuelve daño'),
('Drenado', 2, 'Híbrido', 15, 'Life Steal', 'Roba vida del rival'),
('Salto Sísmico', 3, 'Ataque', 50, 'Damage', 'Golpe de área pesado'),
('Camuflaje', 2, 'Defensa', 100, 'Invisibility', 'No pueden atacarte'),
('Burbuja Protectora', 2, 'Defensa', 40, 'Shield', 'Escudo temporal'),
('Grito de Guerra', 1, 'Buff', 10, 'Damage', 'Sube el daño base'),
('Lodo Pegajoso', 2, 'Control', 5, 'Slow', 'Reduce velocidad enemiga'),
('Picadura de Abeja', 1, 'Ataque', 12, 'Damage', 'Ataque rápido'),
('Enjambre Amigo', 3, 'Ataque', 45, 'Damage', 'Invocas insectos aliados'),
('Mudar Piel', 3, 'Curación', 60, 'HP', 'Cura estados alterados y vida'),
('Ojo de Lince', 1, 'Buff', 15, 'Accuracy', 'No fallas ataques'),
('Danza de Lluvia', 2, 'Global', 0, 'Wet', 'Moja el campo'),
('Rayo Solar', 3, 'Ataque', 70, 'Damage', 'Gran daño tras un turno'),
('Escudo de Caparazón', 2, 'Defensa', 50, 'Defense', 'Aumenta defensa fija'),
('Mordida', 1, 'Ataque', 18, 'Damage', 'Mordisco básico'),
('Viento Cortante', 2, 'Ataque', 22, 'Damage', 'Corte de aire'),
('Polen Curativo', 2, 'Curación', 20, 'HP', 'Curación leve constante'),
('Trampa de Hojas', 2, 'Control', 0, 'Stun', 'Aturde 1 turno'),
('Furia de Charco', 3, 'Ataque', 40, 'Damage', 'Daño basado en vida faltante'),
('Último Recurso', 0, 'Especial', 100, 'Damage', 'Solo usable con poca vida');

-- Jefes (Bosses)
INSERT INTO boss (boss_name, base_hp, base_damage, mosquito_reward) VALUES
('Garza Real', 500, 40, 50), 
('Caimán del Pantano', 800, 60, 100),
('Serpiente de Agua', 450, 55, 75), 
('Tortuga Ancestral', 1200, 30, 130),
('Humano con Red', 2000, 100, 111);


-- =============================================
-- 2. USUARIOS Y SISTEMA (30 registros)
-- =============================================

INSERT INTO users (username, email, password) VALUES
('Froggy1', 'f1@mail.com', 'pass1'), ('ToadMaster', 'tm@mail.com', 'pass2'),
('LilyPad', 'lp@mail.com', 'pass3'), ('CroakFan', 'cf@mail.com', 'pass4'),
('GreenHero', 'gh@mail.com', 'pass5'), ('BugEater', 'be@mail.com', 'pass6'),
('SwampKing', 'sk@mail.com', 'pass7'), ('RainyDay', 'rd@mail.com', 'pass8'),
('FlyCatcher', 'fc@mail.com', 'pass9'), ('PondLife', 'pl@mail.com', 'pass10'),
('Tadpole', 'tp@mail.com', 'pass11'), ('BullFrog', 'bf@mail.com', 'pass12'),
('Jumper', 'j1@mail.com', 'pass13'), ('Slimy', 's1@mail.com', 'pass14'),
('AnuraLover', 'al@mail.com', 'pass15'), ('WebFoot', 'wf@mail.com', 'pass16'),
('DeepWater', 'dw@mail.com', 'pass17'), ('MarshLord', 'ml@mail.com', 'pass18'),
('Ribbit', 'r1@mail.com', 'pass19'), ('AquaJump', 'aj@mail.com', 'pass20'),
('StickyTongue', 'st@mail.com', 'pass21'), ('MudPie', 'mp@mail.com', 'pass22'),
('NightCrawler', 'nc@mail.com', 'pass23'), ('GoldenToad', 'gt@mail.com', 'pass24'),
('LeafFrog', 'lf@mail.com', 'pass25'), ('RedEye', 're@mail.com', 'pass26'),
('Creeper', 'c1@mail.com', 'pass27'), ('Splash', 's2@mail.com', 'pass28'),
('Vortex', 'v1@mail.com', 'pass29'), ('ZeroCool', 'zc@mail.com', 'pass30');

-- Generar sesiones para todos los usuarios creados
INSERT INTO sessions (session_user_id, login_time) 
SELECT user_id, CURRENT_TIMESTAMP FROM users;
INSERT INTO sessions (session_user_id, login_time) 
SELECT user_id, CURRENT_TIMESTAMP FROM users WHERE user_id % 2 = 0;
INSERT INTO sessions (session_user_id, login_time) 
SELECT user_id, CURRENT_TIMESTAMP FROM users LIMIT 5;


-- Asignar un personaje a cada usuario
INSERT INTO user_character (uc_user_id, uc_character_id)
SELECT user_id, (user_id % 4) + 1 FROM users;

-- =============================================
-- 3. PROGRESO DE JUEGO (Runs y Mazos)
-- =============================================

-- Generar 30 partidas (Runs)
INSERT INTO runs (run_session_id, mosquitoes_collected, run_time, bosses_defeated, victory, start_time)
SELECT session_id, FLOOR(RAND()*50), FLOOR(RAND()*600), FLOOR(RAND()*2), RAND()>0.5, NOW() 
FROM sessions; --  Correr varias veces

-- Registrar niveles de manera algo aleatorio donde unos tienen mas niveles que otros
INSERT INTO run_stages (rs_run_id, stage_number)
SELECT run_id, 1 FROM runs;
INSERT INTO run_stages (rs_run_id, stage_number)
SELECT run_id, 2 FROM runs WHERE run_id IN (1,2,4,5,7,8,10,12,13,15,16,18,20,21,23,25,26,28,29,30);
INSERT INTO run_stages (rs_run_id, stage_number)
SELECT run_id, 3 FROM runs WHERE run_id IN (1,4,7,10,13,16,20,25,28,30);

-- Registrar muertes de mobs en las partidas (30 registros)
INSERT INTO run_mob (rm_mob_id, rm_run_id, mobs_killed) VALUES
(1, 1, 5), (2, 1, 3), (5, 2, 10), (10, 3, 2), (15, 4, 1), (20, 5, 8),
(1, 6, 4), (3, 7, 6), (7, 8, 2), (12, 9, 1), (25, 10, 5), (2, 11, 3),
(4, 12, 7), (6, 13, 2), (8, 14, 9), (11, 15, 4), (13, 16, 1), (16, 17, 6),
(18, 18, 2), (21, 19, 3), (22, 20, 5), (24, 21, 8), (26, 22, 1), (27, 23, 10),
(28, 24, 4), (29, 25, 2), (30, 26, 6), (1, 27, 3), (2, 28, 7), (3, 29, 5);

-- Encuentros con Bosses en las partidas (30 registros)
INSERT INTO run_boss (rb_boss_id, rb_run_id, time_to_defeat, defeated) VALUES
(1, 1, 120, 1), (2, 2, 300, 0), (3, 3, 150, 1), (1, 4, 110, 1), (5, 5, 600, 0),
(2, 6, 280, 1), (4, 7, 400, 1), (1, 8, 95, 1), (3, 9, 210, 0), (2, 10, 310, 1),
(1, 11, 130, 1), (2, 12, 320, 0), (3, 13, 160, 1), (4, 14, 450, 0), (5, 15, 700, 1),
(1, 16, 100, 1), (2, 17, 290, 1), (3, 18, 140, 0), (4, 19, 380, 1), (5, 20, 650, 0),
(1, 21, 115, 1), (2, 22, 330, 1), (3, 23, 170, 1), (4, 24, 420, 0), (5, 25, 800, 1),
(1, 26, 105, 1), (2, 27, 275, 1), (3, 28, 155, 1), (4, 29, 390, 0), (5, 30, 720, 1);

-- Asignar cartas a los mazos de los usuarios (30 registros)
INSERT INTO character_deck (cd_card_id, cd_user_character_id)
SELECT (user_character_id % 30) + 1, user_character_id FROM user_character;