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

    const deliveryNotes = await prisma.deliveryNote.findMany({
      skip,
      take: limit,
      include: {
        salesOrder: true,
        customer: true,
        createdByUser: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.deliveryNote.count()

    return NextResponse.json({
      data: deliveryNotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching delivery notes:', error)
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
    const { salesOrderId, customerId, deliveryDate } = body

    if (!salesOrderId || !customerId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const deliveryNote = await prisma.deliveryNote.create({
      data: {
        noteNo: `DN-${Date.now()}`,
        salesOrderId,
        customerId,
        deliveryDate: new Date(deliveryDate || new Date()),
        status: 'PENDING',
        createdBy: (session.user as any).id,
      },
      include: {
        salesOrder: true,
        customer: true,
      },
    })

    return NextResponse.json(deliveryNote, { status: 201 })
  } catch (error: any) {
    console.error('Error creating delivery note:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
