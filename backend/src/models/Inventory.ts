import { db } from '../config/database';
import { InventoryItem } from '../types';

export class InventoryModel {
  static async create(
    inventoryData: Partial<InventoryItem>
  ): Promise<InventoryItem> {
    const query = `
      INSERT INTO inventory (raw_material_id, quantity, location)
      VALUES ($1, $2, $3)
      RETURNING id, raw_material_id as "rawMaterialId", quantity, location, last_checked_at as "lastCheckedAt", created_at as "createdAt", updated_at as "updatedAt"
    `;

    return db.one(query, [
      inventoryData.rawMaterialId,
      inventoryData.quantity,
      inventoryData.location,
    ]);
  }

  static async findById(id: string): Promise<InventoryItem | null> {
    const query = `
      SELECT id, raw_material_id as "rawMaterialId", quantity, location, last_checked_at as "lastCheckedAt", created_at as "createdAt", updated_at as "updatedAt"
      FROM inventory WHERE id = $1
    `;

    try {
      return await db.one(query, [id]);
    } catch (error) {
      return null;
    }
  }

  static async findByMaterialId(
    materialId: string
  ): Promise<InventoryItem | null> {
    const query = `
      SELECT id, raw_material_id as "rawMaterialId", quantity, location, last_checked_at as "lastCheckedAt", created_at as "createdAt", updated_at as "updatedAt"
      FROM inventory WHERE raw_material_id = $1
    `;

    try {
      return await db.one(query, [materialId]);
    } catch (error) {
      return null;
    }
  }

  static async findAll(
    limit: number = 10,
    offset: number = 0
  ): Promise<InventoryItem[]> {
    const query = `
      SELECT id, raw_material_id as "rawMaterialId", quantity, location, last_checked_at as "lastCheckedAt", created_at as "createdAt", updated_at as "updatedAt"
      FROM inventory
      ORDER BY created_at DESC LIMIT $1 OFFSET $2
    `;

    return db.any(query, [limit, offset]);
  }

  static async update(
    id: string,
    updates: Partial<InventoryItem>
  ): Promise<InventoryItem> {
    const query = `
      UPDATE inventory 
      SET quantity = COALESCE($2, quantity),
          location = COALESCE($3, location),
          last_checked_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, raw_material_id as "rawMaterialId", quantity, location, last_checked_at as "lastCheckedAt", created_at as "createdAt", updated_at as "updatedAt"
    `;

    return db.one(query, [id, updates.quantity, updates.location]);
  }

  static async updateQuantity(id: string, quantity: number): Promise<void> {
    const query = `
      UPDATE inventory 
      SET quantity = quantity + $2,
          last_checked_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
    `;

    await db.none(query, [id, quantity]);
  }

  static async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM inventory WHERE id = $1`;
    const result = await db.result(query, [id]);
    return result.rowCount > 0;
  }
}
