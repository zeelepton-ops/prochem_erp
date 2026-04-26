'use client'

// Build: 2026-04-26
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
          Building Materials Management
        </h1>
        <p className="mb-8 text-center text-gray-600">
          Enterprise ERP System
        </p>

        {session ? (
          <div className="space-y-4">
            <p className="text-center text-gray-700">
              Welcome, {session.user?.name || session.user?.email}
            </p>
            <Link
              href="/dashboard"
              className="block w-full rounded-md bg-blue-600 px-4 py-2 text-center font-medium text-white hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="block w-full rounded-md bg-blue-600 px-4 py-2 text-center font-medium text-white hover:bg-blue-700"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="block w-full rounded-md border-2 border-blue-600 px-4 py-2 text-center font-medium text-blue-600 hover:bg-blue-50"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
