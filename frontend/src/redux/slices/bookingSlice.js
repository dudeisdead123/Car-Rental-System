import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setBookings: (state, action) => {
      state.bookings = action.payload;
      state.loading = false;
    },
    addBooking: (state, action) => {
      state.bookings.unshift(action.payload);
      state.currentBooking = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setLoading, setBookings, addBooking, setError } = bookingSlice.actions;
export default bookingSlice.reducer;
