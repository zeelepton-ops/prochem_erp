import { Router, Request, Response } from 'express';
import { RequestWithUser } from '../types';
import { authenticate } from '../middleware/auth';
import { db } from '../config/database';

const router = Router();

// ============================================================================
// SUPPLIERS ENDPOINTS
// ============================================================================

// GET all suppliers
router.get('/suppliers', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      'SELECT id, name, contact_person as "contactPerson", email, phone, address, city, state, country, postal_code as "postalCode", payment_terms as "paymentTerms", created_at as "createdAt", updated_at as "updatedAt" FROM suppliers ORDER BY name ASC'
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Suppliers error:', error);
    res.status(500).json({ success: false, message: 'Error fetching suppliers', error: error.message });
  }
});

// GET supplier by ID
router.get('/suppliers/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      'SELECT id, name, contact_person as "contactPerson", email, phone, address, city, state, country, postal_code as "postalCode", payment_terms as "paymentTerms", created_at as "createdAt", updated_at as "updatedAt" FROM suppliers WHERE id = $1',
      [req.params.id]
    );
    if (result.length === 0) return res.status(404).json({ message: 'Supplier not found' });
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching supplier', error });
  }
});

// CREATE supplier
router.post('/suppliers', authenticate, async (req: RequestWithUser, res: Response) => {
  try {
    const { name, contactPerson, email, phone, address, city, state, country, postalCode, paymentTerms } = req.body;
    
    if (!name) return res.status(400).json({ message: 'Supplier name is required' });

    const result = await db.query(
      `INSERT INTO suppliers (name, contact_person, email, phone, address, city, state, country, postal_code, payment_terms, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, name, contact_person as "contactPerson", email, phone, address, city, state, country, postal_code as "postalCode", payment_terms as "paymentTerms", created_at as "createdAt"`,
      [name, contactPerson || null, email || null, phone || null, address || null, city || null, state || null, country || null, postalCode || null, paymentTerms || null, (req.user as any).id]
    );
    res.status(201).json(result[0]);
  } catch (error: any) {
    if (error.code === '23505') return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ message: 'Error creating supplier', error });
  }
});

// UPDATE supplier
router.put('/suppliers/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, contactPerson, email, phone, address, city, state, country, postalCode, paymentTerms } = req.body;
    
    if (!name) return res.status(400).json({ message: 'Supplier name is required' });

    const result = await db.query(
      `UPDATE suppliers SET name = $1, contact_person = $2, email = $3, phone = $4, address = $5, city = $6, state = $7, country = $8, postal_code = $9, payment_terms = $10, updated_at = NOW()
       WHERE id = $11
       RETURNING id, name, contact_person as "contactPerson", email, phone, address, city, state, country, postal_code as "postalCode", payment_terms as "paymentTerms", updated_at as "updatedAt"`,
      [name, contactPerson || null, email || null, phone || null, address || null, city || null, state || null, country || null, postalCode || null, paymentTerms || null, req.params.id]
    );
    if (result.length === 0) return res.status(404).json({ message: 'Supplier not found' });
    res.json(result[0]);
  } catch (error: any) {
    if (error.code === '23505') return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ message: 'Error updating supplier', error });
  }
});

// DELETE supplier
router.delete('/suppliers/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await db.query('DELETE FROM suppliers WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.length === 0) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting supplier', error });
  }
});

// ============================================================================
// CUSTOMERS ENDPOINTS
// ============================================================================

// GET all customers
router.get('/customers', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      'SELECT id, name, contact_person as "contactPerson", email, phone, address, city, state, country, postal_code as "postalCode", created_at as "createdAt", updated_at as "updatedAt" FROM customers ORDER BY name ASC'
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers', error });
  }
});

// GET customer by ID
router.get('/customers/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      'SELECT id, name, contact_person as "contactPerson", email, phone, address, city, state, country, postal_code as "postalCode", created_at as "createdAt", updated_at as "updatedAt" FROM customers WHERE id = $1',
      [req.params.id]
    );
    if (result.length === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer', error });
  }
});

// CREATE customer
router.post('/customers', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, contactPerson, email, phone, address, city, state, country, postalCode } = req.body;
    
    if (!name) return res.status(400).json({ message: 'Customer name is required' });

    const result = await db.query(
      `INSERT INTO customers (name, contact_person, email, phone, address, city, state, country, postal_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, contact_person as "contactPerson", email, phone, address, city, state, country, postal_code as "postalCode", created_at as "createdAt"`,
      [name, contactPerson || null, email || null, phone || null, address || null, city || null, state || null, country || null, postalCode || null]
    );
    res.status(201).json(result[0]);
  } catch (error: any) {
    if (error.code === '23505') return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ message: 'Error creating customer', error });
  }
});

