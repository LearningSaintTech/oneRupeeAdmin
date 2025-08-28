// store.js
import { configureStore } from '@reduxjs/toolkit';
import globalReducer, { setToken, setData } from './GlobalSlice';

export const store = configureStore({
  reducer: {
    global: globalReducer,
  },
});

// Load token and userDetails from localStorage on app initialization
const persistedToken = localStorage.getItem('token');
const persistedUser = localStorage.getItem('userDetails');

if (persistedToken) {
  store.dispatch(setToken(persistedToken));
}

if (persistedUser) {
  store.dispatch(setData({ key: 'userDetails', value: JSON.parse(persistedUser) }));
}

// Selectors
export const selectGlobalData = (state) => state.global.data;
export const selectGlobalLoading = (state) => state.global.loading;
export const selectGlobalError = (state) => state.global.error;
export const selectDataByKey = (key) => (state) => state.global.data[key];
export const selectToken = (state) => state.global.token;
export const selectUser = (state) => state.global.user;
