SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE a22roblotlot_joc_db;

CREATE TABLE IF NOT EXISTS preguntes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pregunta VARCHAR(255) NOT NULL,
    imatge VARCHAR(255) NOT NULL,
    respostes JSON NOT NULL,
    correctIndex INT NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

TRUNCATE TABLE preguntes;

INSERT INTO preguntes (id, pregunta, imatge, respostes, correctIndex) VALUES
(1, 'De quin pais es aquesta bandera?', 'https://flagcdn.com/w320/jp.png', '["Japó", "Corea del Sud", "Xina", "Bangladesh"]', 0),
(2, 'De quin pais es aquesta bandera?', 'https://flagcdn.com/w320/ca.png', '["Estats Units", "Canadà", "Regne Unit", "Austràlia"]', 1),
(3, 'De quin pais es aquesta bandera?', 'https://flagcdn.com/w320/br.png', '["Argentina", "Colòmbia", "Brasil", "Portugal"]', 2),
(4, 'De quin pais es aquesta bandera?', 'https://flagcdn.com/w320/de.png', '["Bèlgica", "Alemanya", "Àustria", "Països Baixos"]', 1),
(5, 'De quin pais es aquesta bandera?', 'https://flagcdn.com/w320/it.png', '["Irlanda", "França", "Itàlia", "Mèxic"]', 2),
(6, 'De quin pais es aquesta bandera?', 'https://flagcdn.com/w320/ar.png', '["Uruguai", "Argentina", "Guatemala", "Hondures"]', 1),
(7, 'De quin pais es aquesta bandera?', 'https://flagcdn.com/w320/mx.png', '["Mèxic", "Itàlia", "Colòmbia", "Espanya"]', 0),
(8, 'De quin pais es aquesta bandera?', 'https://flagcdn.com/w320/gb.png', '["Austràlia", "Nova Zelanda", "Regne Unit", "Islàndia"]', 2),
(9, 'De quin pais es aquesta bandera?', 'https://flagcdn.com/w320/fr.png', '["Rússia", "Països Baixos", "França", "Luxemburg"]', 2),
(10, 'De quin pais es aquesta bandera?', 'https://flagcdn.com/w320/es.png', '["Espanya", "Portugal", "Andorra", "Veneçuela"]', 0),
(11, 'De quin pais es aquesta bandera?', 'https://flagcdn.com/w320/au.png', '["Nova Zelanda", "Fiji", "Regne Unit", "Austràlia"]', 3),
(12, 'De quin pais es aquesta bandera?', 'https://flagcdn.com/w320/in.png', '["Níger", "Índia", "Irlanda", "Iran"]', 1),
(13, 'De quin pais es aquesta bandera?', 'https://flagcdn.com/w320/za.png', '["Sud-àfrica", "Kenya", "Jamaica", "Nigèria"]', 0),
(14, 'De quin pais es aquesta bandera?', 'https://flagcdn.com/w320/kr.png', '["Corea del Nord", "Japó", "Corea del Sud", "Mongòlia"]', 2),
(15, 'De quin pais es aquesta bandera?', 'https://flagcdn.com/w320/se.png', '["Finlàndia", "Suècia", "Noruega", "Dinamarca"]', 1),
(16, 'De quin pais es aquesta bandera?', 'https://flagcdn.com/w320/gr.png', '["Grècia", "Xipre", "Israel", "Finlàndia"]', 0),
(17, 'De quin pais es aquesta bandera?', 'https://flagcdn.com/w320/pt.png', '["Espanya", "Itàlia", "Portugal", "Brasil"]', 2),
(18, 'De quin pais es aquesta bandera?', 'https://flagcdn.com/w320/eg.png', '["Síria", "Iemen", "Iraq", "Egipte"]', 3),
(19, 'De quin pais es aquesta bandera?', 'https://flagcdn.com/w320/ch.png', '["Suïssa", "Àustria", "Dinamarca", "Noruega"]', 0),
(20, 'De quin pais es aquesta bandera?', 'https://flagcdn.com/w320/tr.png', '["Tunísia", "Turquia", "Azerbaidjan", "Algèria"]', 1);