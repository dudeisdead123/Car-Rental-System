import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser, setLoading, setError } from '../redux/slices/authSlice';
import api from '../utils/api';

const Login = () => {
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      dispatch(setLoading(true));
      const response = await api.post('/auth/login', formData);
      dispatch(setUser(response.data));
      
      if (response.data.user.role === 'admin') {
        navigate('/admin/cars');
      } else {
        navigate('/');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setErrorMessage(message);
      dispatch(setError(message));
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await api.post('/auth/request-otp', { 
        email: formData.email
      });
      setOtpSent(true);
      alert(response.data.message);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send OTP';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      dispatch(setLoading(true));
      const response = await api.post('/auth/verify-otp', { 
        email: formData.email,
        otp 
      });
      dispatch(setUser(response.data));
      
      if (response.data.user.role === 'admin') {
        navigate('/admin/cars');
      } else {
        navigate('/');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'OTP verification failed';
      setErrorMessage(message);
      dispatch(setError(message));
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '450px', width: '100%', background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#000' }}>Login</h2>
        
        {/* Login Method Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#f0f0f0', padding: '0.25rem', borderRadius: '6px' }}>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('password');
              setErrorMessage('');
              setOtpSent(false);
            }}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              borderRadius: '4px',
              background: loginMethod === 'password' ? '#000' : 'transparent',
              color: loginMethod === 'password' ? 'white' : '#666',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('otp');
              setErrorMessage('');
            }}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              borderRadius: '4px',
              background: loginMethod === 'otp' ? '#000' : 'transparent',
              color: loginMethod === 'otp' ? 'white' : '#666',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            OTP
          </button>
        </div>
        
        {error && (
          <div style={{ background: '#f8d7da', color: '#721c24', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        
        {loginMethod === 'password' ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: '#000',
                color: 'white',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          !otpSent ? (
            <form onSubmit={handleRequestOTP}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your registered email"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '0.5rem' }}>
                  📧 OTP will be sent to this email address
                </small>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: '#000',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP to Email'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#e7f3ff', borderRadius: '4px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📧</span>
                <span>OTP sent to <strong>{formData.email}</strong>. Check your inbox!</span>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength="6"
                  placeholder="6-digit code"
                  style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    border: '2px solid #000', 
                    borderRadius: '4px', 
                    fontSize: '1.5rem', 
                    letterSpacing: '0.5rem', 
                    textAlign: 'center',
                    fontWeight: '600'
                  }}
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: '#000',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                }}
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: '#666',
                  border: '1px solid #ddd',
                  padding: '0.6rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                ← Back to Email Entry
              </button>
            </form>
          )
        )}
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666' }}>
          Don't have an account? <Link to="/register" style={{ color: '#000', fontWeight: '500', textDecoration: 'none' }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
