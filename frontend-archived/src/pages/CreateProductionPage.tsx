import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@services/api';
import { FaArrowLeft } from 'react-icons/fa';

export const CreateProductionPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    batchNumber: '',
    productId: '',
    plannedQuantity: '',
    producedQuantity: '',
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
      await apiClient.instance.post('/production', {
        batchNumber: form.batchNumber,
        productId: form.productId,
        plannedQuantity: parseInt(form.plannedQuantity),
        producedQuantity: parseInt(form.producedQuantity),
        status: form.status,
      });
      navigate('/production');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create production batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/production')}
        className="flex items-center gap-2 text-orange-600 hover:text-orange-800 mb-6"
      >
        <FaArrowLeft /> Back
      </button>

      <h1 className="text-4xl font-bold mb-8">Create Production Batch</h1>

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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product ID</label>
          <input
            type="text"
            name="productId"
            value={form.productId}
            onChange={handleChange}
            required
            placeholder="Enter product ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Planned Quantity</label>
            <input
              type="number"
              name="plannedQuantity"
              value={form.plannedQuantity}
              onChange={handleChange}
              required
              min="0"
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Produced Quantity</label>
            <input
              type="number"
              name="producedQuantity"
              value={form.producedQuantity}
              onChange={handleChange}
              required
              min="0"
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition"
          >
            {loading ? 'Creating...' : 'Create Production Batch'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/production')}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
