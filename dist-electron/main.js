import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { Client } from 'pg';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let mainWindow;
let dbClient = null;
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
        },
    });
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}
app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
// Database IPC Handlers
ipcMain.handle('connect-db', async (_event, config) => {
    try {
        if (dbClient) {
            await dbClient.end();
        }
        dbClient = new Client(config);
        await dbClient.connect();
        return { success: true };
    }
    catch (error) {
        console.error('Database connection failed:', error);
        return { success: false, error: error.message };
    }
});
ipcMain.handle('get-tables', async () => {
    if (!dbClient)
        throw new Error('Database not connected');
    try {
        const res = await dbClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        return { success: true, tables: res.rows.map(r => r.table_name) };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
ipcMain.handle('get-columns', async (_event, tableName) => {
    if (!dbClient)
        throw new Error('Database not connected');
    try {
        const res = await dbClient.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = $1
    `, [tableName]);
        return { success: true, columns: res.rows };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
ipcMain.handle('create-table', async (_event, sql) => {
    if (!dbClient)
        throw new Error('Database not connected');
    try {
        await dbClient.query(sql);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
ipcMain.handle('generate-data', async (_event, { table, rows, data }) => {
    // Parsing and insertion logic will go here
    if (!dbClient)
        throw new Error('Database not connected');
    try {
        // Basic insertion loop (optimized with bulk insert later if needed)
        // data is expected to be an array of objects matching columns
        // Construct INSERT statement
        // data: [{col1: val1, col2: val2}, ...]
        if (data.length === 0)
            return { success: true, count: 0 };
        const columns = Object.keys(data[0]);
        const colString = columns.map(c => `"${c}"`).join(', ');
        // We'll do single inserts for simplicity or bulk?
        // For thousands of rows, bulk is better.
        // Let's implement a transaction
        await dbClient.query('BEGIN');
        for (const row of data) {
            const values = columns.map(c => row[c]);
            const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
            const query = `INSERT INTO "${table}" (${colString}) VALUES (${placeholders})`;
            await dbClient.query(query, values);
        }
        await dbClient.query('COMMIT');
        return { success: true, count: data.length };
    }
    catch (error) {
        await dbClient.query('ROLLBACK');
        return { success: false, error: error.message };
    }
});
//# sourceMappingURL=main.js.map