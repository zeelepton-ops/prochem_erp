import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@services/api';
import { FaArrowLeft } from 'react-icons/fa';

export const CreateMaterialTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    batchNumber: '',
    materialId: '',
    testDate: '',
    status: 'pending',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.instance.post('/material-tests', {
        batchNumber: form.batchNumber,
        materialId: form.materialId,
        testDate: form.testDate,
        status: form.status,
      });
      navigate('/material-tests');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create material test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/material-tests')}
        className="flex items-center gap-2 text-green-600 hover:text-green-800 mb-6"
      >
        <FaArrowLeft /> Back
      </button>

      <h1 className="text-4xl font-bold mb-8">Create Material Test</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
          <input
            type="text"
            name="batchNumber"
            value={form.batchNumber}
            onChange={handleChange}
            required
            placeholder="BATCH-001"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Material ID</label>
          <input
            type="text"
            name="materialId"
            value={form.materialId}
            onChange={handleChange}
            required
            placeholder="Enter material ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Test Date</label>
          <input
            type="date"
            name="testDate"
            value={form.testDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition"
          >
            {loading ? 'Creating...' : 'Create Material Test'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/material-tests')}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
