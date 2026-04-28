import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@services/api';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

interface SalesOrder {
  id: string;
  soNumber: string;
  customerId: string;
  orderDate: string;
  status: string;
  totalAmount: number;
}

export const SalesOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get('/sales-orders');
      setOrders(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch sales orders', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id: string) => {
    if (confirm('Delete this sales order?')) {
      try {
        await apiClient.delete(`/sales-orders/${id}`);
        setOrders(orders.filter(o => o.id !== id));
      } catch (err) {
        alert('Failed to delete order');
      }
    }
  };

  const filtered = orders.filter(o =>
    o.soNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Sales Orders</h1>
        <Link
          to="/sales-orders/new"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
        >
          <FaPlus /> New Order
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by SO Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-50 flex-1 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No sales orders found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">SO Number</th>
                <th className="px-6 py-4 text-left font-semibold">Date</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Amount</th>
                <th className="px-6 py-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{order.soNumber}</td>
                  <td className="px-6 py-4">{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">${order.totalAmount?.toFixed(2) || '0.00'}</td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <Link to={`/sales-orders/${order.id}`} className="text-blue-600 hover:text-blue-800">
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => deleteOrder(order.id)}
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
