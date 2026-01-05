import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/reducer/authReducer/index';
import postReducer from '../redux/reducer/postReducer/index';

 export const store = configureStore({
    reducer: {
        auth: authReducer,
        posts: postReducer,

    },
});