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

    const test = await prisma.materialTest.findUnique({
      where: { id: params.id },
      include: {
        material: true,
        testedByUser: { select: { id: true, name: true, email: true } },
      },
    })

    if (!test) {
      return NextResponse.json(
        { message: 'Material test not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(test)
  } catch (error: any) {
    console.error('Error fetching material test:', error)
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
    const { result, remarks } = body

    const test = await prisma.materialTest.update({
      where: { id: params.id },
      data: {
        ...(result && { result }),
        ...(remarks !== undefined && { remarks }),
      },
      include: {
        material: true,
        testedByUser: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(test)
  } catch (error: any) {
    console.error('Error updating material test:', error)
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

    await prisma.materialTest.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Material test deleted' })
  } catch (error: any) {
    console.error('Error deleting material test:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
