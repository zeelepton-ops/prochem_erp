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

    const production = await prisma.production.findUnique({
      where: { id: params.id },
      include: {
        product: true,
        batchCard: true,
        createdByUser: { select: { id: true, name: true, email: true } },
      },
    })

    if (!production) {
      return NextResponse.json(
        { message: 'Production not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(production)
  } catch (error: any) {
    console.error('Error fetching production:', error)
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
    const { status, endDate } = body

    const production = await prisma.production.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(endDate && { endDate: new Date(endDate) }),
      },
      include: {
        product: true,
        batchCard: true,
      },
    })

    return NextResponse.json(production)
  } catch (error: any) {
    console.error('Error updating production:', error)
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

    await prisma.production.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Production deleted' })
  } catch (error: any) {
    console.error('Error deleting production:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
