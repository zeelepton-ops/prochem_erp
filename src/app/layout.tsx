import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import './../../styles/globals.css'

export const metadata: Metadata = {
  title: 'Building Materials Management System',
  description: 'Enterprise ERP for building materials management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
