import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentCar, setLoading } from '../redux/slices/carSlice';
import api from '../utils/api';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCar, loading } = useSelector((state) => state.cars);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      dispatch(setLoading(true));
      const response = await api.get(`/cars/${id}`);
      dispatch(setCurrentCar(response.data.car));
    } catch (error) {
      console.error('Error fetching car details:', error);
    }
  };

  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/booking/${id}`);
    }
  };

  if (loading || !currentCar) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '8px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <img
          src={currentCar.images?.[0] ? `http://localhost:5001${currentCar.images[0]}` : 'https://via.placeholder.com/800x400'}
          alt={currentCar.name}
          style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '2rem' }}
        />

        <h1 style={{ marginBottom: '1rem', color: '#000' }}>{currentCar.name}</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div><strong>Brand:</strong> {currentCar.brand}</div>
          <div><strong>Model:</strong> {currentCar.model}</div>
          <div><strong>Type:</strong> {currentCar.type}</div>
          <div><strong>Seats:</strong> {currentCar.seats}</div>
          <div><strong>Fuel:</strong> {currentCar.fuelType}</div>
          <div><strong>Transmission:</strong> {currentCar.transmission}</div>
        </div>

        <p style={{ marginBottom: '1.5rem', color: '#666' }}>{currentCar.description}</p>

        {currentCar.features && currentCar.features.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <strong>Features:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {currentCar.features.map((feature, index) => (
                <span key={index} style={{
                  background: '#f0f0f0',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.9rem'
                }}>
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000' }}>₹{currentCar.rentPerDay}/day</div>
            <div style={{ color: currentCar.availability ? '#28a745' : '#dc3545', fontWeight: '500', marginTop: '0.5rem' }}>
              {currentCar.availability ? '✓ Available' : '✗ Not Available'}
            </div>
          </div>
          <button
            onClick={handleBookNow}
            disabled={!currentCar.availability}
            style={{
              background: currentCar.availability ? '#000' : '#999',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '4px',
              cursor: currentCar.availability ? 'pointer' : 'not-allowed',
              fontSize: '1.1rem',
              fontWeight: '500'
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
