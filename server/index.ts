import express from 'express';
import cors from 'cors';
import { Client } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3004;
const isProduction = process.env.NODE_ENV === 'production';

// Enable CORS for all origins (development)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

let dbClient: Client | null = null;

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'PostgreSQL Data Generator API' });
});

app.get('/api', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});

// Connect DB
app.post('/api/connect', async (req, res) => {
    try {
        if (dbClient) {
            await dbClient.end();
        }
        dbClient = new Client(req.body);
        await dbClient.connect();
        res.json({ success: true });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Database connection failed:', error);
        res.status(500).json({ success: false, error: errorMessage });
    }
});

// Get Tables
app.get('/api/tables', async (req, res) => {
    if (!dbClient) return res.status(400).json({ success: false, error: 'Database not connected' });
    try {
        const result = await dbClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        res.json({ success: true, tables: result.rows.map(r => r.table_name) });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: errorMessage });
    }
});

// Get Columns
app.get('/api/columns/:table', async (req, res) => {
    if (!dbClient) return res.status(400).json({ success: false, error: 'Database not connected' });
    try {
        const result = await dbClient.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = $1
    `, [req.params.table]);
        res.json({ success: true, columns: result.rows });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: errorMessage });
    }
});

// Create Table
app.post('/api/create-table', async (req, res) => {
    if (!dbClient) return res.status(400).json({ success: false, error: 'Database not connected' });
    const { sql } = req.body;
    try {
        await dbClient.query(sql);
        res.json({ success: true });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: errorMessage });
    }
});

// Generate Data
app.post('/api/generate', async (req, res) => {
    if (!dbClient) return res.status(400).json({ success: false, error: 'Database not connected' });
    const { table, data } = req.body; // data is array of objects

    if (!data || data.length === 0) return res.json({ success: true, count: 0 });

    try {
        const columns = Object.keys(data[0]);
        const colString = columns.map(c => `"${c}"`).join(', ');

        await dbClient.query('BEGIN');

        for (const row of data as Record<string, unknown>[]) {
            const values = columns.map(c => row[c]);
            const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
            const query = `INSERT INTO "${table}" (${colString}) VALUES (${placeholders})`;
            await dbClient.query(query, values);
        }

        await dbClient.query('COMMIT');
        res.json({ success: true, count: data.length });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await dbClient!.query('ROLLBACK');
        res.status(500).json({ success: false, error: errorMessage });
    }
});

if (isProduction) {
    app.use(express.static(path.join(__dirname, '../dist')));
    app.get('*splat', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(__dirname, '../dist/index.html'));
        }
    });
}

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
