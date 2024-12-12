
export const SET_USER = 'SET_USER';
export const SET_TOKEN = 'SET_TOKEN';
export const LOGOUT_USER = 'LOGOUT_USER';

// Action Creators
export const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

export const setToken = (token) => ({
  type: SET_TOKEN,
  payload: token,
});

export const logoutUser = () => ({
  type: LOGOUT_USER,
});