// UPDATE customer
router.put('/customers/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, contactPerson, email, phone, address, city, state, country, postalCode } = req.body;
    
    if (!name) return res.status(400).json({ message: 'Customer name is required' });

    const result = await db.query(
      `UPDATE customers SET name = $1, contact_person = $2, email = $3, phone = $4, address = $5, city = $6, state = $7, country = $8, postal_code = $9, updated_at = NOW()
       WHERE id = $10
       RETURNING id, name, contact_person as "contactPerson", email, phone, address, city, state, country, postal_code as "postalCode", updated_at as "updatedAt"`,
      [name, contactPerson || null, email || null, phone || null, address || null, city || null, state || null, country || null, postalCode || null, req.params.id]
    );
    if (result.length === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json(result[0]);
  } catch (error: any) {
    if (error.code === '23505') return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ message: 'Error updating customer', error });
  }
});

// DELETE customer
router.delete('/customers/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await db.query('DELETE FROM customers WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.length === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting customer', error });
  }
});

// ============================================================================
// MATERIALS ENDPOINTS
// ============================================================================

// GET all materials
router.get('/materials', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT
        rm.id, rm.code, rm.name, rm.description, rm.unit_of_measure as "unitOfMeasure",
        rm.minimum_stock as "minimumStock", rm.reorder_level as "reorderLevel",
        rm.created_at as "createdAt", rm.updated_at as "updatedAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id', rmb.id,
              'batchNumber', rmb.batch_number,
              'manufacturingDate', rmb.manufacturing_date,
              'expiryDate', rmb.expiry_date,
              'quantityReceived', rmb.quantity_received,
              'status', rmb.status
            )
          ) FILTER (WHERE rmb.id IS NOT NULL),
          '[]'
        ) as batches
       FROM raw_materials rm
       LEFT JOIN raw_material_batches rmb ON rm.id = rmb.material_id
       GROUP BY rm.id, rm.code, rm.name, rm.description, rm.unit_of_measure,
                rm.minimum_stock, rm.reorder_level, rm.created_at, rm.updated_at
       ORDER BY rm.name ASC`
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Materials error:', error);
    res.status(500).json({ success: false, message: 'Error fetching materials', error: error.message });
  }
});

// GET material by ID
router.get('/materials/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT
        rm.id, rm.code, rm.name, rm.description, rm.unit_of_measure as "unitOfMeasure",
        rm.minimum_stock as "minimumStock", rm.reorder_level as "reorderLevel",
        rm.created_at as "createdAt", rm.updated_at as "updatedAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id', rmb.id,
              'batchNumber', rmb.batch_number,
              'manufacturingDate', rmb.manufacturing_date,
              'expiryDate', rmb.expiry_date,
              'quantityReceived', rmb.quantity_received,
              'status', rmb.status
            )
          ) FILTER (WHERE rmb.id IS NOT NULL),
          '[]'
        ) as batches
       FROM raw_materials rm
       LEFT JOIN raw_material_batches rmb ON rm.id = rmb.material_id
       WHERE rm.id = $1
       GROUP BY rm.id, rm.code, rm.name, rm.description, rm.unit_of_measure,
                rm.minimum_stock, rm.reorder_level, rm.created_at, rm.updated_at`,
      [req.params.id]
    );
    if (result.length === 0) return res.status(404).json({ message: 'Material not found' });
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching material', error });
  }
});

