import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { NextRequest, NextResponse } from 'next/server'

export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return null
  }

  return session
}

export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({ message }, { status })
}

export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status })
}
