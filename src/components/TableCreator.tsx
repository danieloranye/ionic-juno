import { useState } from 'react';
import type { ColumnDef } from '../types';
import { api } from '../api/adapter';

export const TableCreator: React.FC = () => {
    const [tableName, setTableName] = useState('');
    const [columns, setColumns] = useState<ColumnDef[]>([{ column_name: 'id', data_type: 'SERIAL PRIMARY KEY' }]);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const addColumn = () => {
        setColumns([...columns, { column_name: '', data_type: 'VARCHAR(100)' }]);
    };

    const removeColumn = (index: number) => {
        setColumns(columns.filter((_, i) => i !== index));
    };

    const updateColumn = (index: number, field: keyof ColumnDef, value: string) => {
        const newCols = [...columns];
        newCols[index] = { ...newCols[index], [field]: value };
        setColumns(newCols);
    };

    const handleCreate = async () => {
        if (!tableName) return;

        // Construct SQL
        const colDefinitions = columns.map(c => `${c.column_name} ${c.data_type}`).join(', ');
        const sql = `CREATE TABLE ${tableName} (${colDefinitions})`;

        try {
            const res = await api.createTable(sql);
            if (res.success) {
                setStatus({ type: 'success', message: `Table "${tableName}" created successfully!` });
                setTableName('');
                setColumns([{ column_name: 'id', data_type: 'SERIAL PRIMARY KEY' }]);
            } else {
                setStatus({ type: 'error', message: res.error || 'Failed to create table' });
            }
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-blue-400">Create New Table</h2>

            {status && (
                <div className={`mb-4 p-3 rounded text-sm ${status.type === 'success' ? 'bg-green-900/50 text-green-200 border-green-500' : 'bg-red-900/50 text-red-200 border-red-500'} border`}>
                    {status.message}
                </div>
            )}

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Table Name</label>
                <input
                    type="text"
                    value={tableName}
                    onChange={e => setTableName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white"
                    placeholder="e.g. users"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Columns</label>
                <div className="space-y-2">
                    {columns.map((col, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input
                                type="text"
                                value={col.column_name}
                                onChange={e => updateColumn(idx, 'column_name', e.target.value)}
                                className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white"
                                placeholder="Column Name"
                            />
                            <select
                                value={col.data_type}
                                onChange={e => updateColumn(idx, 'data_type', e.target.value)}
                                className="w-1/3 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white"
                            >
                                {/* Primary Keys */}
                                <option value="SERIAL PRIMARY KEY">SERIAL PRIMARY KEY - Auto-increment ID</option>
                                <option value="BIGSERIAL PRIMARY KEY">BIGSERIAL PRIMARY KEY - Large Auto-increment ID</option>

                                {/* Numeric Types */}
                                <option value="SMALLINT">SMALLINT - Small Integer (-32,768 to 32,767)</option>
                                <option value="INTEGER">INTEGER - Standard Integer</option>
                                <option value="BIGINT">BIGINT - Large Integer</option>
                                <option value="DECIMAL(10,2)">DECIMAL(10,2) - Exact Decimal (10 digits, 2 decimal)</option>
                                <option value="NUMERIC(10,2)">NUMERIC(10,2) - Exact Numeric (10 digits, 2 decimal)</option>
                                <option value="REAL">REAL - Float (4 bytes)</option>
                                <option value="DOUBLE PRECISION">DOUBLE PRECISION - Float (8 bytes)</option>

                                {/* Character Types */}
                                <option value="VARCHAR(50)">VARCHAR(50) - Variable Text (50 chars)</option>
                                <option value="VARCHAR(100)">VARCHAR(100) - Variable Text (100 chars)</option>
                                <option value="VARCHAR(255)">VARCHAR(255) - Variable Text (255 chars)</option>
                                <option value="CHAR(10)">CHAR(10) - Fixed Text (10 chars)</option>
                                <option value="TEXT">TEXT - Unlimited Text</option>

                                {/* Date & Time */}
                                <option value="DATE">DATE - Date Only</option>
                                <option value="TIME">TIME - Time Only</option>
                                <option value="TIMESTAMP">TIMESTAMP - Date & Time</option>
                                <option value="TIMESTAMPTZ">TIMESTAMPTZ - Date & Time with Timezone</option>

                                {/* Boolean */}
                                <option value="BOOLEAN">BOOLEAN - True/False</option>

                                {/* Other Types */}
                                <option value="UUID">UUID - Unique Identifier</option>
                                <option value="JSON">JSON - JSON Data</option>
                                <option value="JSONB">JSONB - Binary JSON (faster)</option>
                            </select>
                            <button
                                onClick={() => removeColumn(idx)}
                                className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
                                title="Remove Column"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    onClick={addColumn}
                    className="mt-2 text-sm text-blue-400 hover:text-blue-300 underline"
                >
                    + Add Column
                </button>
            </div>

            <button
                onClick={handleCreate}
                disabled={!tableName}
                className="w-full py-2 bg-green-600 hover:bg-green-700 rounded text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Create Table
            </button>
        </div>
    );
};
