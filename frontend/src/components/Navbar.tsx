import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@context/authStore';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';

export const Navbar: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav style={{ background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)', borderBottom: '3px solid #0F766E', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.875rem', fontWeight: 'bold', color: 'white', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.5rem' }}>📦</span> BMM SYSTEM
          </Link>

          {/* Desktop Menu */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }} className="hidden lg:flex">
            {user ? (
              <>
                <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 0.75rem', transition: 'all 0.3s', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '500', letterSpacing: '0.5px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F766E'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  Dashboard
                </Link>
                
                <div className="relative group">
                  <button style={{ color: 'white', padding: '0.5rem 0.75rem', transition: 'all 0.3s', cursor: 'pointer', background: 'transparent', border: 'none', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '500', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.25rem' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F766E'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    MATERIALS <FaChevronDown className="text-sm" />
                  </button>
                  <div className="absolute left-0 mt-0 w-48 bg-white text-gray-800 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition" style={{ borderRadius: 0 }}>
                    <Link to="/purchase-orders" className="block px-4 py-2" style={{ textDecoration: 'none', color: 'inherit' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>Purchase Orders</Link>
                    <Link to="/material-tests" className="block px-4 py-2" style={{ textDecoration: 'none', color: 'inherit' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>Material Testing</Link>
                  </div>
                </div>

                <div className="relative group">
                  <button style={{ color: 'white', padding: '0.5rem 0.75rem', transition: 'all 0.3s', cursor: 'pointer', background: 'transparent', border: 'none', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '500', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.25rem' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F766E'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    OPERATIONS <FaChevronDown className="text-sm" />
                  </button>
                  <div className="absolute left-0 mt-0 w-48 bg-white text-gray-800 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition" style={{ borderRadius: 0 }}>
                    <Link to="/production" className="block px-4 py-2" style={{ textDecoration: 'none', color: 'inherit' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>Production</Link>
                    <Link to="/sales-orders" className="block px-4 py-2" style={{ textDecoration: 'none', color: 'inherit' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>Sales Orders</Link>
                    <Link to="/delivery-notes" className="block px-4 py-2" style={{ textDecoration: 'none', color: 'inherit' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>Deliveries</Link>
                  </div>
                </div>

                <Link to="/audit-logs" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 0.75rem', transition: 'all 0.3s', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '500', letterSpacing: '0.5px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F766E'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  LOGS
                </Link>

                <div className="relative group">
                  <button style={{ color: 'white', padding: '0.5rem 0.75rem', transition: 'all 0.3s', cursor: 'pointer', background: 'transparent', border: 'none', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '500', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.25rem' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F766E'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    MASTER DATA <FaChevronDown className="text-sm" />
                  </button>
                  <div className="absolute left-0 mt-0 w-48 bg-white text-gray-800 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition" style={{ borderRadius: 0 }}>
                    <Link to="/suppliers" className="block px-4 py-2" style={{ textDecoration: 'none', color: 'inherit' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>Suppliers</Link>
                    <Link to="/customers" className="block px-4 py-2" style={{ textDecoration: 'none', color: 'inherit' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>Customers</Link>
                    <Link to="/materials" className="block px-4 py-2" style={{ textDecoration: 'none', color: 'inherit' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>Inventory</Link>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingLeft: '1rem', borderLeft: '1px solid #0F766E' }}>
                  <span style={{ color: 'white', fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: '500' }}>
                    {user.firstName} {user.lastName}
                  </span>
                  <button
                    onClick={handleLogout}
                    style={{ background: '#DC2626', color: 'white', padding: '0.5rem 1rem', border: 'none', cursor: 'pointer', transition: 'all 0.3s', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.875rem' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#B91C1C'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#DC2626'}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', transition: 'all 0.3s', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '500' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F766E'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  Sign In
                </Link>
                <Link to="/register" style={{ background: 'white', color: '#0F766E', padding: '0.5rem 1rem', fontWeight: '600', transition: 'all 0.3s', cursor: 'pointer', textDecoration: 'none', textTransform: 'uppercase', fontSize: '0.875rem' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', display: 'none' }}
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div style={{ paddingBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }} className="lg:hidden">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  style={{ display: 'block', color: 'white', textDecoration: 'none', padding: '0.75rem', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F766E'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/purchase-orders"
                  style={{ display: 'block', color: 'white', textDecoration: 'none', padding: '0.75rem', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F766E'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => setIsOpen(false)}
                >
                  Purchase Orders
                </Link>
                <Link
                  to="/material-tests"
                  style={{ display: 'block', color: 'white', textDecoration: 'none', padding: '0.75rem', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F766E'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => setIsOpen(false)}
                >
                  Material Testing
                </Link>
                <Link
                  to="/production"
                  style={{ display: 'block', color: 'white', textDecoration: 'none', padding: '0.75rem', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F766E'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => setIsOpen(false)}
                >
                  Production
                </Link>
                <Link
                  to="/sales-orders"
                  style={{ display: 'block', color: 'white', textDecoration: 'none', padding: '0.75rem', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F766E'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => setIsOpen(false)}
                >
                  Sales Orders
                </Link>
                <Link
                  to="/delivery-notes"
                  style={{ display: 'block', color: 'white', textDecoration: 'none', padding: '0.75rem', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F766E'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => setIsOpen(false)}
                >
                  Deliveries
                </Link>
                <Link
                  to="/audit-logs"
                  style={{ display: 'block', color: 'white', textDecoration: 'none', padding: '0.75rem', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F766E'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => setIsOpen(false)}
                >
                  Audit Logs
                </Link>
                <button
                  onClick={handleLogout}
                  style={{ width: '100%', textAlign: 'left', background: '#DC2626', color: 'white', padding: '0.75rem', border: 'none', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '500', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#B91C1C'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#DC2626'}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{ display: 'block', color: 'white', textDecoration: 'none', padding: '0.75rem', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F766E'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  style={{ display: 'block', color: 'white', textDecoration: 'none', padding: '0.75rem', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F766E'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
