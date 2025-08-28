// GlobalSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

const initialState = {
  data: {},
  token: null,
  user: null,
  profile: null,
  loading: false,
  error: null,
};

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setData: (state, action) => {
      const { key, value } = action.payload;
      state.data[key] = value;
    },
    removeData: (state, action) => {
      delete state.data[action.payload];
    },
    setMultipleData: (state, action) => {
      state.data = { ...state.data, ...action.payload };
    },
    setToken: (state, action) => {
      state.token = action.payload;
      if (action.payload) {
        try {
          const decoded = jwtDecode(action.payload);
          state.user = decoded;
          localStorage.setItem('token', action.payload);
        } catch (error) {
          state.user = null;
          state.error = 'Invalid token';
          localStorage.removeItem('token');
        }
      } else {
        state.user = null;
        localStorage.removeItem('token');
      }
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearData: (state) => {
      state.data = {};
      state.token = null;
      state.user = null;
      state.profile = null;
      state.error = null;
      localStorage.removeItem('token');
    },
  },
});

export const {
  setData,
  removeData,
  setMultipleData,
  setToken,
  setProfile,
  setLoading,
  setError,
  clearData,
} = globalSlice.actions;

// ✅ Selectors
export const selectToken = (state) => state.global.token;
export const selectUser = (state) => state.global.user;
export const selectProfile = (state) => state.global.profile;
export const selectLoading = (state) => state.global.loading;
export const selectError = (state) => state.global.error;

export default globalSlice.reducer;
