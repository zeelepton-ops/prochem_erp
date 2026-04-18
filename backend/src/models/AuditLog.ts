import { db } from '../config/database';

export class AuditLogModel {
  static async findAll(filters?: {
    entityType?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }) {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];

    if (filters?.entityType) {
      query += ' AND entity_type = $' + (params.length + 1);
      params.push(filters.entityType);
    }

    if (filters?.action) {
      query += ' AND action = $' + (params.length + 1);
      params.push(filters.action);
    }

    if (filters?.startDate) {
      query += ' AND timestamp >= $' + (params.length + 1);
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      query += ' AND timestamp <= $' + (params.length + 1);
      params.push(filters.endDate);
    }

    query += ' ORDER BY timestamp DESC LIMIT 1000';

    return db.query(query, params);
  }

  static async findByEntity(entityId: string) {
    return db.query(
      'SELECT * FROM audit_logs WHERE entity_id = $1 ORDER BY timestamp DESC',
      [entityId]
    );
  }

  static async getReport(filters?: { startDate?: string; endDate?: string }) {
    let query = `
      SELECT 
        entity_type,
        COUNT(*) as total_changes,
        COUNT(CASE WHEN action = 'create' THEN 1 END) as creates,
        COUNT(CASE WHEN action = 'update' THEN 1 END) as updates,
        COUNT(CASE WHEN action = 'delete' THEN 1 END) as deletes
      FROM audit_logs
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.startDate) {
      query += ' AND timestamp >= $' + (params.length + 1);
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      query += ' AND timestamp <= $' + (params.length + 1);
      params.push(filters.endDate);
    }

    query += ' GROUP BY entity_type ORDER BY total_changes DESC';

    return db.query(query, params);
  }

  static async logAction(
    entityType: string,
    entityId: string,
    action: string,
    userId: string,
    oldValues?: any,
    newValues?: any
  ) {
    return db.query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, user_id, old_values, new_values, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [entityType, entityId, action, userId, oldValues || null, newValues || null]
    );
  }
}
