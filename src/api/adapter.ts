import type { DBConfig } from '../types';

const API_URL = 'http://localhost:3004/api';

const handleResponse = async (res: Response) => {
    if (!res.ok) {
        const text = await res.text();
        try {
            const json = JSON.parse(text);
            return json;
        } catch {
            throw new Error(`Server error: ${res.status} ${res.statusText}`);
        }
    }
    return res.json();
};

const handleFetchError = (error: any) => {
    if (error.message.includes('Failed to fetch')) {
        return {
            success: false,
            error: 'Cannot connect to server. Make sure the backend is running on port 3004.'
        };
    }
    return { success: false, error: error.message };
};

export const api = {
    connectDB: async (config: DBConfig) => {
        try {
            const res = await fetch(`${API_URL}/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            return handleResponse(res);
        } catch (error) {
            return handleFetchError(error);
        }
    },
    getTables: async () => {
        try {
            const res = await fetch(`${API_URL}/tables`);
            return handleResponse(res);
        } catch (error) {
            return handleFetchError(error);
        }
    },
    getColumns: async (table: string) => {
        try {
            const res = await fetch(`${API_URL}/columns/${table}`);
            return handleResponse(res);
        } catch (error) {
            return handleFetchError(error);
        }
    },
    createTable: async (sql: string) => {
        try {
            const res = await fetch(`${API_URL}/create-table`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql }),
            });
            return handleResponse(res);
        } catch (error) {
            return handleFetchError(error);
        }
    },
    generateData: async (data: { table: string; rows: any[] }) => {
        try {
            const res = await fetch(`${API_URL}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table: data.table, data: data.rows }),
            });
            return handleResponse(res);
        } catch (error) {
            return handleFetchError(error);
        }
    }
};
