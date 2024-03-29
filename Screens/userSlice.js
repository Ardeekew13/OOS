// userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { setCurrentUser, setLoading, setError } = userSlice.actions;

export const selectCurrentUser = (state) => state.user.currentUser;

export const fetchUserData = () => async (dispatch) => {
  try {
    dispatch(setLoading());
    // Fetch user data from your API or authentication service
    const response = await fetch('your_api_endpoint');
    const userData = await response.json();
    dispatch(setCurrentUser(userData));
  } catch (error) {
    console.error('Error fetching user data:', error);
    dispatch(setError('Error fetching user data.'));
  }
};

export default userSlice.reducer;
