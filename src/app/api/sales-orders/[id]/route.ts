import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const salesOrder = await prisma.salesOrder.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        items: { include: { product: true } },
        createdByUser: { select: { id: true, name: true, email: true } },
      },
    })

    if (!salesOrder) {
      return NextResponse.json(
        { message: 'Sales order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(salesOrder)
  } catch (error: any) {
    console.error('Error fetching sales order:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, dueDate } = body

    const salesOrder = await prisma.salesOrder.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
      include: {
        customer: true,
        items: true,
      },
    })

    return NextResponse.json(salesOrder)
  } catch (error: any) {
    console.error('Error updating sales order:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await prisma.salesOrder.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Sales order deleted' })
  } catch (error: any) {
    console.error('Error deleting sales order:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
