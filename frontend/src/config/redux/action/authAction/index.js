import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/config";

// --- LOGIN ---
export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/login", {
        email: user.email,
        password: user.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        return thunkAPI.fulfillWithValue(response.data);
      } else {
        return thunkAPI.rejectWithValue("No token found in response");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Error in user login";
      return thunkAPI.rejectWithValue(errorMsg);
    }
  }
);

// --- REGISTER ---
export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/register", user);
      return thunkAPI.fulfillWithValue(response.data.message);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Registration failed";
      return thunkAPI.rejectWithValue(errorMsg);
    }
  }
);

// --- GET USER + PROFILE ---
export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/get_user_and_profile", {
        params: { token: user.token },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      console.log("Error fetching user and profile:", error);
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

// --- GET ALL USERS ---
export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/get_all_users");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

// --- SEND CONNECTION REQUEST ---
export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async ({ token, user_id }, thunkAPI) => {
    try {
      const response = await clientServer.post("/user/send_connection_request", {
        token,
        connectionId: user_id,
      });

      // REFRESH ALL CONNECTIONS immediately
      await thunkAPI.dispatch(getMyConnections({ token }));

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

// -i am sending request
export const getConnectionRequest = createAsyncThunk(
  "user/getConnectionRequest",
  async ({ token }, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/getConnectionRequest", {
        params: { token },
      });
      // backend should return array of requests with status field
      return thunkAPI.fulfillWithValue(response.data.connections);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);


// who sends me i am the reciever(myConnectionPage)
export const getMyConnectionRequest = createAsyncThunk(
  "user/getMyConnectionRequest",
  async(user, thunkAPI) =>{
    try{
      const response = await clientServer.get("/user/user_connection_requests" , {
        params:{
          token: user.token
        }
      });
      return thunkAPI.fulfillWithValue(response.data);
    }catch(err){
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
)

// --- ACCEPT CONNECTION ---
export const acceptConnection = createAsyncThunk(
  "user/acceptConnection",
  async ({ token, connectionId, action }, thunkAPI) => {
    try {
      const response = await clientServer.post(
        "/user/accept_connection_request",
        {
          token,
          connection_id: connectionId,
          action_type: action, // 'accept' or 'reject'
        }
      );

      thunkAPI.dispatch(getConnectionRequest({ token }))
      thunkAPI.dispatch(getMyConnectionRequest({token}))

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Accept connection failed"
      );
    }
  }
);
