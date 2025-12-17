import { useState } from 'react';
import { ConnectionForm } from './components/ConnectionForm';
import { TableCreator } from './components/TableCreator';
import { DataGenerator } from './components/DataGenerator';
import type { DBConfig, ViewState } from './types';
import { api } from './api/adapter';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [view, setView] = useState<ViewState>('connect');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleConnect = async (config: DBConfig) => {
    setIsLoading(true);
    setError(undefined);
    try {
      const res = await api.connectDB(config);
      if (res.success) {
        setIsConnected(true);
        setView('generate');
      } else {
        setError(res.error || 'Failed to connect');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Maybe close connection via IPC? For now just reset state
    setIsConnected(false);
    setView('connect');
  };

  if (!isConnected) {
    return <ConnectionForm onConnect={handleConnect} isLoading={isLoading} error={error} />;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-blue-400">PG Generator</h1>
          <div className="text-xs text-gray-500 mt-1">v0.1.0</div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setView('generate')}
            className={`w-full text-left px-4 py-2 rounded transition-colors ${view === 'generate' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
          >
            Generate Data
          </button>
          <button
            onClick={() => setView('create-table')}
            className={`w-full text-left px-4 py-2 rounded transition-colors ${view === 'create-table' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
          >
            Create Table
          </button>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-900/50 hover:bg-red-900 text-red-200 rounded border border-red-800 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {view === 'generate' && <DataGenerator />}
        {view === 'create-table' && <TableCreator />}
      </div>
    </div>
  );
}

export default App;
