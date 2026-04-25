'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {session?.user?.name}</span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              {(session?.user as any)?.role}
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Purchase Orders */}
          <Link href="/dashboard/purchase-orders">
            <div className="rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Purchase Orders
              </h3>
              <p className="text-gray-600">Manage supplier purchases</p>
            </div>
          </Link>

          {/* Sales Orders */}
          <Link href="/dashboard/sales-orders">
            <div className="rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Sales Orders
              </h3>
              <p className="text-gray-600">Manage customer orders</p>
            </div>
          </Link>

          {/* Inventory */}
          <Link href="/dashboard/inventory">
            <div className="rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Inventory
              </h3>
              <p className="text-gray-600">View materials & products</p>
            </div>
          </Link>

          {/* Production */}
          <Link href="/dashboard/production">
            <div className="rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Production
              </h3>
              <p className="text-gray-600">Track production batches</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
