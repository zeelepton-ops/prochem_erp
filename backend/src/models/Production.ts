import { db } from '../config/database';
import { Production } from '../types';

export class ProductionModel {
  static async create(productionData: Partial<Production>): Promise<Production> {
    const query = `
      INSERT INTO production (batch_number, product_id, quantity, start_date, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, batch_number as "batchNumber", product_id as "productId", quantity, start_date as "startDate", end_date as "endDate", status, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
    `;

    return db.one(query, [
      productionData.batchNumber,
      productionData.productId,
      productionData.quantity,
      productionData.startDate,
      productionData.status || 'planned',
      productionData.createdBy,
    ]);
  }

  static async findById(id: string): Promise<Production | null> {
    const query = `
      SELECT id, batch_number as "batchNumber", product_id as "productId", quantity, start_date as "startDate", end_date as "endDate", status, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
      FROM production WHERE id = $1
    `;

    try {
      return await db.one(query, [id]);
    } catch (error) {
      return null;
    }
  }

  static async findByBatchNumber(batchNumber: string): Promise<Production | null> {
    const query = `
      SELECT id, batch_number as "batchNumber", product_id as "productId", quantity, start_date as "startDate", end_date as "endDate", status, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
      FROM production WHERE batch_number = $1
    `;

    try {
      return await db.one(query, [batchNumber]);
    } catch (error) {
      return null;
    }
  }

  static async findAll(
    limit: number = 10,
    offset: number = 0,
    status?: string
  ): Promise<Production[]> {
    let query = `
      SELECT id, batch_number as "batchNumber", product_id as "productId", quantity, start_date as "startDate", end_date as "endDate", status, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
      FROM production
    `;

    const params: any[] = [];

    if (status) {
      query += ` WHERE status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY start_date DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;
    params.push(limit, offset);

    return db.any(query, params);
  }

  static async update(
    id: string,
    updates: Partial<Production>
  ): Promise<Production> {
    const query = `
      UPDATE production 
      SET status = COALESCE($2, status),
          end_date = COALESCE($3, end_date),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, batch_number as "batchNumber", product_id as "productId", quantity, start_date as "startDate", end_date as "endDate", status, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
    `;

    return db.one(query, [id, updates.status, updates.endDate]);
  }

  static async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM production WHERE id = $1`;
    const result = await db.result(query, [id]);
    return result.rowCount > 0;
  }
}
