import { db, pgp } from '../config/database';
import { User } from '../types';
import { hashPassword } from '../utils/password';

export class UserModel {
  static async create(userData: Partial<User>): Promise<User> {
    const hashedPassword = userData.password
      ? await hashPassword(userData.password)
      : '';

    const query = `
      INSERT INTO users (email, password_hash, name, role, department, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, name, role, department, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
    `;

    return db.one(query, [
      userData.email,
      hashedPassword,
      userData.name || `${userData.firstName} ${userData.lastName}`,
      userData.role || 'operator',
      userData.department,
      true,
    ]);
  }

  static async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, name, role, department, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
      FROM users WHERE id = $1
    `;

    try {
      return await db.one(query, [id]);
    } catch (error) {
      return null;
    }
  }

  static async findByEmail(email: string): Promise<User & { password_hash: string } | null> {
    const query = `
      SELECT id, email, password_hash, name, role, department, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
      FROM users WHERE email = $1
    `;

    try {
      return await db.one(query, [email]);
    } catch (error) {
      return null;
    }
  }

  static async findAll(limit: number = 10, offset: number = 0): Promise<User[]> {
    const query = `
      SELECT id, email, name, role, department, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
      FROM users LIMIT $1 OFFSET $2
    `;

    return db.any(query, [limit, offset]);
  }

  static async update(id: string, updates: Partial<User>): Promise<User> {
    const query = `
      UPDATE users 
      SET name = COALESCE($2, name),
          role = COALESCE($3, role),
          department = COALESCE($4, department),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, name, role, department, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
    `;

    return db.one(query, [
      id,
      updates.name,
      updates.role,
      updates.department,
    ]);
  }

  static async delete(id: string): Promise<boolean> {
    const query = `UPDATE users SET is_active = false WHERE id = $1`;
    const result = await db.result(query, [id]);
    return result.rowCount > 0;
  }
}
