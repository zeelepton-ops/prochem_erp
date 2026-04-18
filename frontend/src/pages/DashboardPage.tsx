import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@context/authStore';
import { api } from '@services/api';
import { FaBox, FaShoppingCart, FaCog, FaTruck, FaFlask, FaChartBar } from 'react-icons/fa';

interface DashboardStats {
  purchaseOrders: number;
  salesOrders: number;
  production: number;
  deliveries: number;
  materialTests: number;
}

export const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<DashboardStats>({
    purchaseOrders: 0,
    salesOrders: 0,
    production: 0,
    deliveries: 0,
    materialTests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [po, so, prod, dn, mt] = await Promise.all([
          api.procurement.listPurchaseOrders(),
          api.salesOrders.listSalesOrders(),
          api.production.listBatchCards(),
          api.deliveryNotes.listDeliveryNotes(),
          api.qc.listQCTests(),
        ]);

        setStats({
          purchaseOrders: po.data?.data?.length || 0,
          salesOrders: so.data?.data?.length || 0,
          production: prod.data?.data?.length || 0,
          deliveries: dn.data?.data?.length || 0,
          materialTests: mt.data?.data?.length || 0,
        });
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const modules = [
    {
      title: 'Purchase Orders',
      icon: FaShoppingCart,
      count: stats.purchaseOrders,
      path: '/purchase-orders',
      color: 'blue',
    },
    {
      title: 'Raw Materials',
      icon: FaBox,
      count: stats.materialTests,
      path: '/material-tests',
      color: 'green',
    },
    {
      title: 'Production',
      icon: FaCog,
      count: stats.production,
      path: '/production',
      color: 'orange',
    },
    {
      title: 'Sales Orders',
      icon: FaChartBar,
      count: stats.salesOrders,
      path: '/sales-orders',
      color: 'purple',
    },
    {
      title: 'Deliveries',
      icon: FaTruck,
      count: stats.deliveries,
      path: '/delivery-notes',
      color: 'red',
    },
    {
      title: 'Audit Logs',
      icon: FaFlask,
      count: 0,
      path: '/audit-logs',
      color: 'gray',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome, <span className="font-semibold">{user?.firstName} {user?.lastName}</span> • {user?.role}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {modules.map((module) => {
            const Icon = module.icon;
            const colorClasses = {
              blue: 'bg-blue-50 border-blue-200',
              green: 'bg-green-50 border-green-200',
              orange: 'bg-orange-50 border-orange-200',
              purple: 'bg-purple-50 border-purple-200',
              red: 'bg-red-50 border-red-200',
              gray: 'bg-gray-50 border-gray-200',
            };

            const iconColorClasses = {
              blue: 'text-blue-600',
              green: 'text-green-600',
              orange: 'text-orange-600',
              purple: 'text-purple-600',
              red: 'text-red-600',
              gray: 'text-gray-600',
            };

            return (
              <Link
                key={module.path}
                to={module.path}
                className={`border-2 rounded-xl p-6 hover:shadow-lg transition transform hover:scale-105 cursor-pointer ${
                  colorClasses[module.color as keyof typeof colorClasses]
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{module.title}</p>
                    <p className="text-3xl font-bold mt-2">
                      {loading ? '...' : module.count}
                    </p>
                  </div>
                  <Icon
                    className={`text-4xl ${
                      iconColorClasses[module.color as keyof typeof iconColorClasses]
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/purchase-orders/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              + Create Purchase Order
            </Link>
            <Link
              to="/sales-orders/new"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              + Create Sales Order
            </Link>
            <Link
              to="/material-tests/new"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              + Test Material
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
