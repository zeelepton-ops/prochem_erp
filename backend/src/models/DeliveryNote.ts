import { db } from '../config/database';
import { DeliveryNote, DeliveryItem, BatchAllocation } from '../types';

export class DeliveryNoteModel {
  static async create(deliveryData: Partial<DeliveryNote>): Promise<DeliveryNote> {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Insert delivery note
      const dnQuery = `
        INSERT INTO delivery_notes (dn_number, so_id, delivered_by, delivered_date, status, remarks, total_amount, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, dn_number as "dnNumber", so_id as "soId", delivered_by as "deliveredBy", delivered_date as "deliveredDate", status, remarks, total_amount as "totalAmount", created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
      `;

      const delivery = await client.one(dnQuery, [
        deliveryData.dnNumber,
        deliveryData.soId,
        deliveryData.deliveredBy,
        deliveryData.deliveredDate,
        deliveryData.status || 'DELIVERED',
        deliveryData.remarks,
        deliveryData.totalAmount,
        deliveryData.createdBy,
      ]);

      // Insert delivery items and batch allocations
      if (deliveryData.items && deliveryData.items.length > 0) {
        for (const item of deliveryData.items) {
          const itemQuery = `
            INSERT INTO delivery_note_items (dn_id, so_item_id, product_name, quantity_delivered, unit_price, line_total)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
          `;
          const itemResult = await client.one(itemQuery, [
            delivery.id,
            item.soItemId,
            item.productName,
            item.quantityDelivered,
            item.unitPrice,
            item.lineTotal,
          ]);

          // Insert batch allocations
          if (item.batchAllocations && item.batchAllocations.length > 0) {
            for (const allocation of item.batchAllocations) {
              await client.query(`
                INSERT INTO delivery_batch_allocations (dn_item_id, batch_id, batch_number, allocated_quantity, expiry_date)
                VALUES ($1, $2, $3, $4, $5)
              `, [
                itemResult.id,
                allocation.batchId,
                allocation.batchNumber,
                allocation.allocatedQuantity,
                allocation.expiryDate,
              ]);

              // Update material batch quantity
              await client.query(`
                UPDATE material_batches
                SET quantity = quantity - $1
                WHERE id = $2
              `, [allocation.allocatedQuantity, allocation.batchId]);
            }
          }
        }
      }

      await client.query('COMMIT');

      // Fetch complete delivery note with items and allocations
      return await this.findById(delivery.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id: string): Promise<DeliveryNote | null> {
    const query = `
      SELECT
        dn.id, dn.dn_number as "dnNumber", dn.so_id as "soId", dn.delivered_by as "deliveredBy",
        dn.delivered_date as "deliveredDate", dn.status, dn.remarks, dn.total_amount as "totalAmount",
        dn.created_by as "createdBy", dn.created_at as "createdAt", dn.updated_at as "updatedAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id', dni.id,
              'soItemId', dni.so_item_id,
              'productName', dni.product_name,
              'quantityDelivered', dni.quantity_delivered,
              'unitPrice', dni.unit_price,
              'lineTotal', dni.line_total,
              'batchAllocations', COALESCE(
                (
                  SELECT json_agg(
                    json_build_object(
                      'id', dba.id,
                      'batchId', dba.batch_id,
                      'batchNumber', dba.batch_number,
                      'allocatedQuantity', dba.allocated_quantity,
                      'expiryDate', dba.expiry_date
                    )
                  )
                  FROM delivery_batch_allocations dba
                  WHERE dba.dn_item_id = dni.id
                ),
                '[]'::json
              )
            )
          ) FILTER (WHERE dni.id IS NOT NULL),
          '[]'
        ) as items
      FROM delivery_notes dn
      LEFT JOIN delivery_note_items dni ON dn.id = dni.dn_id
      WHERE dn.id = $1
      GROUP BY dn.id, dn.dn_number, dn.so_id, dn.delivered_by, dn.delivered_date, dn.status,
               dn.remarks, dn.total_amount, dn.created_by, dn.created_at, dn.updated_at
    `;

    try {
      return await db.one(query, [id]);
    } catch (error) {
      return null;
    }
  }

  static async findAll(limit: number = 10, offset: number = 0): Promise<DeliveryNote[]> {
    const query = `
      SELECT
        dn.id, dn.dn_number as "dnNumber", dn.so_id as "soId", dn.delivered_by as "deliveredBy",
        dn.delivered_date as "deliveredDate", dn.status, dn.remarks, dn.total_amount as "totalAmount",
        dn.created_by as "createdBy", dn.created_at as "createdAt", dn.updated_at as "updatedAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id', dni.id,
              'soItemId', dni.so_item_id,
              'productName', dni.product_name,
              'quantityDelivered', dni.quantity_delivered,
              'unitPrice', dni.unit_price,
              'lineTotal', dni.line_total,
              'batchAllocations', COALESCE(
                (
                  SELECT json_agg(
                    json_build_object(
                      'id', dba.id,
                      'batchId', dba.batch_id,
                      'batchNumber', dba.batch_number,
                      'allocatedQuantity', dba.allocated_quantity,
                      'expiryDate', dba.expiry_date
                    )
                  )
                  FROM delivery_batch_allocations dba
                  WHERE dba.dn_item_id = dni.id
                ),
                '[]'::json
              )
            )
          ) FILTER (WHERE dni.id IS NOT NULL),
          '[]'
        ) as items
      FROM delivery_notes dn
      LEFT JOIN delivery_note_items dni ON dn.id = dni.dn_id
      GROUP BY dn.id, dn.dn_number, dn.so_id, dn.delivered_by, dn.delivered_date, dn.status,
               dn.remarks, dn.total_amount, dn.created_by, dn.created_at, dn.updated_at
      ORDER BY dn.delivered_date DESC LIMIT $1 OFFSET $2
    `;

    return db.any(query, [limit, offset]);
  }

  static async update(
    id: string,
    updates: Partial<DeliveryNote>
  ): Promise<DeliveryNote> {
    const query = `
      UPDATE delivery_notes
      SET status = COALESCE($2, status),
          remarks = COALESCE($3, remarks),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, dn_number as "dnNumber", so_id as "soId", delivered_by as "deliveredBy",
                delivered_date as "deliveredDate", status, remarks, total_amount as "totalAmount",
                created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
    `;

    return db.one(query, [
      id,
      updates.status,
      updates.remarks,
    ]);
  }

  static async delete(id: string): Promise<boolean> {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Get batch allocations to restore quantities
      const allocations = await client.any(`
        SELECT dba.batch_id, dba.allocated_quantity
        FROM delivery_batch_allocations dba
        JOIN delivery_note_items dni ON dba.dn_item_id = dni.id
        WHERE dni.dn_id = $1
      `, [id]);

      // Restore batch quantities
      for (const allocation of allocations) {
        await client.query(`
          UPDATE material_batches
          SET quantity = quantity + $1
          WHERE id = $2
        `, [allocation.allocated_quantity, allocation.batch_id]);
      }

      // Delete delivery note (cascade will handle items and allocations)
      const result = await client.result('DELETE FROM delivery_notes WHERE id = $1', [id]);

      await client.query('COMMIT');
      return result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
