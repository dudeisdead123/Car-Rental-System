import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCars, setLoading } from '../redux/slices/carSlice';
import api from '../utils/api';

const Home = () => {
  const [cars, setCarsState] = useState([]);
  const [loading, setLoadingState] = useState(false);
  const [filters, setFilters] = useState({ search: '', type: '', brand: '' });
  const dispatch = useDispatch();

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoadingState(true);
      const response = await api.get('/cars', { params: filters });
      setCarsState(response.data.cars);
      dispatch(setCars(response.data.cars));
      setLoadingState(false);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setLoadingState(false);
    }
  };

  const handleSearch = () => {
    fetchCars();
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#000' }}>Available Cars</h1>
      
      {/* Search Filters */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Search cars..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">All Types</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Coupe">Coupe</option>
          </select>
          <button onClick={handleSearch} style={{
            background: '#000',
            color: 'white',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            Search
          </button>
        </div>
      </div>

      {/* Cars Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {cars.map((car) => (
          <Link key={car._id} to={`/cars/${car._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              background: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <img
                src={car.images?.[0] ? `http://localhost:5001${car.images[0]}` : 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={car.name}
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
              <div style={{ padding: '1rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#000' }}>{car.name}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                  {car.brand} | {car.type} | {car.seats} Seats
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000' }}>
                    ₹{car.rentPerDay}/day
                  </span>
                  <span style={{
                    background: car.availability ? '#28a745' : '#dc3545',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem'
                  }}>
                    {car.availability ? 'Available' : 'Booked'}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {cars.length === 0 && !loading && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>No cars found</p>
      )}
    </div>
  );
};

export default Home;
