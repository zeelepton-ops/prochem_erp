import { db } from '../src/config/database';
import { hashPassword } from '../src/utils/password';

async function seedAdmin() {
  try {
    console.log('🌱 Seeding admin user...');

    const hashedPassword = await hashPassword('admin123');

    const query = `
      INSERT INTO users (id, email, password, first_name, last_name, role, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET password = $3
      RETURNING id, email, first_name, last_name, role;
    `;

    const user = await db.one(query, [
      '00000000-0000-0000-0000-000000000001',
      'admin@bmm.local',
      hashedPassword,
      'Admin',
      'User',
      'admin',
      true,
    ]);

    console.log('✅ Admin user seeded successfully:', user);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
