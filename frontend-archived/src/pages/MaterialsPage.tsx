import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@services/api';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaSearch } from 'react-icons/fa';

interface MaterialBatch {
  id: string;
  batchNumber: string;
  receivedDate: string;
  expiryDate: string;
  quantity: number;
  status: 'QUARANTINE' | 'APPROVED' | 'REJECTED';
}

interface Material {
  id: string;
  code: string;
  name: string;
  description?: string;
  unitOfMeasure?: string;
  minimumStock?: number;
  reorderLevel?: number;
  batches: MaterialBatch[];
  createdAt?: string;
  updatedAt?: string;
}

interface FormData extends Omit<Material, 'batches'> {
  batches: MaterialBatch[];
}

export const MaterialsPage: React.FC = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    id: '',
    code: '',
    name: '',
    description: '',
    unitOfMeasure: '',
    minimumStock: 0,
    reorderLevel: 0,
    batches: [],
  });

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/materials');
      setMaterials(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['minimumStock', 'reorderLevel'].includes(name) ? parseInt(value) || 0 : value
    }));
  };

  const addBatch = () => {
    setFormData(prev => ({
      ...prev,
      batches: [...prev.batches, {
        id: `temp-${Date.now()}`,
        batchNumber: '',
        receivedDate: '',
        expiryDate: '',
        quantity: 0,
        status: 'QUARANTINE'
      }]
    }));
  };

  const updateBatch = (index: number, field: keyof MaterialBatch, value: any) => {
    setFormData(prev => ({
      ...prev,
      batches: prev.batches.map((batch, i) =>
        i === index ? { ...batch, [field]: value } : batch
      )
    }));
  };

  const removeBatch = (index: number) => {
    setFormData(prev => ({
      ...prev,
      batches: prev.batches.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingId) {
        await apiClient.put(`/materials/${editingId}`, formData);
      } else {
        await apiClient.post('/materials', formData);
      }
      await loadMaterials();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        id: '',
        code: '',
        name: '',
        description: '',
        unitOfMeasure: '',
        minimumStock: 0,
        reorderLevel: 0,
        batches: [],
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save material');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (material: Material) => {
    setFormData(material);
    setEditingId(material.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      setLoading(true);
      setError('');
      try {
        await apiClient.delete(`/materials/${id}`);
        await loadMaterials();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete material');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      id: '',
      code: '',
      name: '',
      description: '',
      unitOfMeasure: '',
      minimumStock: 0,
      reorderLevel: 0,
      batches: [],
    });
  };

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalStock = (batches: MaterialBatch[]) => {
    return batches.reduce((sum, batch) => sum + batch.quantity, 0);
  };

  const getStockStatus = (current: number, minimum: number | undefined, reorder: number | undefined) => {
    const min = minimum || 0;
    const reord = reorder || 0;

    if (current === 0) return { text: 'OUT OF STOCK', color: '#DC2626', bgColor: '#fee2e2' };
    if (current <= min) return { text: 'CRITICAL', color: '#D97706', bgColor: '#fef3c7' };
    if (current <= reord) return { text: 'LOW', color: '#D97706', bgColor: '#fef3c7' };
    return { text: 'OK', color: '#059669', bgColor: '#ecfdf5' };
  };

  return (
    <div style={{ padding: '0.125rem', background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.125rem', padding: '0.125rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: 'var(--primary)',
              padding: '0.125rem 0.25rem',
            }}
          >
            <FaArrowLeft />
          </button>
          <h1 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary)', margin: 0, textTransform: 'uppercase' }}>
            INVENTORY MANAGEMENT
          </h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: 'linear-gradient(135deg, var(--secondary) 0%, #0d5d56 100%)',
            color: 'white',
            border: 'none',
            padding: '0.125rem 0.375rem',
            borderRadius: 0,
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.125rem',
            textTransform: 'uppercase',
            fontSize: '0.625rem',
          }}
        >
          <FaPlus /> ADD
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.125rem 0.25rem', marginBottom: '0.125rem', border: '2px solid #fca5a5', fontSize: '0.75rem' }}>
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: '0.125rem' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <FaSearch style={{ position: 'absolute', left: '0.125rem', color: 'var(--border)', fontSize: '0.75rem' }} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.25rem 0.5rem 0.25rem 1.5rem',
              border: '2px solid var(--border)',
              fontSize: '0.75rem',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <div style={{ background: 'white', padding: '0.125rem 0.25rem', marginBottom: '0.125rem', border: '2px solid var(--border)' }}>
          <h2 style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.125rem', margin: 0 }}>
            {editingId ? 'EDIT' : 'NEW'} MATERIAL
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.125rem', marginBottom: '0.125rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.5rem', marginBottom: 0, color: 'var(--primary)' }}>CODE</label>
                <input type="text" name="code" value={formData.code} onChange={handleInputChange} required placeholder="MAT-001" style={{ width: '100%', padding: '0.125rem 0.25rem', border: '2px solid var(--border)', fontSize: '0.75rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.5rem', marginBottom: 0, color: 'var(--primary)' }}>NAME</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Material Name" style={{ width: '100%', padding: '0.125rem 0.25rem', border: '2px solid var(--border)', fontSize: '0.75rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.5rem', marginBottom: 0, color: 'var(--primary)' }}>UNIT</label>
                <input type="text" name="unitOfMeasure" value={formData.unitOfMeasure} onChange={handleInputChange} placeholder="kg, L, pc" style={{ width: '100%', padding: '0.125rem 0.25rem', border: '2px solid var(--border)', fontSize: '0.75rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.5rem', marginBottom: 0, color: 'var(--primary)' }}>MIN STOCK</label>
                <input type="number" name="minimumStock" value={formData.minimumStock} onChange={handleInputChange} min="0" style={{ width: '100%', padding: '0.125rem 0.25rem', border: '2px solid var(--border)', fontSize: '0.75rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.5rem', marginBottom: 0, color: 'var(--primary)' }}>REORDER</label>
                <input type="number" name="reorderLevel" value={formData.reorderLevel} onChange={handleInputChange} min="0" style={{ width: '100%', padding: '0.125rem 0.25rem', border: '2px solid var(--border)', fontSize: '0.75rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.5rem', marginBottom: 0, color: 'var(--primary)' }}>DESC</label>
                <input type="text" name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" style={{ width: '100%', padding: '0.125rem 0.25rem', border: '2px solid var(--border)', fontSize: '0.75rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Batches Section */}
            <div style={{ marginBottom: '0.125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.125rem' }}>
                <h3 style={{ fontSize: '0.625rem', fontWeight: '600', color: 'var(--primary)', textTransform: 'uppercase', margin: 0 }}>BATCHES</h3>
                <button type="button" onClick={addBatch} style={{ background: 'var(--secondary)', color: 'white', border: 'none', padding: '0.125rem 0.25rem', borderRadius: 0, cursor: 'pointer', fontSize: '0.6rem', textTransform: 'uppercase' }}>+ ADD</button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.65rem' }}>
                  <thead>
                    <tr style={{ background: '#1F2937', color: 'white' }}>
                      <th style={{ padding: '0.125rem', textAlign: 'left', fontWeight: '600', textTransform: 'uppercase' }}>Batch #</th>
                      <th style={{ padding: '0.125rem', textAlign: 'left', fontWeight: '600', textTransform: 'uppercase' }}>Rcvd Date</th>
                      <th style={{ padding: '0.125rem', textAlign: 'left', fontWeight: '600', textTransform: 'uppercase' }}>Exp Date</th>
                      <th style={{ padding: '0.125rem', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase' }}>Qty</th>
                      <th style={{ padding: '0.125rem', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '0.125rem', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase' }}>Act</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.batches.map((batch, index) => (
                      <tr key={batch.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.125rem' }}><input type="text" value={batch.batchNumber} onChange={(e) => updateBatch(index, 'batchNumber', e.target.value)} style={{ width: '100%', padding: '0.125rem', border: '1px solid var(--border)', fontSize: '0.6rem', boxSizing: 'border-box' }} /></td>
                        <td style={{ padding: '0.125rem' }}><input type="date" value={batch.receivedDate} onChange={(e) => updateBatch(index, 'receivedDate', e.target.value)} style={{ width: '100%', padding: '0.125rem', border: '1px solid var(--border)', fontSize: '0.6rem', boxSizing: 'border-box' }} /></td>
                        <td style={{ padding: '0.125rem' }}><input type="date" value={batch.expiryDate} onChange={(e) => updateBatch(index, 'expiryDate', e.target.value)} style={{ width: '100%', padding: '0.125rem', border: '1px solid var(--border)', fontSize: '0.6rem', boxSizing: 'border-box' }} /></td>
                        <td style={{ padding: '0.125rem' }}><input type="number" value={batch.quantity} onChange={(e) => updateBatch(index, 'quantity', parseInt(e.target.value) || 0)} min="0" style={{ width: '100%', padding: '0.125rem', border: '1px solid var(--border)', fontSize: '0.6rem', boxSizing: 'border-box' }} /></td>
                        <td style={{ padding: '0.125rem' }}><select value={batch.status} onChange={(e) => updateBatch(index, 'status', e.target.value)} style={{ width: '100%', padding: '0.125rem', border: '1px solid var(--border)', fontSize: '0.6rem', boxSizing: 'border-box' }}><option value="QUARANTINE">QUA</option><option value="APPROVED">APP</option><option value="REJECTED">REJ</option></select></td>
                        <td style={{ padding: '0.125rem', textAlign: 'center' }}><button type="button" onClick={() => removeBatch(index)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: '0.6rem' }}><FaTrash /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={handleCancel} style={{ background: '#f3f4f6', color: 'var(--primary)', border: '2px solid var(--border)', padding: '0.25rem 0.5rem', borderRadius: 0, cursor: 'pointer', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.625rem' }}>CANCEL</button>
              <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, #0d5d56 100%)', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: 0, cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.625rem', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'SAVING...' : 'SAVE'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Materials Table */}
      <div style={{ background: 'white', border: '2px solid var(--border)', overflow: 'hidden' }}>
        {loading && !showForm ? (
          <div style={{ padding: '0.25rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Loading...</div>
        ) : filteredMaterials.length === 0 ? (
          <div style={{ padding: '0.25rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            No materials. {!searchTerm && 'Add your first material.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1F2937', color: 'white' }}>
                  <th style={{ padding: '0.125rem 0.25rem', textAlign: 'left', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.625rem', borderBottom: '2px solid var(--border)' }}>Code</th>
                  <th style={{ padding: '0.125rem 0.25rem', textAlign: 'left', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.625rem', borderBottom: '2px solid var(--border)' }}>Name</th>
                  <th style={{ padding: '0.125rem 0.25rem', textAlign: 'left', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.625rem', borderBottom: '2px solid var(--border)' }}>Unit</th>
                  <th style={{ padding: '0.125rem 0.25rem', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.625rem', borderBottom: '2px solid var(--border)' }}>Stock</th>
                  <th style={{ padding: '0.125rem 0.25rem', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.625rem', borderBottom: '2px solid var(--border)' }}>Min</th>
                  <th style={{ padding: '0.125rem 0.25rem', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.625rem', borderBottom: '2px solid var(--border)' }}>Status</th>
                  <th style={{ padding: '0.125rem 0.25rem', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.625rem', borderBottom: '2px solid var(--border)' }}>Act</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((material, idx) => {
                  const totalStock = getTotalStock(material.batches);
                  const status = getStockStatus(totalStock, material.minimumStock, material.reorderLevel);
                  return (
                    <tr key={material.id} style={{ background: idx % 2 === 0 ? '#f9fafb' : 'white', borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.125rem 0.25rem', fontWeight: '600', color: 'var(--primary)', fontSize: '0.75rem' }}>{material.code}</td>
                      <td style={{ padding: '0.125rem 0.25rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{material.name}</td>
                      <td style={{ padding: '0.125rem 0.25rem', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.75rem' }}>{material.unitOfMeasure || '-'}</td>
                      <td style={{ padding: '0.125rem 0.25rem', textAlign: 'center', fontWeight: '600', color: 'var(--primary)', fontSize: '0.75rem' }}>{totalStock}</td>
                      <td style={{ padding: '0.125rem 0.25rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{material.minimumStock || 0}</td>
                      <td style={{ padding: '0.125rem 0.25rem', textAlign: 'center' }}>
                        <div style={{
                          display: 'inline-block',
                          padding: '0.125rem 0.25rem',
                          background: status.bgColor,
                          color: status.color,
                          fontWeight: '600',
                          fontSize: '0.55rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          {status.text}
                        </div>
                      </td>
                      <td style={{ padding: '0.125rem 0.25rem', textAlign: 'center' }}>
                        <button
                          onClick={() => handleEdit(material)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#0F766E',
                            fontSize: '0.75rem',
                            marginRight: '0.125rem',
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(material.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#DC2626',
                            fontSize: '0.75rem',
                          }}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
