import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addBooking } from '../redux/slices/bookingSlice';
import api from '../utils/api';

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [car, setCar] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCarDetails();
    loadRazorpayScript();
  }, [id]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchCarDetails = async () => {
    try {
      const response = await api.get(`/cars/${id}`);
      setCar(response.data.car);
    } catch (error) {
      setError('Error fetching car details');
    }
  };

  const calculateDays = () => {
    if (startDate && endDate) {
      const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    }
    return 0;
  };

  const totalDays = calculateDays();
  const totalAmount = totalDays * (car?.rentPerDay || 0);

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!pickupLocation || !dropoffLocation) {
      setError('Please provide pickup and dropoff locations');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      setLoading(true);

      // Step 1: Create Razorpay order
      const orderResponse = await api.post('/razorpay/create-order', {
        car: id,
        startDate,
        endDate,
        pickupLocation,
        dropoffLocation,
      });

      const { order, booking } = orderResponse.data;

      // Step 2: Open Razorpay payment modal
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
        amount: order.amount,
        currency: order.currency,
        name: 'Car Rental System',
        description: `Booking for ${car.name}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // Step 3: Verify payment on backend
            const verifyResponse = await api.post('/razorpay/verify-payment', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              bookingId: booking._id,
            });

            dispatch(addBooking(verifyResponse.data.booking));
            alert('🎉 Payment successful! Booking confirmed. Check your email for confirmation.');
            navigate('/dashboard');
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed');
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: function () {
            setError('Payment cancelled');
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment initiation failed');
      setLoading(false);
    }
  };

  if (!car) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#000' }}>Book {car.name}</h2>
        
        {error && (
          <div style={{ background: '#f8d7da', color: '#721c24', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handlePayment}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>Pickup Location</label>
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>Dropoff Location</label>
            <input
              type="text"
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          {totalDays > 0 && (
            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Total Days:</span>
                <strong>{totalDays}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Price per Day:</span>
                <strong>₹{car.rentPerDay}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', color: '#000', borderTop: '2px solid #ddd', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <span>Total Amount:</span>
                <strong>₹{totalAmount}</strong>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || totalDays === 0}
            style={{
              width: '100%',
              background: loading || totalDays === 0 ? '#999' : '#000',
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '4px',
              cursor: loading || totalDays === 0 ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            {loading ? 'Processing...' : `Pay ₹${totalAmount} with Razorpay`}
          </button>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', marginTop: '1rem' }}>
            🔒 Secure payment via Razorpay
          </p>
        </form>
      </div>
    </div>
  );
};

export default Booking;
