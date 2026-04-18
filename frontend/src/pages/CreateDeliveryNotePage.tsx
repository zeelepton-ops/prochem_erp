import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@services/api';
import { FaArrowLeft } from 'react-icons/fa';

export const CreateDeliveryNotePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    salesOrderId: '',
    deliveryDate: '',
    carrier: '',
    trackingNumber: '',
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
      await apiClient.instance.post('/delivery-notes', {
        salesOrderId: form.salesOrderId,
        deliveryDate: form.deliveryDate,
        carrier: form.carrier,
        trackingNumber: form.trackingNumber,
        status: form.status,
      });
      navigate('/delivery-notes');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create delivery note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/delivery-notes')}
        className="flex items-center gap-2 text-red-600 hover:text-red-800 mb-6"
      >
        <FaArrowLeft /> Back
      </button>

      <h1 className="text-4xl font-bold mb-8">Create Delivery Note</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sales Order ID</label>
          <input
            type="text"
            name="salesOrderId"
            value={form.salesOrderId}
            onChange={handleChange}
            required
            placeholder="Enter sales order ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date</label>
          <input
            type="date"
            name="deliveryDate"
            value={form.deliveryDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Carrier</label>
          <input
            type="text"
            name="carrier"
            value={form.carrier}
            onChange={handleChange}
            required
            placeholder="e.g., FedEx, UPS, DHL"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
          <input
            type="text"
            name="trackingNumber"
            value={form.trackingNumber}
            onChange={handleChange}
            required
            placeholder="Enter tracking number"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="in-transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition"
          >
            {loading ? 'Creating...' : 'Create Delivery Note'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/delivery-notes')}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
