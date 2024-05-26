// store.js or reducers/index.js
import { combineReducers, createStore } from 'redux';
import authReducer from './authReducer';
import userReducer from './userSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer, 

});

const store = createStore(rootReducer);

export default store;