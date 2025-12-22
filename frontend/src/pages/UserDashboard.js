import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings/my-bookings');
      setBookings(response.data.bookings);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem', color: '#000' }}>My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px' }}>
          <p style={{ color: '#666', fontSize: '1.2rem' }}>You don't have any bookings yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {bookings.map((booking) => (
            <div key={booking._id} style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'grid',
              gridTemplateColumns: '200px 1fr',
              gap: '1.5rem'
            }}>
              <img
                src={booking.car?.images?.[0] ? `http://localhost:5001${booking.car.images[0]}` : 'https://via.placeholder.com/200x150'}
                alt={booking.car?.name}
                style={{ width: '200px', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
              />
              
              <div>
                <h3 style={{ marginBottom: '0.5rem', color: '#000' }}>{booking.car?.name}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', color: '#666', marginBottom: '1rem' }}>
                  <div><strong>From:</strong> {formatDate(booking.startDate)}</div>
                  <div><strong>To:</strong> {formatDate(booking.endDate)}</div>
                  <div><strong>Days:</strong> {booking.totalDays}</div>
                  <div><strong>Total:</strong> ₹{booking.totalAmount}</div>
                  <div><strong>Pickup:</strong> {booking.pickupLocation}</div>
                  <div><strong>Dropoff:</strong> {booking.dropoffLocation}</div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    background: booking.status === 'confirmed' ? '#28a745' : booking.status === 'pending' ? '#ffc107' : '#dc3545',
                    color: 'white'
                  }}>
                    {booking.status}
                  </span>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    background: booking.paymentStatus === 'paid' ? '#28a745' : '#ffc107',
                    color: 'white'
                  }}>
                    Payment: {booking.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
