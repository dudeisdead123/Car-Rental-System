import React, { useEffect, useState } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import api from '../utils/api';
import CarForm from './CarForm';

const ManageCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cars');
      setCars(response.data.cars);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await api.delete(`/cars/${id}`);
        alert('Car deleted successfully');
        fetchCars();
      } catch (error) {
        alert('Failed to delete car');
      }
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await api.patch(`/cars/${id}`, { availability: !currentStatus });
      alert('Availability updated');
      fetchCars();
    } catch (error) {
      alert('Failed to update availability');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h2>Manage Cars</h2>
        <Link to="/admin/cars/add" style={{
          background: '#000',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '4px',
          textDecoration: 'none'
        }}>
          + Add New Car
        </Link>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {cars.map(car => (
          <div key={car._id} style={{ 
            background: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
            overflow: 'hidden',
            transition: 'transform 0.2s, box-shadow 0.2s',
            ':hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }
          }}>
            <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
              <img
                src={car.images?.[0] ? `http://localhost:5001${car.images[0]}` : 'https://via.placeholder.com/400x220'}
                alt={car.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: car.availability ? '#28a745' : '#dc3545',
                color: 'white',
                padding: '0.4rem 0.9rem',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}>
                {car.availability ? '✓ Available' : '✕ Unavailable'}
              </div>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#000' }}>{car.name}</h3>
              <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.95rem' }}>
                <strong>{car.brand}</strong> {car.model} • {car.type}
              </p>
              <p style={{ margin: '0.75rem 0', fontSize: '1.5rem', fontWeight: '700', color: '#000' }}>
                ₹{car.rentPerDay}<span style={{ fontSize: '0.9rem', fontWeight: '400', color: '#666' }}>/day</span>
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  onClick={() => toggleAvailability(car._id, car.availability)}
                  style={{
                    flex: 1,
                    background: '#ffc107',
                    color: '#000',
                    border: 'none',
                    padding: '0.65rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  Toggle Status
                </button>
                <Link
                  to={`/admin/cars/edit/${car._id}`}
                  style={{
                    flex: 1,
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '0.65rem',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(car._id)}
                  style={{
                    flex: 1,
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '0.65rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/bookings');
      setBookings(response.data.bookings);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await api.patch(`/admin/bookings/${bookingId}`, { status });
      alert('Booking status updated successfully');
      fetchAllBookings();
    } catch (error) {
      alert('Failed to update booking status');
    }
  };

  const deleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await api.delete(`/admin/bookings/${bookingId}`);
        alert('Booking deleted successfully');
        fetchAllBookings();
      } catch (error) {
        alert('Failed to delete booking');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Manage Bookings</h2>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Car</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Customer</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Dates</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Days</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Amount</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Payment</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map(booking => (
                <tr key={booking._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <img
                        src={booking.car?.images?.[0] ? `http://localhost:5001${booking.car.images[0]}` : 'https://via.placeholder.com/80x60'}
                        alt={booking.car?.name}
                        style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                      <div>
                        <div style={{ fontWeight: '600' }}>{booking.car?.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{booking.car?.brand} {booking.car?.model}</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '1rem' }}>
                    <div>{booking.user?.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{booking.user?.email}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>{booking.car?.name}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                    <div>{formatDate(booking.startDate)}</div>
                    <div>to {formatDate(booking.endDate)}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>{booking.totalDays}</td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>₹{booking.totalAmount}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      background: booking.paymentStatus === 'paid' ? '#28a745' : booking.paymentStatus === 'processing' ? '#ffc107' : '#dc3545',
                      color: 'white'
                    }}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <select
                      value={booking.status}
                      onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        background: booking.status === 'confirmed' ? '#d4edda' : booking.status === 'cancelled' ? '#f8d7da' : '#fff3cd'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        <div>📍 {booking.pickupLocation}</div>
                        <div>📍 {booking.dropoffLocation}</div>
                      </div>
                      <button
                        onClick={() => deleteBooking(booking._id)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '500'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        alert('User deleted successfully');
        fetchAllUsers();
      } catch (error) {
        alert('Failed to delete user');
      }
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Manage Users</h2>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Phone</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Joined</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>{user.name}</td>
                  <td style={{ padding: '1rem' }}>{user.email}</td>
                  <td style={{ padding: '1rem' }}>{user.phone || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      background: user.role === 'admin' ? '#dc3545' : '#007bff',
                      color: 'white'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#666' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => deleteUser(user._id)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
      <aside style={{
        width: '250px',
        background: '#2c3e50',
        color: 'white',
        padding: '2rem 0'
      }}>
        <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
          <h3>Admin Panel</h3>
        </div>
        <nav>
          <Link
            to="/admin/cars"
            style={{
              display: 'block',
              padding: '1rem 1.5rem',
              color: 'white',
              textDecoration: 'none',
              borderLeft: '4px solid transparent'
            }}
            onMouseEnter={(e) => e.target.style.background = '#34495e'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            🚗 Manage Cars
          </Link>
          <Link
            to="/admin/bookings"
            style={{
              display: 'block',
              padding: '1rem 1.5rem',
              color: 'white',
              textDecoration: 'none',
              borderLeft: '4px solid transparent'
            }}
            onMouseEnter={(e) => e.target.style.background = '#34495e'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            📅 Manage Bookings
          </Link>
          <Link
            to="/admin/users"
            style={{
              display: 'block',
              padding: '1rem 1.5rem',
              color: 'white',
              textDecoration: 'none',
              borderLeft: '4px solid transparent'
            }}
            onMouseEnter={(e) => e.target.style.background = '#34495e'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            👥 Manage Users
          </Link>
        </nav>
      </aside>
      <main style={{ flex: 1, background: '#f5f5f5' }}>
        <Routes>
          <Route path="cars" element={<ManageCars />} />
          <Route path="cars/add" element={<CarForm />} />
          <Route path="cars/edit/:id" element={<CarForm isEdit={true} />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="users" element={<ManageUsers />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
