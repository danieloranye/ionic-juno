import { useEffect, useState } from 'react';
import { faker } from '@faker-js/faker';
import { api } from '../api/adapter';

// TODO: Implement custom domains logic here or import it
// For now, hardcode some faker mapping options

const FAKER_OPTIONS = [
    // Person
    { label: 'Person - Full Name', value: 'person.fullName' },
    { label: 'Person - First Name', value: 'person.firstName' },
    { label: 'Person - Last Name', value: 'person.lastName' },
    { label: 'Person - Middle Name', value: 'person.middleName' },
    { label: 'Person - Prefix', value: 'person.prefix' },
    { label: 'Person - Suffix', value: 'person.suffix' },
    { label: 'Person - Job Title', value: 'person.jobTitle' },
    { label: 'Person - Job Area', value: 'person.jobArea' },
    { label: 'Person - Bio', value: 'person.bio' },
    { label: 'Person - Gender', value: 'person.gender' },

    // Internet
    { label: 'Internet - Email', value: 'internet.email' },
    { label: 'Internet - Username', value: 'internet.username' },
    { label: 'Internet - URL', value: 'internet.url' },
    { label: 'Internet - Domain Name', value: 'internet.domainName' },
    { label: 'Internet - IP Address', value: 'internet.ip' },
    { label: 'Internet - IPv6', value: 'internet.ipv6' },
    { label: 'Internet - User Agent', value: 'internet.userAgent' },
    { label: 'Internet - Password', value: 'internet.password' },
    { label: 'Internet - MAC Address', value: 'internet.mac' },

    // Location
    { label: 'Location - City', value: 'location.city' },
    { label: 'Location - Country', value: 'location.country' },
    { label: 'Location - State', value: 'location.state' },
    { label: 'Location - Street Address', value: 'location.streetAddress' },
    { label: 'Location - Zip Code', value: 'location.zipCode' },
    { label: 'Location - Latitude', value: 'location.latitude' },
    { label: 'Location - Longitude', value: 'location.longitude' },
    { label: 'Location - Time Zone', value: 'location.timeZone' },

    // Company
    { label: 'Company - Name', value: 'company.name' },
    { label: 'Company - Catchphrase', value: 'company.catchPhrase' },
    { label: 'Company - Business Type', value: 'company.buzzPhrase' },

    // Commerce
    { label: 'Commerce - Product Name', value: 'commerce.productName' },
    { label: 'Commerce - Product Description', value: 'commerce.productDescription' },
    { label: 'Commerce - Price', value: 'commerce.price' },
    { label: 'Commerce - Department', value: 'commerce.department' },
    { label: 'Commerce - Product Material', value: 'commerce.productMaterial' },
    { label: 'Commerce - Product Adjective', value: 'commerce.productAdjective' },

    // Finance
    { label: 'Finance - Account Name', value: 'finance.accountName' },
    { label: 'Finance - IBAN', value: 'finance.iban' },
    { label: 'Finance - BIC', value: 'finance.bic' },
    { label: 'Finance - Amount', value: 'finance.amount' },
    { label: 'Finance - Transaction Type', value: 'finance.transactionType' },
    { label: 'Finance - Currency Code', value: 'finance.currencyCode' },
    { label: 'Finance - Currency Name', value: 'finance.currencyName' },
    { label: 'Finance - Credit Card Number', value: 'finance.creditCardNumber' },
    { label: 'Finance - Credit Card CVV', value: 'finance.creditCardCVV' },

    // Date & Time
    { label: 'Date - Past', value: 'date.past' },
    { label: 'Date - Future', value: 'date.future' },
    { label: 'Date - Recent', value: 'date.recent' },
    { label: 'Date - Birthdate', value: 'date.birthdate' },
    { label: 'Date - Month', value: 'date.month' },
    { label: 'Date - Weekday', value: 'date.weekday' },

    // Phone
    { label: 'Phone - Number', value: 'phone.number' },
    { label: 'Phone - IMEI', value: 'phone.imei' },

    // Vehicle
    { label: 'Vehicle - Type', value: 'vehicle.type' },
    { label: 'Vehicle - Manufacturer', value: 'vehicle.manufacturer' },
    { label: 'Vehicle - Model', value: 'vehicle.model' },
    { label: 'Vehicle - VIN', value: 'vehicle.vin' },
    { label: 'Vehicle - Fuel', value: 'vehicle.fuel' },

    // Custom - Medical
    { label: 'Medical - Blood Type', value: 'custom.bloodType' },
    { label: 'Medical - Vaccine Name', value: 'custom.vaccine' },
    { label: 'Medical - Diagnosis', value: 'custom.diagnosis' },

    // Custom - Education
    { label: 'Education - University', value: 'custom.university' },
    { label: 'Education - Degree', value: 'custom.degree' },
    { label: 'Education - GPA', value: 'custom.gpa' },
    { label: 'Education - Course', value: 'custom.course' },

    // Custom - Insurance
    { label: 'Insurance - Policy Number', value: 'custom.policy' },
    { label: 'Insurance - Policy Type', value: 'custom.policyType' },
    { label: 'Insurance - Claim Number', value: 'custom.claimNumber' },

    // Custom - ID Numbers
    { label: 'ID - SSN', value: 'custom.ssn' },
    { label: 'ID - Passport Number', value: 'custom.passport' },
    { label: 'ID - Driver License', value: 'custom.driverLicense' },
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
            const vaccines = ['Pfizer', 'Moderna', 'AstraZeneca', 'J&J', 'Sinovac', 'Novavax', 'Sputnik V'];
            return vaccines[Math.floor(Math.random() * vaccines.length)];
        }
        if (method === 'custom.policy') {
            return 'POL-' + faker.string.alphanumeric(8).toUpperCase();
        }
        if (method === 'custom.bloodType') {
            const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
            return bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
        }
        if (method === 'custom.diagnosis') {
            const diagnoses = ['Hypertension', 'Type 2 Diabetes', 'Asthma', 'Migraine', 'Arthritis', 'Depression', 'Anxiety', 'GERD'];
            return diagnoses[Math.floor(Math.random() * diagnoses.length)];
        }
        if (method === 'custom.university') {
            const universities = ['Harvard University', 'MIT', 'Stanford University', 'Oxford University', 'Cambridge University', 'Yale University', 'Princeton University', 'Columbia University'];
            return universities[Math.floor(Math.random() * universities.length)];
        }
        if (method === 'custom.degree') {
            const degrees = ['Bachelor of Science', 'Bachelor of Arts', 'Master of Science', 'Master of Arts', 'MBA', 'PhD', 'Associate Degree'];
            return degrees[Math.floor(Math.random() * degrees.length)];
        }
        if (method === 'custom.gpa') {
            return (Math.random() * 1.5 + 2.5).toFixed(2); // GPA between 2.5 and 4.0
        }
        if (method === 'custom.course') {
            const courses = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering', 'Business Administration', 'Psychology', 'Economics', 'Literature'];
            return courses[Math.floor(Math.random() * courses.length)];
        }
        if (method === 'custom.policyType') {
            const policyTypes = ['Life Insurance', 'Health Insurance', 'Auto Insurance', 'Home Insurance', 'Travel Insurance', 'Disability Insurance'];
            return policyTypes[Math.floor(Math.random() * policyTypes.length)];
        }
        if (method === 'custom.claimNumber') {
            return 'CLM-' + faker.string.numeric(10);
        }
        if (method === 'custom.ssn') {
            return faker.string.numeric(3) + '-' + faker.string.numeric(2) + '-' + faker.string.numeric(4);
        }
        if (method === 'custom.passport') {
            return faker.string.alpha(2).toUpperCase() + faker.string.numeric(7);
        }
        if (method === 'custom.driverLicense') {
            return faker.string.alpha(1).toUpperCase() + faker.string.numeric(7);
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
