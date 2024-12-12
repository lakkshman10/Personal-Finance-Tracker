import { SET_USER, SET_TOKEN, LOGOUT_USER } from './actions';

const initialState = {
  user: null,
  token: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        user: action.payload,
      };
    case SET_TOKEN:
      return {
        ...state,
        token: action.payload,
      };
    case LOGOUT_USER:
      return {
        ...state,
        user: null,
        token: null,
      };
    default:
      return state;
  }
};

export default authReducer;
