import React, { useState } from 'react';
import {
  Home,
  Users,
  FileText,
  Search,
  RefreshCw,
  Download,
  User,
  Truck,
  Factory,
  Zap,
  ArrowUpDown,
  CheckSquare,
  Square
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const navItems = [
    { id: 'dashboard', label: 'My First List', icon: Home, active: true },
    { id: 'accounts', label: 'ACCOUNTS', isHeader: true },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'customers', label: 'CUSTOMERS', isHeader: true },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
  ];

  const dummyData = [
    {
      id: 'CR-001',
      project: 'Chemical Synthesis A',
      segment: ['Hazardous', 'Organic'],
      standards: ['ISO 14001', 'EPA Reg'],
      icon: Truck
    },
    {
      id: 'CR-002',
      project: 'Polymer Production',
      segment: ['Industrial', 'Synthetic'],
      standards: ['OSHA', 'REACH'],
      icon: Factory
    },
    {
      id: 'CR-003',
      project: 'Biofuel Extraction',
      segment: ['Renewable', 'Bio-based'],
      standards: ['ASTM', 'ISO 9001'],
      icon: Zap
    },
  ];

  const toggleRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleAllRows = () => {
    setSelectedRows(prev =>
      prev.length === dummyData.length ? [] : dummyData.map(row => row.id)
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Dark Sidebar */}
      <div className="w-64 bg-slate-950 text-white flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <Factory className="w-8 h-8 text-purple-400" />
            <h1 className="text-xl font-bold">Prochem Online Control</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            if (item.isHeader) {
              return (
                <div key={item.id} className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2">
                  {item.label}
                </div>
              );
            }
            return (
              <button
                key={item.id}
                onClick={() => {}}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  item.active
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon && React.createElement(item.icon, { className: 'w-5 h-5' })}
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Profile Menu */}
        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-slate-300 hover:bg-slate-800 hover:text-white">
            <User className="w-5 h-5" />
            <span className="text-sm">Profile</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Main Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">Dashboard / Active Inventories</h2>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">JD</div>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium">SM</div>
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">AB</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <Download className="w-4 h-4" />
                <span className="text-sm">Export</span>
              </button>
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Active
              </div>
            </div>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Filtered by</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              8 Parameters
            </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button onClick={toggleAllRows} className="text-gray-400 hover:text-gray-600">
                      {selectedRows.length === dummyData.length ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Chemical Release ID</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Project Name</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Compliance Segment</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Compliance Standards</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dummyData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <button onClick={() => toggleRow(row.id)} className="text-gray-400 hover:text-gray-600">
                        {selectedRows.includes(row.id) ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.project}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {row.segment.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {row.standards.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <row.icon className="w-5 h-5 text-gray-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
