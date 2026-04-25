import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const productions = await prisma.production.findMany({
      skip,
      take: limit,
      include: {
        product: true,
        batchCard: true,
        createdByUser: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.production.count()

    return NextResponse.json({
      data: productions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching productions:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { batchCardId, productId, quantity, startDate } = body

    if (!batchCardId || !productId || !quantity) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const production = await prisma.production.create({
      data: {
        productionNo: `PROD-${Date.now()}`,
        batchCardId,
        productId,
        quantity,
        startDate: new Date(startDate || new Date()),
        status: 'IN_PROGRESS',
        createdBy: (session.user as any).id,
      },
      include: {
        product: true,
        batchCard: true,
      },
    })

    return NextResponse.json(production, { status: 201 })
  } catch (error: any) {
    console.error('Error creating production:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
