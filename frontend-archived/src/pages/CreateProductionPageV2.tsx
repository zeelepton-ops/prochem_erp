import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@services/api';
import { useAuthStore } from '@context/authStore';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

export const CreateProductionPageV2: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    batchNumber: `BATCH-${Date.now()}`,
    productId: '',
    quantityPlanned: 0,
    quantityProduced: 0,
    plannedStartDate: '',
    plannedEndDate: '',
    actualStartDate: '',
    actualEndDate: '',
    formula: '',
    instructions: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setProducts([
        { 
          id: '1', 
          name: 'Product A',
          code: 'PROD001',
          formula: 'Formula A: Mix 2:1 ratio',
          uom: 'KG'
        },
        { 
          id: '2', 
          name: 'Product B',
          code: 'PROD002',
          formula: 'Formula B: Mix 3:1 ratio',
          uom: 'L'
        },
      ]);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'productId') {
      const product = products.find((p) => p.id === value);
      setForm({ 
        ...form, 
        [name]: value,
        formula: product?.formula || '',
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validateDates = () => {
    if (form.plannedStartDate && form.plannedEndDate) {
      if (new Date(form.plannedStartDate) >= new Date(form.plannedEndDate)) {
        setError('Planned end date must be after planned start date');
        return false;
      }
    }

    if (form.actualStartDate && form.actualEndDate) {
      if (new Date(form.actualStartDate) >= new Date(form.actualEndDate)) {
        setError('Actual end date must be after actual start date');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.productId) {
      setError('Please select a product');
      return;
    }

    if (form.quantityPlanned <= 0) {
      setError('Planned quantity must be greater than 0');
      return;
    }

    if (!form.plannedStartDate || !form.plannedEndDate) {
      setError('Please specify planned start and end dates');
      return;
    }

    if (!validateDates()) {
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/production', {
        batchNumber: form.batchNumber,
        productId: form.productId,
        quantityPlanned: form.quantityPlanned,
        quantityProduced: form.quantityProduced || 0,
        plannedStartDate: form.plannedStartDate,
        plannedEndDate: form.plannedEndDate,
        actualStartDate: form.actualStartDate || null,
        actualEndDate: form.actualEndDate || null,
        formula: form.formula,
        instructions: form.instructions,
        status: 'PLANNED',
        createdBy: user?.id,
      });
      navigate('/production');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create production batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <button
        onClick={() => navigate('/production')}
        style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--secondary)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '600',
          marginBottom: '2rem',
        }}
      >
        <FaArrowLeft /> BACK TO PRODUCTION
      </button>

      <div style={{ borderBottom: '3px solid var(--secondary)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-dark)', textTransform: 'uppercase', margin: 0 }}>
          CREATE PRODUCTION BATCH
        </h1>
      </div>

      {error && (
        <div style={{ 
          background: 'rgba(220, 38, 38, 0.05)',
          borderLeft: '4px solid var(--accent)',
          color: 'var(--accent)',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', marginBottom: '2rem' }}>
        
        {/* HEADER SECTION */}
        <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            BATCH DETAILS
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                BATCH NUMBER *
              </label>
              <input
                type="text"
                value={form.batchNumber}
                disabled
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', background: 'var(--bg-secondary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                PRODUCT *
              </label>
              <select
                name="productId"
                value={form.productId}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', fontSize: '0.95rem' }}
              >
                <option value="">-- Select Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code}) - UOM: {p.uom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                PLANNED QUANTITY *
              </label>
              <input
                type="number"
                name="quantityPlanned"
                value={form.quantityPlanned}
                onChange={handleChange}
                required
                min="1"
                placeholder="0"
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                PRODUCED QUANTITY (Initial)
              </label>
              <input
                type="number"
                name="quantityProduced"
                value={form.quantityProduced}
                onChange={handleChange}
                min="0"
                placeholder="0"
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', margin: '0.25rem 0 0 0' }}>
                Will be updated during production (default: 0)
              </p>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
              FORMULA / RECIPE
            </label>
            <textarea
              name="formula"
              value={form.formula}
              onChange={handleChange}
              placeholder="Formula will auto-populate from product"
              rows={3}
              style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', fontSize: '0.95rem', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* SCHEDULED DATES SECTION */}
        <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            PLANNED SCHEDULE
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                PLANNED START DATE *
              </label>
              <input
                type="date"
                name="plannedStartDate"
                value={form.plannedStartDate}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                PLANNED END DATE *
              </label>
              <input
                type="date"
                name="plannedEndDate"
                value={form.plannedEndDate}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)' }}
              />
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: '1rem 0 0 0' }}>
            Duration: {form.plannedStartDate && form.plannedEndDate 
              ? Math.floor((new Date(form.plannedEndDate).getTime() - new Date(form.plannedStartDate).getTime()) / (1000 * 60 * 60 * 24)) + ' days'
              : 'N/A'
            }
          </p>
        </div>

        {/* ACTUAL DATES SECTION (OPTIONAL - Filled during production) */}
        <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            ACTUAL SCHEDULE (Filled During Production)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                ACTUAL START DATE
              </label>
              <input
                type="date"
                name="actualStartDate"
                value={form.actualStartDate}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', background: 'white' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                ACTUAL END DATE
              </label>
              <input
                type="date"
                name="actualEndDate"
                value={form.actualEndDate}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', background: 'white' }}
              />
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: '1rem 0 0 0' }}>
            Leave empty for now - fill when production starts
          </p>
        </div>

        {/* INSTRUCTIONS SECTION */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            PRODUCTION INSTRUCTIONS
          </h2>

          <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
            SPECIAL INSTRUCTIONS
          </label>
          <textarea
            name="instructions"
            value={form.instructions}
            onChange={handleChange}
            placeholder="Add any special production instructions, quality notes, or requirements"
            rows={5}
            style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', fontSize: '0.95rem', fontFamily: 'inherit' }}
          />
        </div>

        {/* STATUS INFO */}
        <div style={{ background: 'rgba(15, 118, 110, 0.05)', padding: '1.5rem', marginBottom: '2rem', border: '2px solid var(--secondary)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--secondary)', margin: '0 0 1rem 0', textTransform: 'uppercase' }}>
            BATCH STATUS
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              display: 'inline-block', 
              padding: '0.5rem 1rem', 
              background: 'rgba(217, 119, 6, 0.1)', 
              color: 'var(--warning)',
              fontWeight: '700',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
            }}>
              PLANNED
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', margin: 0 }}>
              Initial status will be set to "PLANNED". Update during production phase.
            </p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              background: loading ? 'var(--text-light)' : 'linear-gradient(135deg, var(--secondary), var(--secondary-light))',
              color: 'white',
              padding: '1rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              textTransform: 'uppercase',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: loading ? 0.5 : 1,
            }}
          >
            <FaCheckCircle /> {loading ? 'CREATING...' : 'CREATE PRODUCTION BATCH'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/production')}
            style={{
              flex: 1,
              background: 'var(--border-dark)',
              color: 'var(--primary)',
              padding: '1rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              textTransform: 'uppercase',
              fontSize: '1rem',
            }}
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
};
