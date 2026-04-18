import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@services/api';
import { useAuthStore } from '@context/authStore';
import { FaArrowLeft, FaCheckCircle, FaPlus, FaTrash } from 'react-icons/fa';

interface DeliveryItem {
  soItemId: string;
  productName: string;
  soQuantity: number;
  quantityDelivered: number;
  unitPrice: number;
  lineTotal: number;
  batchAllocations: BatchAllocation[];
}

interface BatchAllocation {
  batchId: string;
  batchNumber: string;
  allocatedQuantity: number;
  expiryDate: string;
}

interface FinishedGoodBatch {
  id: string;
  batchNumber: string;
  materialName: string;
  availableQuantity: number;
  expiryDate: string;
  status: 'APPROVED' | 'QUARANTINE' | 'REJECTED';
}

export const CreateDeliveryNotePageV2: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [finishedGoodBatches, setFinishedGoodBatches] = useState<FinishedGoodBatch[]>([]);
  const [selectedSO, setSelectedSO] = useState<any>(null);

  const [form, setForm] = useState({
    dnNumber: `DN-${Date.now()}`,
    soId: '',
    deliveredBy: '',
    deliveredDate: new Date().toISOString().split('T')[0],
    remarks: '',
    items: [] as DeliveryItem[],
  });

  useEffect(() => {
    loadSalesOrders();
    loadUsers();
    loadFinishedGoodBatches();
  }, []);

  const loadSalesOrders = async () => {
    try {
      setSalesOrders([
        {
          id: '1',
          soNumber: 'SO-001',
          customerName: 'Customer A',
          items: [
            { id: '1', productName: 'Product A', quantity: 100, unitPrice: 1000 },
            { id: '2', productName: 'Product B', quantity: 50, unitPrice: 2000 }
          ]
        },
        {
          id: '2',
          soNumber: 'SO-002',
          customerName: 'Customer B',
          items: [
            { id: '3', productName: 'Product C', quantity: 200, unitPrice: 500 }
          ]
        },
      ]);
    } catch (err) {
      console.error('Failed to load sales orders', err);
    }
  };

  const loadUsers = async () => {
    try {
      setUsers([
        { id: '1', name: 'John Doe' },
        { id: '2', name: 'Jane Smith' },
      ]);
    } catch (err) {
      console.error('Failed to load users', err);
    }
  };

  const loadFinishedGoodBatches = async () => {
    try {
      // In a real implementation, this would fetch from /materials with type='FINISHED_GOOD'
      setFinishedGoodBatches([
        { id: '1', batchNumber: 'FG-001-2024', materialName: 'Product A', availableQuantity: 150, expiryDate: '2025-12-31', status: 'APPROVED' },
        { id: '2', batchNumber: 'FG-002-2024', materialName: 'Product A', availableQuantity: 75, expiryDate: '2025-11-15', status: 'APPROVED' },
        { id: '3', batchNumber: 'FG-003-2024', materialName: 'Product B', availableQuantity: 100, expiryDate: '2025-10-20', status: 'APPROVED' },
        { id: '4', batchNumber: 'FG-004-2024', materialName: 'Product C', availableQuantity: 200, expiryDate: '2025-09-30', status: 'APPROVED' },
      ]);
    } catch (err) {
      console.error('Failed to load finished good batches', err);
    }
  };

  const handleSOChange = (soId: string) => {
    const so = salesOrders.find((s) => s.id === soId);
    setSelectedSO(so);
    setForm({
      ...form,
      soId,
      items: (so?.items || []).map((item: any) => ({
        soItemId: item.id,
        productName: item.productName,
        soQuantity: item.quantity,
        quantityDelivered: item.quantity, // Default to full quantity
        unitPrice: item.unitPrice,
        lineTotal: item.quantity * item.unitPrice,
        batchAllocations: [] as BatchAllocation[],
      })),
    });
  };

  const handleItemQtyChange = (index: number, qty: number) => {
    const newItems = [...form.items];
    newItems[index].quantityDelivered = qty;
    newItems[index].lineTotal = qty * newItems[index].unitPrice;
    // Reset batch allocations when quantity changes
    newItems[index].batchAllocations = [];
    setForm({ ...form, items: newItems });
  };

  const addBatchAllocation = (itemIndex: number) => {
    const item = form.items[itemIndex];
    const availableBatches = finishedGoodBatches.filter(
      batch => batch.materialName === item.productName && batch.status === 'APPROVED'
    );

    if (availableBatches.length === 0) {
      setError(`No approved batches available for ${item.productName}`);
      return;
    }

    const newItems = [...form.items];
    newItems[itemIndex].batchAllocations.push({
      batchId: '',
      batchNumber: '',
      allocatedQuantity: 0,
      expiryDate: '',
    });
    setForm({ ...form, items: newItems });
  };

  const updateBatchAllocation = (itemIndex: number, allocationIndex: number, field: keyof BatchAllocation, value: any) => {
    const newItems = [...form.items];
    const allocation = newItems[itemIndex].batchAllocations[allocationIndex];

    if (field === 'batchId') {
      const selectedBatch = finishedGoodBatches.find(b => b.id === value);
      if (selectedBatch) {
        allocation.batchId = selectedBatch.id;
        allocation.batchNumber = selectedBatch.batchNumber;
        allocation.expiryDate = selectedBatch.expiryDate;
        allocation.allocatedQuantity = Math.min(allocation.allocatedQuantity, selectedBatch.availableQuantity);
      }
    } else {
      (allocation as any)[field] = value;
    }

    setForm({ ...form, items: newItems });
  };

  const removeBatchAllocation = (itemIndex: number, allocationIndex: number) => {
    const newItems = [...form.items];
    newItems[itemIndex].batchAllocations.splice(allocationIndex, 1);
    setForm({ ...form, items: newItems });
  };

  const getTotalAllocatedQuantity = (itemIndex: number) => {
    return form.items[itemIndex].batchAllocations.reduce((sum, alloc) => sum + alloc.allocatedQuantity, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const calculateTotal = () => {
    return form.items.reduce((sum, item) => sum + item.lineTotal, 0);
  };

  const validateBatchAllocations = () => {
    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i];
      const totalAllocated = getTotalAllocatedQuantity(i);

      if (totalAllocated !== item.quantityDelivered) {
        setError(`Batch allocation quantity (${totalAllocated}) must equal delivery quantity (${item.quantityDelivered}) for ${item.productName}`);
        return false;
      }

      // Check for duplicate batch selections
      const batchIds = item.batchAllocations.map(a => a.batchId);
      if (new Set(batchIds).size !== batchIds.length) {
        setError(`Duplicate batch selections not allowed for ${item.productName}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.soId) {
      setError('Please select a sales order');
      return;
    }

    if (!form.deliveredBy) {
      setError('Please select who delivered');
      return;
    }

    if (form.items.length === 0) {
      setError('No items to deliver');
      return;
    }

    // Validate quantities
    for (let item of form.items) {
      if (item.quantityDelivered > item.soQuantity) {
        setError(`Cannot deliver more than ordered quantity for ${item.productName}`);
        return;
      }
    }

    // Validate batch allocations
    if (!validateBatchAllocations()) {
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/delivery-notes', {
        dnNumber: form.dnNumber,
        soId: form.soId,
        deliveredBy: form.deliveredBy,
        deliveredDate: form.deliveredDate,
        items: form.items.map((item) => ({
          soItemId: item.soItemId,
          quantityDelivered: item.quantityDelivered,
          batchAllocations: item.batchAllocations,
        })),
        remarks: form.remarks,
        totalAmount: calculateTotal(),
        createdBy: user?.id,
        status: 'DELIVERED',
      });
      navigate('/delivery-notes');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create delivery note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '0.125rem', background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <button
        onClick={() => navigate('/delivery-notes')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.125rem',
          color: 'var(--secondary)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.75rem',
          fontWeight: '600',
          marginBottom: '0.125rem',
          padding: '0.125rem',
        }}
      >
        <FaArrowLeft /> BACK
      </button>

      <div style={{ borderBottom: '3px solid var(--secondary)', paddingBottom: '0.125rem', marginBottom: '0.125rem' }}>
        <h1 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', margin: 0 }}>
          CREATE DELIVERY NOTE
        </h1>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#DC2626', padding: '0.125rem 0.25rem', marginBottom: '0.125rem', border: '2px solid #fca5a5', fontSize: '0.75rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '0.125rem 0.25rem', marginBottom: '0.125rem', border: '2px solid var(--border)' }}>

        {/* HEADER SECTION */}
        <div style={{ marginBottom: '0.125rem', paddingBottom: '0.125rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.125rem', margin: 0 }}>
            DELIVERY DETAILS
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.125rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.5rem', marginBottom: 0, color: 'var(--primary)' }}>DN #</label>
              <input type="text" value={form.dnNumber} disabled style={{ width: '100%', padding: '0.125rem 0.25rem', border: '2px solid var(--border)', background: 'var(--bg-secondary)', fontSize: '0.7rem', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.5rem', marginBottom: 0, color: 'var(--primary)' }}>SO *</label>
              <select value={form.soId} onChange={(e) => handleSOChange(e.target.value)} required style={{ width: '100%', padding: '0.125rem 0.25rem', border: '2px solid var(--border)', fontSize: '0.7rem', boxSizing: 'border-box' }}>
                <option value="">-- Select --</option>
                {salesOrders.map((so) => (<option key={so.id} value={so.id}>{so.soNumber}</option>))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.5rem', marginBottom: 0, color: 'var(--primary)' }}>BY *</label>
              <select name="deliveredBy" value={form.deliveredBy} onChange={handleChange} required style={{ width: '100%', padding: '0.125rem 0.25rem', border: '2px solid var(--border)', fontSize: '0.7rem', boxSizing: 'border-box' }}>
                <option value="">-- Select --</option>
                {users.map((u) => (<option key={u.id} value={u.id}>{u.name}</option>))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.5rem', marginBottom: 0, color: 'var(--primary)' }}>DATE *</label>
              <input type="date" name="deliveredDate" value={form.deliveredDate} onChange={handleChange} required style={{ width: '100%', padding: '0.125rem 0.25rem', border: '2px solid var(--border)', fontSize: '0.7rem', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginTop: '0.125rem' }}>
            <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.5rem', marginBottom: 0, color: 'var(--primary)' }}>REMARKS</label>
            <textarea name="remarks" value={form.remarks} onChange={handleChange} placeholder="Notes" rows={2} style={{ width: '100%', padding: '0.125rem 0.25rem', border: '2px solid var(--border)', fontSize: '0.7rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* LINE ITEMS SECTION */}
        {form.items.length > 0 && (
          <div style={{ marginBottom: '0.125rem' }}>
            <h2 style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.125rem', margin: 0 }}>ITEMS</h2>

            {form.items.map((item, itemIndex) => (
              <div key={itemIndex} style={{ marginBottom: '0.125rem', padding: '0.125rem', border: '1px solid var(--border)', background: '#f9fafb' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.7fr 0.7fr 0.7fr 0.7fr', gap: '0.125rem', alignItems: 'center', marginBottom: '0.125rem' }}>
                  <div style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '0.7rem' }}>{item.productName}</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.5rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--primary)' }}>SO</div>
                    <div style={{ fontSize: '0.65rem' }}>{item.soQuantity}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.5rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--primary)' }}>DEL</div>
                    <input type="number" value={item.quantityDelivered} onChange={(e) => handleItemQtyChange(itemIndex, parseFloat(e.target.value))} max={item.soQuantity} min="0" style={{ width: '100%', padding: '0.125rem', border: '1px solid var(--border)', textAlign: 'center', fontSize: '0.65rem', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.5rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--primary)' }}>PRICE</div>
                    <div style={{ fontSize: '0.65rem' }}>₹{item.unitPrice.toFixed(0)}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.5rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--primary)' }}>TOTAL</div>
                    <div style={{ fontWeight: '700', color: 'var(--secondary)', fontSize: '0.65rem' }}>₹{item.lineTotal.toFixed(0)}</div>
                  </div>
                </div>

                {/* BATCH ALLOCATION SUB-FORM */}
                <div style={{ marginTop: '0.125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.125rem' }}>
                    <h3 style={{ fontSize: '0.6rem', fontWeight: '600', color: 'var(--primary)', textTransform: 'uppercase', margin: 0 }}>BATCHES: {getTotalAllocatedQuantity(itemIndex)}/{item.quantityDelivered}</h3>
                    <button type="button" onClick={() => addBatchAllocation(itemIndex)} style={{ background: 'var(--secondary)', color: 'white', border: 'none', padding: '0.125rem 0.25rem', borderRadius: 0, cursor: 'pointer', fontSize: '0.55rem', textTransform: 'uppercase' }}>+ ADD</button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.6rem' }}>
                      <thead>
                        <tr style={{ background: '#1F2937', color: 'white' }}>
                          <th style={{ padding: '0.125rem', textAlign: 'left', fontWeight: '600', textTransform: 'uppercase' }}>Batch</th>
                          <th style={{ padding: '0.125rem', textAlign: 'left', fontWeight: '600', textTransform: 'uppercase' }}>Exp</th>
                          <th style={{ padding: '0.125rem', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase' }}>Avail</th>
                          <th style={{ padding: '0.125rem', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase' }}>Alloc</th>
                          <th style={{ padding: '0.125rem', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase' }}>Act</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.batchAllocations.map((allocation, allocationIndex) => {
                          const selectedBatch = finishedGoodBatches.find(b => b.id === allocation.batchId);
                          return (
                            <tr key={allocationIndex} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '0.125rem' }}>
                                <select value={allocation.batchId} onChange={(e) => updateBatchAllocation(itemIndex, allocationIndex, 'batchId', e.target.value)} style={{ width: '100%', padding: '0.125rem', border: '1px solid var(--border)', fontSize: '0.55rem', boxSizing: 'border-box' }}>
                                  <option value="">--</option>
                                  {finishedGoodBatches.filter(batch => batch.materialName === item.productName && batch.status === 'APPROVED').map((batch) => (<option key={batch.id} value={batch.id}>{batch.batchNumber}</option>))}
                                </select>
                              </td>
                              <td style={{ padding: '0.125rem', fontSize: '0.55rem' }}>{allocation.expiryDate}</td>
                              <td style={{ padding: '0.125rem', textAlign: 'center', fontSize: '0.55rem' }}>{selectedBatch?.availableQuantity || 0}</td>
                              <td style={{ padding: '0.125rem' }}>
                                <input type="number" value={allocation.allocatedQuantity} onChange={(e) => updateBatchAllocation(itemIndex, allocationIndex, 'allocatedQuantity', parseInt(e.target.value) || 0)} min="0" max={selectedBatch?.availableQuantity || 0} style={{ width: '100%', padding: '0.125rem', border: '1px solid var(--border)', textAlign: 'center', fontSize: '0.55rem', boxSizing: 'border-box' }} />
                              </td>
                              <td style={{ padding: '0.125rem', textAlign: 'center' }}>
                                <button type="button" onClick={() => removeBatchAllocation(itemIndex, allocationIndex)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: '0.55rem' }}><FaTrash /></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SUMMARY */}
        <div style={{ background: 'var(--bg-secondary)', padding: '0.125rem 0.25rem', marginBottom: '0.125rem', border: '2px solid var(--secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <div>
              <p style={{ textTransform: 'uppercase', fontWeight: '600', fontSize: '0.6rem', marginBottom: 0 }}>ITEMS: {form.items.length}</p>
            </div>
            <div>
              <p style={{ textTransform: 'uppercase', fontWeight: '600', fontSize: '0.6rem', marginBottom: 0 }}>TOTAL: ₹{calculateTotal().toFixed(0)}</p>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button type="submit" disabled={loading} style={{ flex: 1, background: loading ? '#f3f4f6' : 'linear-gradient(135deg, var(--secondary) 0%, #0d5d56 100%)', color: loading ? 'var(--text-secondary)' : 'white', padding: '0.25rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', opacity: loading ? 0.6 : 1 }}>
            <FaCheckCircle /> {loading ? 'CREATING...' : 'CREATE'}
          </button>
          <button type="button" onClick={() => navigate('/delivery-notes')} style={{ flex: 1, background: '#f3f4f6', color: 'var(--primary)', padding: '0.25rem', border: '2px solid var(--border)', cursor: 'pointer', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.625rem' }}>
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
};
