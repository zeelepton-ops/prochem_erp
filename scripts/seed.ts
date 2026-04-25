import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  try {
    // Clear existing data (optional - comment out to preserve data)
    // await prisma.user.deleteMany({})
    // await prisma.supplier.deleteMany({})
    // await prisma.customer.deleteMany({})
    // await prisma.rawMaterial.deleteMany({})
    // await prisma.product.deleteMany({})

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@bmm.local' },
      update: {},
      create: {
        email: 'admin@bmm.local',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        active: true,
      },
    })
    console.log('✅ Admin user created:', adminUser.email)

    // Create manager user
    const managerPassword = await bcrypt.hash('manager123', 10)
    const managerUser = await prisma.user.upsert({
      where: { email: 'manager@bmm.local' },
      update: {},
      create: {
        email: 'manager@bmm.local',
        name: 'Manager User',
        password: managerPassword,
        role: 'MANAGER',
        active: true,
      },
    })
    console.log('✅ Manager user created:', managerUser.email)

    // Create operator user
    const operatorPassword = await bcrypt.hash('operator123', 10)
    const operatorUser = await prisma.user.upsert({
      where: { email: 'operator@bmm.local' },
      update: {},
      create: {
        email: 'operator@bmm.local',
        name: 'Operator User',
        password: operatorPassword,
        role: 'OPERATOR',
        active: true,
      },
    })
    console.log('✅ Operator user created:', operatorUser.email)

    // Create sample suppliers
    const suppliers = await Promise.all([
      prisma.supplier.upsert({
        where: { email: 'supplier1@example.com' },
        update: {},
        create: {
          name: 'Premium Building Materials Co.',
          email: 'supplier1@example.com',
          phone: '+1-555-0101',
          address: '123 Supplier Street',
          city: 'New York',
          state: 'NY',
          pincode: '10001',
          active: true,
        },
      }),
      prisma.supplier.upsert({
        where: { email: 'supplier2@example.com' },
        update: {},
        create: {
          name: 'Quality Cement Industries',
          email: 'supplier2@example.com',
          phone: '+1-555-0102',
          address: '456 Industrial Ave',
          city: 'Chicago',
          state: 'IL',
          pincode: '60601',
          active: true,
        },
      }),
      prisma.supplier.upsert({
        where: { email: 'supplier3@example.com' },
        update: {},
        create: {
          name: 'Steel & Aggregates Ltd.',
          email: 'supplier3@example.com',
          phone: '+1-555-0103',
          address: '789 Steel Road',
          city: 'Houston',
          state: 'TX',
          pincode: '77001',
          active: true,
        },
      }),
    ])
    console.log('✅ Created', suppliers.length, 'suppliers')

    // Create sample customers
    const customers = await Promise.all([
      prisma.customer.upsert({
        where: { email: 'customer1@example.com' },
        update: {},
        create: {
          name: 'ABC Construction Company',
          email: 'customer1@example.com',
          phone: '+1-555-1001',
          address: '100 Main Street',
          city: 'Los Angeles',
          state: 'CA',
          pincode: '90001',
          active: true,
        },
      }),
      prisma.customer.upsert({
        where: { email: 'customer2@example.com' },
        update: {},
        create: {
          name: 'XYZ Builders Inc.',
          email: 'customer2@example.com',
          phone: '+1-555-1002',
          address: '200 Commerce Ave',
          city: 'Miami',
          state: 'FL',
          pincode: '33101',
          active: true,
        },
      }),
      prisma.customer.upsert({
        where: { email: 'customer3@example.com' },
        update: {},
        create: {
          name: 'Metropolitan Development Corp',
          email: 'customer3@example.com',
          phone: '+1-555-1003',
          address: '300 Park Avenue',
          city: 'Boston',
          state: 'MA',
          pincode: '02101',
          active: true,
        },
      }),
    ])
    console.log('✅ Created', customers.length, 'customers')

    // Create sample raw materials
    const materials = await Promise.all([
      prisma.rawMaterial.upsert({
        where: { code: 'RM001' },
        update: {},
        create: {
          code: 'RM001',
          name: 'Portland Cement',
          description: 'High quality Portland cement for construction',
          unit: 'bag(50kg)',
          price: 450.0,
          active: true,
        },
      }),
      prisma.rawMaterial.upsert({
        where: { code: 'RM002' },
        update: {},
        create: {
          code: 'RM002',
          name: 'Reinforcement Steel',
          description: 'TMT reinforcement steel bars',
          unit: 'kg',
          price: 65.0,
          active: true,
        },
      }),
      prisma.rawMaterial.upsert({
        where: { code: 'RM003' },
        update: {},
        create: {
          code: 'RM003',
          name: 'Aggregates (Sand)',
          description: 'Construction grade sand',
          unit: 'ton',
          price: 1200.0,
          active: true,
        },
      }),
      prisma.rawMaterial.upsert({
        where: { code: 'RM004' },
        update: {},
        create: {
          code: 'RM004',
          name: 'Aggregates (Gravel)',
          description: 'Construction grade gravel',
          unit: 'ton',
          price: 1500.0,
          active: true,
        },
      }),
      prisma.rawMaterial.upsert({
        where: { code: 'RM005' },
        update: {},
        create: {
          code: 'RM005',
          name: 'Bricks',
          description: 'Clay bricks for masonry',
          unit: 'piece',
          price: 8.0,
          active: true,
        },
      }),
    ])
    console.log('✅ Created', materials.length, 'raw materials')

    // Create sample products
    const products = await Promise.all([
      prisma.product.upsert({
        where: { code: 'PROD001' },
        update: {},
        create: {
          code: 'PROD001',
          name: 'Concrete Mix M20',
          description: 'Ready mix concrete M20 grade',
          unit: 'cubic meter',
          price: 3500.0,
          active: true,
        },
      }),
      prisma.product.upsert({
        where: { code: 'PROD002' },
        update: {},
        create: {
          code: 'PROD002',
          name: 'Concrete Mix M30',
          description: 'Ready mix concrete M30 grade',
          unit: 'cubic meter',
          price: 4200.0,
          active: true,
        },
      }),
      prisma.product.upsert({
        where: { code: 'PROD003' },
        update: {},
        create: {
          code: 'PROD003',
          name: 'Precast Blocks',
          description: 'Interlocking precast blocks',
          unit: 'pack(10 pieces)',
          price: 2500.0,
          active: true,
        },
      }),
      prisma.product.upsert({
        where: { code: 'PROD004' },
        update: {},
        create: {
          code: 'PROD004',
          name: 'Brick Pavers',
          description: 'Clay brick pavers for outdoor use',
          unit: 'pack(50 pieces)',
          price: 3000.0,
          active: true,
        },
      }),
    ])
    console.log('✅ Created', products.length, 'products')

    // Create sample purchase order
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        orderNo: `PO-${Date.now()}`,
        supplierId: suppliers[0].id,
        orderDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        totalAmount: 50000.0,
        status: 'PENDING',
        createdBy: adminUser.id,
        items: {
          create: [
            {
              materialId: materials[0].id,
              quantity: 100,
              unitPrice: 450.0,
              totalPrice: 45000.0,
            },
            {
              materialId: materials[2].id,
              quantity: 10,
              unitPrice: 1200.0,
              totalPrice: 12000.0,
            },
          ],
        },
      },
    })
    console.log('✅ Created sample purchase order:', purchaseOrder.orderNo)

    // Create sample sales order
    const salesOrder = await prisma.salesOrder.create({
      data: {
        orderNo: `SO-${Date.now()}`,
        customerId: customers[0].id,
        orderDate: new Date(),
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        totalAmount: 75000.0,
        status: 'PENDING',
        createdBy: adminUser.id,
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 20,
              unitPrice: 3500.0,
              totalPrice: 70000.0,
            },
            {
              productId: products[2].id,
              quantity: 2,
              unitPrice: 2500.0,
              totalPrice: 5000.0,
            },
          ],
        },
      },
    })
    console.log('✅ Created sample sales order:', salesOrder.orderNo)

    console.log('\n✨ Database seeded successfully!')
    console.log('\n📝 Default Credentials:')
    console.log('   Admin:    admin@bmm.local / admin123')
    console.log('   Manager:  manager@bmm.local / manager123')
    console.log('   Operator: operator@bmm.local / operator123')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
