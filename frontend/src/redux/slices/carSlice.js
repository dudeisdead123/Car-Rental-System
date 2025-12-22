import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cars: [],
  currentCar: null,
  loading: false,
  error: null,
};

const carSlice = createSlice({
  name: 'cars',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCars: (state, action) => {
      state.cars = action.payload;
      state.loading = false;
    },
    setCurrentCar: (state, action) => {
      state.currentCar = action.payload;
      state.loading = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setLoading, setCars, setCurrentCar, setError } = carSlice.actions;
export default carSlice.reducer;
