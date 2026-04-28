import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@services/api';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaSearch } from 'react-icons/fa';

interface Customer {
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
  createdAt?: string;
  updatedAt?: string;
}

interface FormData extends Omit<Customer, 'id'> {
  id?: string;
}

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
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
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/customers');
      setCustomers(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customers');
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
        await apiClient.put(`/customers/${editingId}`, formData);
      } else {
        await apiClient.post('/customers', formData);
      }
      await loadCustomers();
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
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setFormData(customer);
    setEditingId(customer.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setLoading(true);
      setError('');
      try {
        await apiClient.delete(`/customers/${id}`);
        await loadCustomers();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete customer');
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
    });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  return (
    <div style={{ padding: '2rem', background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.5rem',
              color: 'var(--primary)',
            }}
          >
            <FaArrowLeft />
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)', margin: 0, textTransform: 'uppercase' }}>
            CUSTOMER MANAGEMENT
          </h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: 'linear-gradient(135deg, var(--secondary) 0%, #0d5d56 100%)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: 0,
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textTransform: 'uppercase',
            fontSize: '0.875rem',
          }}
        >
          <FaPlus /> ADD CUSTOMER
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', marginBottom: '1.5rem', border: '2px solid #fca5a5' }}>
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: '2rem' }}>
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
            {editingId ? 'EDIT CUSTOMER' : 'NEW CUSTOMER'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  CUSTOMER NAME *
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
                {loading ? 'SAVING...' : 'SAVE CUSTOMER'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customers Table */}
      <div style={{ background: 'white', border: '2px solid var(--border)', overflow: 'hidden' }}>
        {loading && !showForm ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No customers found. {!searchTerm && 'Add your first customer to get started.'}
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
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, idx) => (
                  <tr key={customer.id} style={{ background: idx % 2 === 0 ? '#f9fafb' : 'white', borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--primary)' }}>{customer.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{customer.contactPerson || '-'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{customer.email || '-'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{customer.phone || '-'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{customer.city || '-'}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(customer)}
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
                        onClick={() => handleDelete(customer.id)}
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
