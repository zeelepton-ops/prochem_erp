import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaDownload, FaInfo } from 'react-icons/fa';

interface AuditLog {
  id: string;
  entityType: string;
  action: string;
  userId: string;
  timestamp: string;
  oldValues: any;
  newValues: any;
}

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    // Simulate audit logs data until API is implemented
    const mockLogs: AuditLog[] = [
      {
        id: '1',
        entityType: 'purchase_order',
        action: 'create',
        userId: 'admin@bmm.local',
        timestamp: new Date().toISOString(),
        oldValues: {},
        newValues: { poNumber: 'PO-001', supplierId: '123' },
      },
      {
        id: '2',
        entityType: 'sales_order',
        action: 'update',
        userId: 'admin@bmm.local',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        oldValues: { status: 'pending' },
        newValues: { status: 'confirmed' },
      },
    ];
    setLogs(mockLogs);
    setLoading(false);
  }, []);

  const filtered = logs.filter(log => {
    const matchSearch = log.entityType?.toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === 'all' || log.action === filterAction;
    const matchEntity = filterEntity === 'all' || log.entityType === filterEntity;
    const logDate = new Date(log.timestamp);
    const matchDateFrom = !dateFrom || logDate >= new Date(dateFrom);
    const matchDateTo = !dateTo || logDate <= new Date(dateTo);
    
    return matchSearch && matchAction && matchEntity && matchDateFrom && matchDateTo;
  });

  const downloadReport = () => {
    const csv = [
      ['Entity Type', 'Action', 'User ID', 'Timestamp', 'Old Values', 'New Values'],
      ...filtered.map(log => [
        log.entityType,
        log.action,
        log.userId,
        new Date(log.timestamp).toLocaleString(),
        JSON.stringify(log.oldValues || {}),
        JSON.stringify(log.newValues || {}),
      ]),
    ];

    const csvContent = csv.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const actions = [...new Set(logs.map(l => l.action))];
  const entities = [...new Set(logs.map(l => l.entityType))];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Audit Logs & Reporting</h1>
        <button
          onClick={downloadReport}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
        >
          <FaDownload /> Download Report
        </button>
      </div>

      {/* Info Alert */}
      {showInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex justify-between items-start">
          <div className="flex gap-3">
            <FaInfo className="text-blue-600 mt-1" />
            <div>
              <p className="font-semibold text-blue-900">Timestamp-Based Reporting</p>
              <p className="text-sm text-blue-800">Track all system changes with date filtering. Filter by entity type, action, and date range for complete audit trails.</p>
            </div>
          </div>
          <button
            onClick={() => setShowInfo(false)}
            className="text-blue-600 text-xl"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <div className="flex items-center gap-2 border rounded-lg px-3">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 py-2 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Entity Type</label>
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none"
            >
              <option value="all">All</option>
              {entities.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Action</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none"
            >
              <option value="all">All</option>
              {actions.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Total Logs</p>
          <p className="text-3xl font-bold">{logs.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
          <p className="text-gray-600 text-sm">Created</p>
          <p className="text-3xl font-bold text-green-600">{logs.filter(l => l.action === 'create').length}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4 border border-blue-200">
          <p className="text-gray-600 text-sm">Updated</p>
          <p className="text-3xl font-bold text-blue-600">{logs.filter(l => l.action === 'update').length}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 border border-red-200">
          <p className="text-gray-600 text-sm">Deleted</p>
          <p className="text-3xl font-bold text-red-600">{logs.filter(l => l.action === 'delete').length}</p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No audit logs found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Timestamp</th>
                <th className="px-6 py-4 text-left font-semibold">Entity</th>
                <th className="px-6 py-4 text-left font-semibold">Action</th>
                <th className="px-6 py-4 text-left font-semibold">User ID</th>
                <th className="px-6 py-4 text-left font-semibold">Changes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium">{log.entityType}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      log.action === 'create' ? 'bg-green-100 text-green-800' :
                      log.action === 'update' ? 'bg-blue-100 text-blue-800' :
                      log.action === 'delete' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{log.userId}</td>
                  <td className="px-6 py-4 text-sm">
                    <details className="cursor-pointer">
                      <summary className="text-blue-600 hover:underline">View</summary>
                      <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                        {log.oldValues && Object.keys(log.oldValues).length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold">Before: </span>
                            {JSON.stringify(log.oldValues)}
                          </div>
                        )}
                        {log.newValues && Object.keys(log.newValues).length > 0 && (
                          <div>
                            <span className="font-semibold">After: </span>
                            {JSON.stringify(log.newValues)}
                          </div>
                        )}
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
