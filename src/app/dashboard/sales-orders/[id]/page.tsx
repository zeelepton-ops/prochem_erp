'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import apiService from '@/services/api'
import { format } from 'date-fns'
import { ChevronLeft } from 'lucide-react'

export default function SalesOrderDetail({
  params,
}: {
  params: { id: string }
}) {
  const { status } = useSession()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await apiService.getSalesOrder(params.id)
        setOrder(response.data)
        setNewStatus(response.data.status)
      } catch (error: any) {
        console.error('Error:', error)
        alert('Failed to load sales order')
        router.push('/dashboard/sales-orders')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router, params.id])

  const handleStatusUpdate = async () => {
    try {
      setUpdatingStatus(true)
      await apiService.updateSalesOrder(params.id, { status: newStatus })
      setOrder({ ...order, status: newStatus })
      alert('Status updated successfully')
    } catch (error: any) {
      console.error('Error:', error)
      alert('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) return <div className="p-6 text-center">Loading...</div>
  if (!order) return <div className="p-6 text-center">Order not found</div>

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/sales-orders"
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft size={20} />
          Back to Sales Orders
        </Link>

        <div className="rounded-lg bg-white p-8 shadow">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {order.orderNo}
              </h1>
              <p className="text-gray-600">
                Created on {format(new Date(order.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                order.status === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-800'
                  : order.status === 'CONFIRMED'
                  ? 'bg-blue-100 text-blue-800'
                  : order.status === 'RECEIVED'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {order.status}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Customer Information
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium text-gray-700">Name:</span>{' '}
                  {order.customer.name}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Email:</span>{' '}
                  {order.customer.email}
                </p>
                {order.customer.phone && (
                  <p>
                    <span className="font-medium text-gray-700">Phone:</span>{' '}
                    {order.customer.phone}
                  </p>
                )}
                {order.customer.address && (
                  <p>
                    <span className="font-medium text-gray-700">Address:</span>{' '}
                    {order.customer.address}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Order Details
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium text-gray-700">Order Date:</span>{' '}
                  {format(new Date(order.orderDate), 'MMM dd, yyyy')}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Due Date:</span>{' '}
                  {format(new Date(order.dueDate), 'MMM dd, yyyy')}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Total Amount:</span>{' '}
                  ${order.totalAmount.toFixed(2)}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Created By:</span>{' '}
                  {order.createdByUser.name}
                </p>
              </div>
            </div>
          </div>

          <div className="my-6 border-t border-gray-200"></div>

          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Order Items
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">
                    Product
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">
                    Unit Price
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">
                    Total Price
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">
                    Delivered
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.product.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      ${item.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.deliveredQty}/{item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="my-6 border-t border-gray-200"></div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Update Status
            </h3>
            <div className="flex gap-4">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="RECEIVED">Received</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={updatingStatus || newStatus === order.status}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
