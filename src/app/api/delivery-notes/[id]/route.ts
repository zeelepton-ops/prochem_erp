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

    const deliveryNote = await prisma.deliveryNote.findUnique({
      where: { id: params.id },
      include: {
        salesOrder: { include: { items: true } },
        customer: true,
        invoices: true,
        createdByUser: { select: { id: true, name: true, email: true } },
      },
    })

    if (!deliveryNote) {
      return NextResponse.json(
        { message: 'Delivery note not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(deliveryNote)
  } catch (error: any) {
    console.error('Error fetching delivery note:', error)
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
    const { status, deliveryDate } = body

    const deliveryNote = await prisma.deliveryNote.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(deliveryDate && { deliveryDate: new Date(deliveryDate) }),
      },
      include: {
        salesOrder: true,
        customer: true,
      },
    })

    return NextResponse.json(deliveryNote)
  } catch (error: any) {
    console.error('Error updating delivery note:', error)
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

    await prisma.deliveryNote.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Delivery note deleted' })
  } catch (error: any) {
    console.error('Error deleting delivery note:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
