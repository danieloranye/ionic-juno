import { useEffect, useState } from 'react';
import { faker } from '@faker-js/faker';
import { api } from '../api/adapter';

// TODO: Implement custom domains logic here or import it
// For now, hardcode some faker mapping options

const FAKER_OPTIONS = [
    { label: 'Name - Full Name', value: 'person.fullName' },
    { label: 'Name - First Name', value: 'person.firstName' },
    { label: 'Name - Last Name', value: 'person.lastName' },
    { label: 'Internet - Email', value: 'internet.email' },
    { label: 'Location - City', value: 'location.city' },
    { label: 'Location - Country', value: 'location.country' },
    { label: 'Date - Past', value: 'date.past' },
    { label: 'Finance - Account Name', value: 'finance.accountName' },
    { label: 'Finance - IBAN', value: 'finance.iban' },
    { label: 'Finance - Amount', value: 'finance.amount' },
    { label: 'Custom - Covid Vaccine', value: 'custom.vaccine' },
    { label: 'Custom - Insurance Policy', value: 'custom.policy' },
];

export const DataGenerator: React.FC = () => {
    const [tables, setTables] = useState<string[]>([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [columns, setColumns] = useState<{ column_name: string, data_type: string }[]>([]);
    const [mappings, setMappings] = useState<Record<string, string>>({});
    const [rowCount, setRowCount] = useState(10);
    const [isGenerating, setIsGenerating] = useState(false);
    const [log, setLog] = useState<string[]>([]);

    useEffect(() => {
        loadTables();
    }, []);

    const loadTables = async () => {
        const res = await api.getTables();
        if (res.success && res.tables) {
            setTables(res.tables);
        }
    };

    useEffect(() => {
        if (selectedTable) {
            loadColumns(selectedTable);
        }
    }, [selectedTable]);

    const loadColumns = async (table: string) => {
        const res = await api.getColumns(table);
        if (res.success && res.columns) {
            setColumns(res.columns);
            // reset mappings
            const newMap: Record<string, string> = {};
            // Try to auto-guess?
            setMappings(newMap);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setLog(prev => [...prev, `Starting generation for ${selectedTable} (${rowCount} rows)...`]);

        // Generate Data Client-side (in React) then send to Electron to insert?
        // Or send config to Electron? 
        // Plan said "Data Generation Logic with Faker.js" in Main? 
        // Actually, if we use Faker in Main process, we need to send mapping config.
        // IF we use Faker in React (easier to import usually), we generate array of objects and send to `ipcMain`.
        // Let's do generation in React (Renderer), send data to Main.
        // Main handles DB insertion.

        try {
            const data = [];
            for (let i = 0; i < rowCount; i++) {
                const row: any = {};
                for (const col of columns) {
                    const method = mappings[col.column_name];
                    if (method) {
                        row[col.column_name] = generateValue(method);
                    }
                }
                data.push(row);
            }

            setLog(prev => [...prev, `Generated ${data.length} records in memory. Sending to DB...`]);
            const res = await api.generateData({ table: selectedTable, rows: data });

            if (res.success) {
                setLog(prev => [...prev, `Successfully inserted ${res.count} rows into ${selectedTable}.`]);
            } else {
                setLog(prev => [...prev, `Error: ${res.error}`]);
            }

        } catch (err: any) {
            setLog(prev => [...prev, `Error: ${err.message}`]);
        } finally {
            setIsGenerating(false);
        }
    };

    const generateValue = (method: string) => {
        // Handle custom domains
        if (method === 'custom.vaccine') {
            const vaccines = ['Pfizer', 'Moderna', 'AstraZeneca', 'J&J', 'Sinovac'];
            return vaccines[Math.floor(Math.random() * vaccines.length)];
        }
        if (method === 'custom.policy') {
            return 'POL-' + faker.string.alphanumeric(8).toUpperCase();
        }

        // Handle faker
        const parts = method.split('.');
        if (parts.length === 2) {
            // @ts-ignore
            return faker[parts[0]][parts[1]]();
        }
        return null;
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-blue-400">Generate Data</h2>
                <button onClick={loadTables} className="text-sm text-gray-400 hover:text-white">Refresh Tables</button>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Select Table</label>
                <select
                    value={selectedTable}
                    onChange={e => setSelectedTable(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white"
                >
                    <option value="">-- Select Table --</option>
                    {tables.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            {selectedTable && (
                <div className="flex-1 overflow-auto mb-4">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-700 text-gray-300">
                            <tr>
                                <th className="p-2">Column</th>
                                <th className="p-2">Type</th>
                                <th className="p-2">Generator</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {columns.map(col => (
                                <tr key={col.column_name}>
                                    <td className="p-2 font-medium">{col.column_name}</td>
                                    <td className="p-2 text-gray-400">{col.data_type}</td>
                                    <td className="p-2">
                                        <select
                                            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white"
                                            value={mappings[col.column_name] || ''}
                                            onChange={e => setMappings({ ...mappings, [col.column_name]: e.target.value })}
                                        >
                                            <option value="">-- Skip/Null --</option>
                                            {FAKER_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-auto border-t border-gray-700 pt-4">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Row Count</label>
                    <input
                        type="number"
                        value={rowCount}
                        onChange={e => setRowCount(parseInt(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={!selectedTable || isGenerating}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold disabled:opacity-50"
                >
                    {isGenerating ? 'Generating...' : 'Generate Data'}
                </button>

                <div className="mt-4 bg-black/50 p-2 rounded h-24 overflow-y-auto text-xs font-mono text-green-400">
                    {log.length === 0 ? <span className="text-gray-600">Logs will appear here...</span> : log.map((l, i) => <div key={i}>{l}</div>)}
                </div>
            </div>
        </div>
    );
};
