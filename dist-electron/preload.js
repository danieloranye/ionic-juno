import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('electronAPI', {
    connectDB: (config) => ipcRenderer.invoke('connect-db', config),
    createTable: (sql) => ipcRenderer.invoke('create-table', sql),
    getTables: () => ipcRenderer.invoke('get-tables'),
    getColumns: (table) => ipcRenderer.invoke('get-columns', table),
    generateData: (data) => ipcRenderer.invoke('generate-data', data)
});
//# sourceMappingURL=preload.js.map