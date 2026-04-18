import { db } from '../config/database';
import { SalesOrder } from '../types';

export class SalesOrderModel {
  static async create(soData: Partial<SalesOrder>): Promise<SalesOrder> {
    const query = `
      INSERT INTO sales_orders (so_number, customer_id, order_date, delivery_date, status, total_amount, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, so_number as "soNumber", customer_id as "customerId", order_date as "orderDate", delivery_date as "deliveryDate", status, total_amount as "totalAmount", created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
    `;

    return db.one(query, [
      soData.soNumber,
      soData.customerId,
      soData.orderDate,
      soData.deliveryDate,
      soData.status || 'draft',
      soData.totalAmount,
      soData.createdBy,
    ]);
  }

  static async findById(id: string): Promise<SalesOrder | null> {
    const query = `
      SELECT id, so_number as "soNumber", customer_id as "customerId", order_date as "orderDate", delivery_date as "deliveryDate", status, total_amount as "totalAmount", created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
      FROM sales_orders WHERE id = $1
    `;

    try {
      return await db.one(query, [id]);
    } catch (error) {
      return null;
    }
  }

  static async findAll(
    limit: number = 10,
    offset: number = 0
  ): Promise<SalesOrder[]> {
    const query = `
      SELECT id, so_number as "soNumber", customer_id as "customerId", order_date as "orderDate", delivery_date as "deliveryDate", status, total_amount as "totalAmount", created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
      FROM sales_orders
      ORDER BY created_at DESC LIMIT $1 OFFSET $2
    `;

    return db.any(query, [limit, offset]);
  }

  static async update(
    id: string,
    updates: Partial<SalesOrder>
  ): Promise<SalesOrder> {
    const query = `
      UPDATE sales_orders 
      SET so_number = COALESCE($2, so_number),
          status = COALESCE($3, status),
          total_amount = COALESCE($4, total_amount),
          delivery_date = COALESCE($5, delivery_date),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, so_number as "soNumber", customer_id as "customerId", order_date as "orderDate", delivery_date as "deliveryDate", status, total_amount as "totalAmount", created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
    `;

    return db.one(query, [
      id,
      updates.soNumber,
      updates.status,
      updates.totalAmount,
      updates.deliveryDate,
    ]);
  }

  static async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM sales_orders WHERE id = $1`;
    const result = await db.result(query, [id]);
    return result.rowCount > 0;
  }
}
