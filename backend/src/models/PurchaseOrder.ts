import { db } from '../config/database';
import { PurchaseOrder } from '../types';

export class PurchaseOrderModel {
  static async create(
    poData: Partial<PurchaseOrder>
  ): Promise<PurchaseOrder> {
    const query = `
      INSERT INTO purchase_orders (po_number, supplier_id, order_date, expected_delivery_date, status, total_amount, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, po_number as "poNumber", supplier_id as "supplierId", order_date as "orderDate", expected_delivery_date as "expectedDeliveryDate", status, total_amount as "totalAmount", created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
    `;

    return db.one(query, [
      poData.poNumber,
      poData.supplierId,
      poData.orderDate,
      poData.expectedDeliveryDate,
      poData.status || 'draft',
      poData.totalAmount,
      poData.createdBy,
    ]);
  }

  static async findById(id: string): Promise<PurchaseOrder | null> {
    const query = `
      SELECT id, po_number as "poNumber", supplier_id as "supplierId", order_date as "orderDate", expected_delivery_date as "expectedDeliveryDate", status, total_amount as "totalAmount", created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
      FROM purchase_orders WHERE id = $1
    `;

    try {
      return await db.one(query, [id]);
    } catch (error) {
      return null;
    }
  }

  static async findAll(
    limit: number = 10,
    offset: number = 0,
    status?: string
  ): Promise<PurchaseOrder[]> {
    let query = `
      SELECT id, po_number as "poNumber", supplier_id as "supplierId", order_date as "orderDate", expected_delivery_date as "expectedDeliveryDate", status, total_amount as "totalAmount", created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
      FROM purchase_orders
    `;

    const params: any[] = [];

    if (status) {
      query += ` WHERE status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;
    params.push(limit, offset);

    return db.any(query, params);
  }

  static async update(
    id: string,
    updates: Partial<PurchaseOrder>
  ): Promise<PurchaseOrder> {
    const query = `
      UPDATE purchase_orders 
      SET po_number = COALESCE($2, po_number),
          status = COALESCE($3, status),
          total_amount = COALESCE($4, total_amount),
          expected_delivery_date = COALESCE($5, expected_delivery_date),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, po_number as "poNumber", supplier_id as "supplierId", order_date as "orderDate", expected_delivery_date as "expectedDeliveryDate", status, total_amount as "totalAmount", created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
    `;

    return db.one(query, [
      id,
      updates.poNumber,
      updates.status,
      updates.totalAmount,
      updates.expectedDeliveryDate,
    ]);
  }

  static async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM purchase_orders WHERE id = $1`;
    const result = await db.result(query, [id]);
    return result.rowCount > 0;
  }

  static async count(status?: string): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM purchase_orders';
    const params: any[] = [];

    if (status) {
      query += ` WHERE status = $${params.length + 1}`;
      params.push(status);
    }

    const result = await db.one(query, params);
    return result.count;
  }
}
