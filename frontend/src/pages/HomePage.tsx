import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, rgb(37, 99, 235), rgb(30, 58, 138))', color: 'white', paddingTop: '2rem' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', paddingTop: '4rem', paddingBottom: '4rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
        <div style={{ maxWidth: '42rem', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Building Materials Management System</h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
            Streamline your operations with comprehensive management of purchase orders, sales orders,
            production tracking, and delivery workflows.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '4rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Purchase Orders</h3>
              <p>Manage supplier relationships and track incoming materials efficiently.</p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Sales Orders</h3>
              <p>Handle customer orders and delivery schedules with ease.</p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Production</h3>
              <p>Track batch production and manage quality testing workflows.</p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Inventory</h3>
              <p>Maintain optimal stock levels and track material movements.</p>
            </div>
          </div>

          <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login" style={{ padding: '0.75rem 2rem', background: 'rgb(37, 99, 235)', color: 'white', textDecoration: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>
              Login
            </Link>
            <Link to="/register" style={{ padding: '0.75rem 2rem', background: 'rgba(255, 255, 255, 0.2)', color: 'white', textDecoration: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', border: '2px solid white' }}>
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
