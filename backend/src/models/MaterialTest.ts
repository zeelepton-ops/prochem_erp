import { db } from '../config/database';
import { MaterialTest } from '../types';

export class MaterialTestModel {
  static async create(testData: Partial<MaterialTest>): Promise<MaterialTest> {
    const query = `
      INSERT INTO material_tests (raw_material_id, batch_number, test_date, test_type, result, remarks, tested_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, raw_material_id as "rawMaterialId", batch_number as "batchNumber", test_date as "testDate", test_type as "testType", result, remarks, tested_by as "testedBy", created_at as "createdAt", updated_at as "updatedAt"
    `;

    return db.one(query, [
      testData.rawMaterialId,
      testData.batchNumber,
      testData.testDate,
      testData.testType,
      testData.result || 'pending',
      testData.remarks,
      testData.testedBy,
    ]);
  }

  static async findById(id: string): Promise<MaterialTest | null> {
    const query = `
      SELECT id, raw_material_id as "rawMaterialId", batch_number as "batchNumber", test_date as "testDate", test_type as "testType", result, remarks, tested_by as "testedBy", created_at as "createdAt", updated_at as "updatedAt"
      FROM material_tests WHERE id = $1
    `;

    try {
      return await db.one(query, [id]);
    } catch (error) {
      return null;
    }
  }

  static async findByBatchNumber(batchNumber: string): Promise<MaterialTest[]> {
    const query = `
      SELECT id, raw_material_id as "rawMaterialId", batch_number as "batchNumber", test_date as "testDate", test_type as "testType", result, remarks, tested_by as "testedBy", created_at as "createdAt", updated_at as "updatedAt"
      FROM material_tests WHERE batch_number = $1
      ORDER BY test_date DESC
    `;

    return db.any(query, [batchNumber]);
  }

  static async findAll(limit: number = 10, offset: number = 0): Promise<MaterialTest[]> {
    const query = `
      SELECT id, raw_material_id as "rawMaterialId", batch_number as "batchNumber", test_date as "testDate", test_type as "testType", result, remarks, tested_by as "testedBy", created_at as "createdAt", updated_at as "updatedAt"
      FROM material_tests
      ORDER BY test_date DESC LIMIT $1 OFFSET $2
    `;

    return db.any(query, [limit, offset]);
  }

  static async update(
    id: string,
    updates: Partial<MaterialTest>
  ): Promise<MaterialTest> {
    const query = `
      UPDATE material_tests 
      SET result = COALESCE($2, result),
          remarks = COALESCE($3, remarks),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, raw_material_id as "rawMaterialId", batch_number as "batchNumber", test_date as "testDate", test_type as "testType", result, remarks, tested_by as "testedBy", created_at as "createdAt", updated_at as "updatedAt"
    `;

    return db.one(query, [id, updates.result, updates.remarks]);
  }

  static async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM material_tests WHERE id = $1`;
    const result = await db.result(query, [id]);
    return result.rowCount > 0;
  }
}
