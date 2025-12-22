import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #000 0%, #434343 100%)',
      color: 'white',
      padding: '1rem 2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
          🚗 Car Rental
        </Link>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link to="/admin/cars" style={{ color: 'white', textDecoration: 'none' }}>Admin Panel</Link>
              ) : (
                <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>My Bookings</Link>
              )}
              <span style={{ color: '#ddd' }}>Hi, {user.name}</span>
              <button onClick={handleLogout} style={{
                background: 'white',
                color: '#000',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
              <Link to="/register" style={{
                background: 'white',
                color: '#000',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                fontWeight: '500'
              }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
