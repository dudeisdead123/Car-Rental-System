import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CarForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'sedan',
    seats: 5,
    transmission: 'automatic',
    fuelType: 'petrol',
    rentPerDay: '',
    features: '',
    description: '',
    availability: true,
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      fetchCar();
    }
  }, [isEdit, id]);

  const fetchCar = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/cars/${id}`);
      const car = response.data.car;
      setFormData({
        name: car.name,
        brand: car.brand,
        model: car.model,
        year: car.year,
        type: car.type,
        seats: car.seats,
        transmission: car.transmission,
        fuelType: car.fuelType,
        rentPerDay: car.rentPerDay,
        features: Array.isArray(car.features) ? car.features.join(', ') : car.features,
        description: car.description,
        availability: car.availability,
      });
      setExistingImages(car.images || []);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch car details');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'features') {
          // Convert comma-separated string to array
          const featuresArray = formData[key].split(',').map(f => f.trim()).filter(f => f);
          submitData.append(key, JSON.stringify(featuresArray));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Add images if any
      if (images.length > 0) {
        images.forEach(image => {
          submitData.append('images', image);
        });
      }

      if (isEdit) {
        await api.put(`/cars/${id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Car updated successfully!');
      } else {
        await api.post('/cars', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Car added successfully!');
      }
      
      navigate('/admin/cars');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save car');
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>{isEdit ? 'Edit Car' : 'Add New Car'}</h2>
        <button
          onClick={() => navigate('/admin/cars')}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ← Back to Cars
        </button>
      </div>

      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {isEdit && existingImages.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h4>Current Image:</h4>
          <div>
            <img
              src={`http://localhost:5001${existingImages[0]}`}
              alt="Car"
              style={{ width: '300px', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Car Name */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Car Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Swift Dzire"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          {/* Brand */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Brand *</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              placeholder="e.g., Maruti Suzuki"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          {/* Model */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Model *</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
              placeholder="e.g., ZXI Plus"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          {/* Year */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Year *</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              min="2000"
              max={new Date().getFullYear() + 1}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          {/* Type */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="hatchback">Hatchback</option>
              <option value="luxury">Luxury</option>
              <option value="sports">Sports</option>
            </select>
          </div>

          {/* Seats */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Seats *</label>
            <input
              type="number"
              name="seats"
              value={formData.seats}
              onChange={handleChange}
              required
              min="2"
              max="8"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          {/* Transmission */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Transmission *</label>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          {/* Fuel Type */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Fuel Type *</label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Rent Per Day */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Rent Per Day (₹) *</label>
            <input
              type="number"
              name="rentPerDay"
              value={formData.rentPerDay}
              onChange={handleChange}
              required
              min="0"
              placeholder="e.g., 2000"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          {/* Availability */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              name="availability"
              checked={formData.availability}
              onChange={handleChange}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <label style={{ fontWeight: '500', cursor: 'pointer' }}>Available for Rent</label>
          </div>
        </div>

        {/* Features */}
        <div style={{ marginTop: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Features (comma-separated)</label>
          <input
            type="text"
            name="features"
            value={formData.features}
            onChange={handleChange}
            placeholder="e.g., GPS, AC, Bluetooth, USB Charger"
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <small style={{ color: '#666', fontSize: '0.85rem' }}>Separate features with commas</small>
        </div>

        {/* Description */}
        <div style={{ marginTop: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Describe the car..."
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
          />
        </div>

        {/* Images */}
        <div style={{ marginTop: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            {isEdit ? 'Add New Images (optional)' : 'Upload Images *'}
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            required={!isEdit}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <small style={{ color: '#666', fontSize: '0.85rem' }}>You can upload up to 5 images</small>
        </div>

        {/* Submit Button */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              background: '#000',
              color: 'white',
              border: 'none',
              padding: '1rem',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Car' : 'Add Car')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/cars')}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CarForm;