// CREATE material
router.post('/materials', authenticate, async (req: Request, res: Response) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const { code, name, description, unitOfMeasure, minimumStock, reorderLevel, batches } = req.body;

    if (!code || !name) return res.status(400).json({ message: 'Material code and name are required' });

    // Insert material
    const materialResult = await client.query(
      `INSERT INTO raw_materials (code, name, description, unit_of_measure, minimum_stock, reorder_level)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, code, name, description, unit_of_measure as "unitOfMeasure", minimum_stock as "minimumStock", reorder_level as "reorderLevel", created_at as "createdAt"`,
      [code, name, description || null, unitOfMeasure || null, minimumStock || 0, reorderLevel || 0]
    );

    const material = materialResult[0];

    // Insert batches if provided
    if (batches && Array.isArray(batches) && batches.length > 0) {
      for (const batch of batches) {
        await client.query(
          `INSERT INTO raw_material_batches (material_id, batch_number, manufacturing_date, expiry_date, quantity_received, status)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [material.id, batch.batchNumber, batch.receivedDate || batch.manufacturingDate || new Date().toISOString().split('T')[0], batch.expiryDate, batch.quantity || batch.quantityReceived || 0, batch.status || 'QUARANTINE']
        );
      }
    }

    await client.query('COMMIT');

    // Fetch complete material with batches
    const completeResult = await client.query(
      `SELECT
        rm.id, rm.code, rm.name, rm.description, rm.unit_of_measure as "unitOfMeasure",
        rm.minimum_stock as "minimumStock", rm.reorder_level as "reorderLevel",
        rm.created_at as "createdAt", rm.updated_at as "updatedAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id', rmb.id,
              'batchNumber', rmb.batch_number,
              'manufacturingDate', rmb.manufacturing_date,
              'expiryDate', rmb.expiry_date,
              'quantityReceived', rmb.quantity_received,
              'status', rmb.status
            )
          ) FILTER (WHERE rmb.id IS NOT NULL),
          '[]'
        ) as batches
       FROM raw_materials rm
       LEFT JOIN raw_material_batches rmb ON rm.id = rmb.material_id
       WHERE rm.id = $1
       GROUP BY rm.id, rm.code, rm.name, rm.description, rm.unit_of_measure,
                rm.minimum_stock, rm.reorder_level, rm.created_at, rm.updated_at`,
      [material.id]
    );

    res.status(201).json(completeResult[0]);
  } catch (error: any) {
    await client.query('ROLLBACK');
    if (error.code === '23505') return res.status(400).json({ message: 'Material code already exists' });
    res.status(500).json({ message: 'Error creating material', error });
  } finally {
    client.release();
  }
});

// UPDATE material
router.put('/materials/:id', authenticate, async (req: Request, res: Response) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const { code, name, description, unitOfMeasure, minimumStock, reorderLevel, batches } = req.body;

    if (!code || !name) return res.status(400).json({ message: 'Material code and name are required' });

    // Update material
    const materialResult = await client.query(
      `UPDATE raw_materials SET code = $1, name = $2, description = $3, unit_of_measure = $4, minimum_stock = $5, reorder_level = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING id, code, name, description, unit_of_measure as "unitOfMeasure", minimum_stock as "minimumStock", reorder_level as "reorderLevel", updated_at as "updatedAt"`,
      [code, name, description || null, unitOfMeasure || null, minimumStock || 0, reorderLevel || 0, req.params.id]
    );

    if (materialResult.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Material not found' });
    }

    // Delete existing batches
    await client.query('DELETE FROM raw_material_batches WHERE material_id = $1', [req.params.id]);

    // Insert new batches if provided
    if (batches && Array.isArray(batches) && batches.length > 0) {
      for (const batch of batches) {
        await client.query(
          `INSERT INTO raw_material_batches (material_id, batch_number, manufacturing_date, expiry_date, quantity_received, status)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [req.params.id, batch.batchNumber, batch.receivedDate || batch.manufacturingDate || new Date().toISOString().split('T')[0], batch.expiryDate, batch.quantity || batch.quantityReceived || 0, batch.status || 'QUARANTINE']
        );
      }
    }

    await client.query('COMMIT');

    // Fetch complete material with batches
    const completeResult = await client.query(
      `SELECT
        rm.id, rm.code, rm.name, rm.description, rm.unit_of_measure as "unitOfMeasure",
        rm.minimum_stock as "minimumStock", rm.reorder_level as "reorderLevel",
        rm.created_at as "createdAt", rm.updated_at as "updatedAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id', rmb.id,
              'batchNumber', rmb.batch_number,
              'manufacturingDate', rmb.manufacturing_date,
              'expiryDate', rmb.expiry_date,
              'quantityReceived', rmb.quantity_received,
              'status', rmb.status
            )
          ) FILTER (WHERE rmb.id IS NOT NULL),
          '[]'
        ) as batches
       FROM raw_materials rm
       LEFT JOIN raw_material_batches rmb ON rm.id = rmb.material_id
       WHERE rm.id = $1
       GROUP BY rm.id, rm.code, rm.name, rm.description, rm.unit_of_measure,
                rm.minimum_stock, rm.reorder_level, rm.created_at, rm.updated_at`,
      [req.params.id]
    );

    res.json(completeResult[0]);
  } catch (error: any) {
    await client.query('ROLLBACK');
    if (error.code === '23505') return res.status(400).json({ message: 'Material code already exists' });
    res.status(500).json({ message: 'Error updating material', error });
  } finally {
    client.release();
  }
});

// DELETE material
router.delete('/materials/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await db.query('DELETE FROM raw_materials WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.length === 0) return res.status(404).json({ message: 'Material not found' });
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting material', error });
  }
});

export default router;
