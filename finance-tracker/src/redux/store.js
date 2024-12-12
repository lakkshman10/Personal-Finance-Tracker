// redux/store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './reducers'; // Import the auth reducer

// Combine reducers in case you add more features in the future
const rootReducer = combineReducers({
  auth: authReducer, // `auth` slice for authentication-related state
});

// Create and configure the Redux store
const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools only in development
});

export default store;
