import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@services/api';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

interface Production {
  id: string;
  batchNumber: string;
  productId: string;
  status: string;
  plannedQuantity: number;
  producedQuantity: number;
  createdAt: string;
}

export const ProductionPage: React.FC = () => {
  const [batches, setBatches] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await apiClient.get('/production');
      setBatches(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch production batches', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteBatch = async (id: string) => {
    if (confirm('Delete this production batch?')) {
      try {
        await apiClient.delete(`/production/${id}`);
        setBatches(batches.filter(b => b.id !== id));
      } catch (err) {
        alert('Failed to delete batch');
      }
    }
  };

  const filtered = batches.filter(b =>
    b.batchNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-1 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-xl font-bold">Production</h1>
        <Link
          to="/production/new"
          className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded-none font-medium flex items-center gap-1 text-xs"
        >
          <FaPlus /> New Batch
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
          <div className="p-2 text-center text-gray-500 text-sm">No production batches found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-2 py-1 text-left font-semibold text-sm">Batch Number</th>
                <th className="px-2 py-1 text-left font-semibold text-sm">Date</th>
                <th className="px-2 py-1 text-left font-semibold text-sm">Status</th>
                <th className="px-2 py-1 text-left font-semibold text-sm">Planned</th>
                <th className="px-2 py-1 text-left font-semibold text-sm">Produced</th>
                <th className="px-2 py-1 text-center font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((batch) => (
                <tr key={batch.id} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-1 font-medium text-sm">{batch.batchNumber}</td>
                  <td className="px-2 py-1 text-sm">{new Date(batch.createdAt).toLocaleDateString()}</td>
                  <td className="px-2 py-1">
                    <span className={`px-1 py-0.5 rounded-none text-xs font-medium ${
                      batch.status === 'completed' ? 'bg-green-100 text-green-800' :
                      batch.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{batch.plannedQuantity}</td>
                  <td className="px-6 py-4">{batch.producedQuantity}</td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <Link to={`/production/${batch.id}`} className="text-blue-600 hover:text-blue-800">
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => deleteBatch(batch.id)}
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
