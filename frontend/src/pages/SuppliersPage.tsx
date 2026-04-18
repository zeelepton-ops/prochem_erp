import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@services/api';
import { useAuthStore } from '@context/authStore';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaSearch } from 'react-icons/fa';

interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  paymentTerms?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FormData extends Supplier {
  id?: string;
}

export const SuppliersPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    id: '',
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    paymentTerms: '',
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/suppliers');
      setSuppliers(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingId) {
        await apiClient.put(`/suppliers/${editingId}`, formData);
      } else {
        await apiClient.post('/suppliers', formData);
      }
      await loadSuppliers();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        id: '',
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        paymentTerms: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setFormData(supplier);
    setEditingId(supplier.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      setLoading(true);
      setError('');
      try {
        await apiClient.delete(`/suppliers/${id}`);
        await loadSuppliers();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete supplier');
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
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      paymentTerms: '',
    });
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.includes(searchTerm)
  );

  return (
    <div style={{ padding: '0.25rem', background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              color: 'var(--primary)',
            }}
          >
            <FaArrowLeft />
          </button>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', margin: 0, textTransform: 'uppercase' }}>
            SUPPLIER MANAGEMENT
          </h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: 'linear-gradient(135deg, var(--secondary) 0%, #0d5d56 100%)',
            color: 'white',
            border: 'none',
            padding: '0.25rem 0.5rem',
            borderRadius: 0,
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
          }}
        >
          <FaPlus /> ADD SUPPLIER
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.25rem', marginBottom: '0.5rem', border: '2px solid #fca5a5' }}>
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <FaSearch style={{ position: 'absolute', left: '1rem', color: 'var(--border)' }} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              border: '2px solid var(--border)',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <div style={{ background: 'white', padding: '2rem', marginBottom: '2rem', border: '2px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            {editingId ? 'EDIT SUPPLIER' : 'NEW SUPPLIER'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  SUPPLIER NAME *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', fontSize: '0.95rem', fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  CONTACT PERSON
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', fontSize: '0.95rem', fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  EMAIL
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', fontSize: '0.95rem', fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  PHONE
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', fontSize: '0.95rem', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  ADDRESS
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', fontSize: '0.95rem', fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  CITY
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', fontSize: '0.95rem', fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  STATE
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', fontSize: '0.95rem', fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  COUNTRY
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', fontSize: '0.95rem', fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  POSTAL CODE
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', fontSize: '0.95rem', fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  PAYMENT TERMS
                </label>
                <input
                  type="text"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', fontSize: '0.95rem', fontFamily: 'inherit' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  background: '#f3f4f6',
                  color: 'var(--primary)',
                  border: '2px solid var(--border)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 0,
                  cursor: 'pointer',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  fontSize: '0.875rem',
                }}
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, var(--secondary) 0%, #0d5d56 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 0,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  fontSize: '0.875rem',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'SAVING...' : 'SAVE SUPPLIER'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Suppliers Table */}
      <div style={{ background: 'white', border: '2px solid var(--border)', overflow: 'hidden' }}>
        {loading && !showForm ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading suppliers...</div>
        ) : filteredSuppliers.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No suppliers found. {!searchTerm && 'Add your first supplier to get started.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1F2937', color: 'white' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Contact</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Phone</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>City</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Payment Terms</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier, idx) => (
                  <tr key={supplier.id} style={{ background: idx % 2 === 0 ? '#f9fafb' : 'white', borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--primary)' }}>{supplier.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{supplier.contactPerson || '-'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{supplier.email || '-'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{supplier.phone || '-'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{supplier.city || '-'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{supplier.paymentTerms || '-'}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(supplier)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#0F766E',
                          fontSize: '1rem',
                          marginRight: '0.5rem',
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#DC2626',
                          fontSize: '1rem',
                        }}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
