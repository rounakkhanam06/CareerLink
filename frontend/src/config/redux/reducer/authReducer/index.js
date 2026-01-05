import { createSlice } from "@reduxjs/toolkit";
import {
  loginUser,
  registerUser,
  getAboutUser,
  getAllUsers,
  sendConnectionRequest,
  getConnectionRequest,
  getMyConnectionRequest,
  acceptConnection,
} from "../../action/authAction";

const initialState = {
  user: undefined,
  profile: undefined,
  isError: false,
  isLoading: false,
  isSuccess: false,
  loggedIn: false,
  isTokenThere: false,
  message: "",
  profileFetched: false,
  connectionRequests: [], 
  connections: [],        
  all_users: [],
  all_profiles_fetched: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,
    emptymessage: (state) => { state.message = ""; },
    setTokenIsThere: (state) => { state.isTokenThere = true; },
    setTokenIsNotThere: (state) => { state.isTokenThere = false; },
  },
  extraReducers: (builder) => {
    builder

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Logging in...";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loggedIn = true;
        state.message = action.payload.message || "Login successful";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.loggedIn = false;
        state.message = action.payload || "Login failed";
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Registering...";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.message = action.payload || "Registration successful";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload || "Registration failed";
      })

      // GET USER + PROFILE
      .addCase(getAboutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.profileFetched = true;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
      })

      // GET ALL USERS
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.all_profiles_fetched = true;
        state.all_users = action.payload.profiles;
      })
      .addCase(getConnectionRequest.fulfilled, (state, action) => {
        state.connections = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getConnectionRequest.rejected, (state, action) => {
        state.message = action.payload
      })
     .addCase(getMyConnectionRequest.fulfilled, (state, action) => {
       state.connectionRequests = Array.isArray(action.payload) ? action.payload : [];
     })
      .addCase(getMyConnectionRequest.rejected, (state, action) => {
        state.message = action.payload
      })
  },
})

export const { reset, emptymessage, setTokenIsThere, setTokenIsNotThere } = authSlice.actions;
export default authSlice.reducer;
