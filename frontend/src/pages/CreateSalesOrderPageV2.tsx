import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@services/api';
import { useAuthStore } from '@context/authStore';
import { FaArrowLeft, FaPlus, FaTrash, FaCheckCircle } from 'react-icons/fa';

interface SalesOrderItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export const CreateSalesOrderPageV2: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    soNumber: `SO-${Date.now()}`,
    customerId: '',
    expectedDeliveryDate: '',
    notes: '',
    items: [] as SalesOrderItem[],
  });

  const [newItem, setNewItem] = useState({
    productId: '',
    productName: '',
    quantity: 0,
    unitPrice: 0,
  });

  useEffect(() => {
    loadCustomers();
    loadProducts();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await apiClient.get('/customers');
      setCustomers(response.data || []);
    } catch (err) {
      console.error('Failed to load customers', err);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await apiClient.get('/materials');
      setProducts(response.data || []);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const addItem = () => {
    if (!newItem.productId || newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      setError('Please fill all item fields correctly');
      return;
    }

    const lineTotal = newItem.quantity * newItem.unitPrice;
    setForm({
      ...form,
      items: [
        ...form.items,
        {
          productId: newItem.productId,
          productName: newItem.productName,
          quantity: newItem.quantity,
          unitPrice: newItem.unitPrice,
          lineTotal: lineTotal,
        },
      ],
    });

    setNewItem({ productId: '', productName: '', quantity: 0, unitPrice: 0 });
    setError('');
  };

  const removeItem = (index: number) => {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };

  const calculateTotal = () => {
    return form.items.reduce((sum, item) => sum + item.lineTotal, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.customerId) {
      setError('Please select a customer');
      return;
    }

    if (form.items.length === 0) {
      setError('Please add at least one item');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/sales-orders', {
        soNumber: form.soNumber,
        customerId: form.customerId,
        expectedDeliveryDate: form.expectedDeliveryDate,
        items: form.items,
        notes: form.notes,
        totalAmount: calculateTotal(),
        createdBy: user?.id,
        status: 'PENDING',
      });
      navigate('/sales-orders');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create sales order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <button
        onClick={() => navigate('/sales-orders')}
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
        <FaArrowLeft /> BACK TO SALES ORDERS
      </button>

      <div style={{ borderBottom: '3px solid var(--secondary)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-dark)', textTransform: 'uppercase', margin: 0 }}>
          CREATE SALES ORDER
        </h1>
      </div>

      {error && (
        <div style={{ 
          background: 'rgba(220, 38, 38, 0.05)',
          border: 'left 4px solid var(--accent)',
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
            SALES ORDER DETAILS
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                SO NUMBER *
              </label>
              <input
                type="text"
                name="soNumber"
                value={form.soNumber}
                disabled
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', background: 'var(--bg-secondary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                CUSTOMER *
              </label>
              <select
                name="customerId"
                value={form.customerId}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', fontSize: '0.95rem' }}
              >
                <option value="">-- Select Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                EXPECTED DELIVERY DATE *
              </label>
              <input
                type="date"
                name="expectedDeliveryDate"
                value={form.expectedDeliveryDate}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                TOTAL AMOUNT
              </label>
              <input
                type="number"
                disabled
                value={calculateTotal().toFixed(2)}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', background: 'var(--bg-secondary)' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
              SPECIAL INSTRUCTIONS
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Add any special delivery instructions or notes"
              rows={4}
              style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', fontSize: '0.95rem', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* LINE ITEMS SECTION */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            ORDERED ITEMS
          </h2>

          {/* Add Item Form */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', marginBottom: '1.5rem', border: '2px solid var(--border)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', textTransform: 'uppercase', color: 'var(--primary)' }}>
              ADD NEW ITEM
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  PRODUCT *
                </label>
                <select
                  value={newItem.productId}
                  onChange={(e) => {
                    const product = products.find((p) => p.id === e.target.value);
                    setNewItem({ ...newItem, productId: e.target.value, productName: product?.name || '' });
                  }}
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)' }}
                >
                  <option value="">-- Select --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  QUANTITY *
                </label>
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
                  min="1"
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  UNIT PRICE *
                </label>
                <input
                  type="number"
                  value={newItem.unitPrice}
                  onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) })}
                  min="0"
                  step="0.01"
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  onClick={addItem}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, var(--secondary), var(--secondary-light))',
                    color: 'white',
                    padding: '0.75rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <FaPlus /> ADD
                </button>
              </div>
            </div>
          </div>

          {/* Items Table */}
          {form.items.length > 0 && (
            <table style={{ width: '100%', marginBottom: '1.5rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--primary-dark)', color: 'white' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Product
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Qty
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Unit Price
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Line Total
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>{item.productName}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>{item.quantity}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>₹{item.unitPrice.toFixed(2)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: 'var(--secondary)' }}>
                      ₹{item.lineTotal.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        style={{
                          background: 'var(--accent)',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <FaTrash /> DELETE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* SUMMARY */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', marginBottom: '2rem', border: '2px solid var(--secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '3rem' }}>
            <div>
              <p style={{ textTransform: 'uppercase', fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Total Items: <strong>{form.items.length}</strong>
              </p>
            </div>
            <div>
              <p style={{ textTransform: 'uppercase', fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Total Amount:
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--secondary)', margin: 0 }}>
                ₹{calculateTotal().toFixed(2)}
              </p>
            </div>
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
            <FaCheckCircle /> {loading ? 'CREATING...' : 'CREATE SALES ORDER'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/sales-orders')}
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
