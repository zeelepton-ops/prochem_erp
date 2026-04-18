import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@services/api';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

interface MaterialTest {
  id: string;
  batchNumber: string;
  testDate: string;
  status: string;
  materialId: string;
}

export const MaterialTestsPage: React.FC = () => {
  const [tests, setTests] = useState<MaterialTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await apiClient.get('/material-tests');
      setTests(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch material tests', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTest = async (id: string) => {
    if (confirm('Delete this material test?')) {
      try {
        await apiClient.delete(`/material-tests/${id}`);
        setTests(tests.filter(t => t.id !== id));
      } catch (err) {
        alert('Failed to delete test');
      }
    }
  };

  const filtered = tests.filter(t =>
    t.batchNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-1 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-xl font-bold">Material Testing</h1>
        <Link
          to="/material-tests/new"
          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-none font-medium flex items-center gap-1 text-xs"
        >
          <FaPlus /> New Test
        </Link>
      </div>

      <div className="bg-white rounded-none shadow-md p-1 mb-1">
        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-none">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by batch number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-50 flex-1 outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-none shadow-md overflow-hidden">
        {loading ? (
          <div className="p-2 text-center text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-2 text-center text-gray-500 text-sm">No material tests found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-2 py-1 text-left font-semibold text-sm">Batch Number</th>
                <th className="px-2 py-1 text-left font-semibold text-sm">Test Date</th>
                <th className="px-2 py-1 text-left font-semibold text-sm">Status</th>
                <th className="px-2 py-1 text-center font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((test) => (
                <tr key={test.id} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-1 font-medium text-sm">{test.batchNumber}</td>
                  <td className="px-2 py-1 text-sm">{new Date(test.testDate).toLocaleDateString()}</td>
                  <td className="px-2 py-1">
                    <span className={`px-1 py-0.5 rounded-none text-xs font-medium ${
                      test.status === 'passed' ? 'bg-green-100 text-green-800' :
                      test.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {test.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <Link to={`/material-tests/${test.id}`} className="text-blue-600 hover:text-blue-800">
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => deleteTest(test.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
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
