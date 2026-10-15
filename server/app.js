const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
const port = Number(process.argv[2]) || 30300;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir frontend
const publicDir = path.join(__dirname, '../public_html');
app.use(express.static(publicDir, { etag: false, maxAge: 0 }));

// Servir uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Configuración de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'imatge-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage });

const sessions = new Map();

app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

// Obtener preguntas aleatorias
app.post('/getPreguntes', async (req, res) => {
    try {
        let quantitat = parseInt(req.body.quantitat, 10);
        if (isNaN(quantitat) || quantitat <= 0) quantitat = 10;

        const [rows] = await db.query(
            `SELECT id, pregunta, imatge, respostes, correctIndex FROM preguntes ORDER BY RAND() LIMIT ${quantitat}`
        );

        if (!rows || rows.length === 0) {
            return res.status(500).json({ error: 'Taula buida' });
        }

        const sessionId = uuidv4();
        sessions.set(sessionId, {
            correctIndexes: rows.map(r => r.correctIndex),
            total: rows.length
        });

        const preguntesPerClient = rows.map(r => ({
            id: r.id,
            pregunta: r.pregunta,
            imatge: r.imatge || null,
            respostes: typeof r.respostes === 'string' ? JSON.parse(r.respostes) : r.respostes
        }));

        res.json({ sessionId, preguntes: preguntesPerClient });
    } catch (error) {
        console.error('Error a /getPreguntes:', error);
        res.status(500).json({ error: 'Error intern' });
    }
});

// Validar partida
app.post('/finalitza', (req, res) => {
    const { sessionId, respostesUsuari } = req.body;

    if (!sessions.has(sessionId)) {
        return res.status(404).json({ error: 'Sessió no trobada' });
    }

    const { correctIndexes, total } = sessions.get(sessionId);

    let correctes = 0;
    if (Array.isArray(respostesUsuari)) {
        respostesUsuari.forEach((ans, i) => {
            if (ans === correctIndexes[i]) correctes++;
        });
    }

    sessions.delete(sessionId);
    res.json({ total, correctes });
});

// CRUD Admin: Listar
app.get('/admin/preguntes', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, pregunta, imatge, respostes, correctIndex FROM preguntes ORDER BY id ASC'
        );

        const preguntes = rows.map(r => ({
            id: r.id,
            pregunta: r.pregunta,
            imatge: r.imatge,
            respostes: typeof r.respostes === 'string' ? JSON.parse(r.respostes) : r.respostes,
            correctIndex: r.correctIndex
        }));

        res.json(preguntes);
    } catch (error) {
        console.error('Error a GET /admin/preguntes:', error);
        res.status(500).json({ error: 'Error obtenint preguntes' });
    }
});

// CRUD Admin: Crear
app.post('/admin/preguntes', upload.single('imatge'), async (req, res) => {
    try {
        const { pregunta, correctIndex } = req.body;
        let respostes = req.body.respostes;

        if (typeof respostes === 'string') {
            respostes = JSON.parse(respostes);
        }

        const imatgePath = req.file
            ? `/uploads/${req.file.filename}`
            : (req.body.imatgeUrl || '');

        const [result] = await db.query(
            'INSERT INTO preguntes (pregunta, imatge, respostes, correctIndex) VALUES (?, ?, ?, ?)',
            [pregunta, imatgePath, JSON.stringify(respostes), parseInt(correctIndex, 10)]
        );

        res.status(201).json({
            id: result.insertId,
            pregunta,
            imatge: imatgePath,
            respostes,
            correctIndex: parseInt(correctIndex, 10)
        });
    } catch (error) {
        console.error('Error a POST /admin/preguntes:', error);
        res.status(500).json({ error: 'Error creant la pregunta' });
    }
});

// CRUD Admin: Actualizar
app.put('/admin/preguntes/:id', upload.single('imatge'), async (req, res) => {
    try {
        const { id } = req.params;
        const { pregunta, correctIndex } = req.body;
        let respostes = req.body.respostes;

        if (typeof respostes === 'string') {
            respostes = JSON.parse(respostes);
        }

        let query = 'UPDATE preguntes SET pregunta = ?, respostes = ?, correctIndex = ?';
        const params = [pregunta, JSON.stringify(respostes), parseInt(correctIndex, 10)];

        if (req.file) {
            query += ', imatge = ?';
            params.push(`/uploads/${req.file.filename}`);
        } else if (req.body.imatgeUrl !== undefined) {
            query += ', imatge = ?';
            params.push(req.body.imatgeUrl);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await db.query(query, params);
        res.json({ message: 'Pregunta actualitzada correctament' });
    } catch (error) {
        console.error('Error a PUT /admin/preguntes:', error);
        res.status(500).json({ error: 'Error actualitzant la pregunta' });
    }
});

// CRUD Admin: Eliminar
app.delete('/admin/preguntes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM preguntes WHERE id = ?', [id]);
        res.json({ message: 'Pregunta eliminada correctament' });
    } catch (error) {
        console.error('Error a DELETE /admin/preguntes:', error);
        res.status(500).json({ error: 'Error eliminant la pregunta' });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor actiu al port ${port}`);
});