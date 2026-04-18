import { hashPassword } from '../src/utils/password';

async function generateHash() {
  const password = 'admin123';
  const hash = await hashPassword(password);
  console.log('Password hash for admin123:', hash);
  console.log('\nRun this SQL in Supabase:');
  console.log(`
INSERT INTO users (id, email, password, first_name, last_name, role, is_active, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@bmm.local',
  '${hash}',
  'Admin',
  'User',
  'admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
  `);
}

generateHash().then(() => process.exit(0));
