import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@services/api';
import { FaArrowLeft } from 'react-icons/fa';

export const CreateSalesOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    customerId: '',
    requiredDeliveryDate: '',
    totalAmount: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.instance.post('/sales-orders', {
        customerId: form.customerId,
        requiredDeliveryDate: form.requiredDeliveryDate,
        totalAmount: parseFloat(form.totalAmount),
      });
      navigate('/sales-orders');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create sales order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/sales-orders')}
        className="flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-6"
      >
        <FaArrowLeft /> Back
      </button>

      <h1 className="text-4xl font-bold mb-8">Create Sales Order</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Customer ID</label>
          <input
            type="text"
            name="customerId"
            value={form.customerId}
            onChange={handleChange}
            required
            placeholder="Enter customer ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Required Delivery Date</label>
          <input
            type="date"
            name="requiredDeliveryDate"
            value={form.requiredDeliveryDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
          <input
            type="number"
            name="totalAmount"
            value={form.totalAmount}
            onChange={handleChange}
            required
            step="0.01"
            placeholder="0.00"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition"
          >
            {loading ? 'Creating...' : 'Create Sales Order'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/sales-orders')}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
