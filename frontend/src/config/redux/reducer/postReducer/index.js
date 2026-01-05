import { createSlice } from "@reduxjs/toolkit";
import { getAllComments, getAllPosts,togglePostLike } from "@/config/redux/action/postAction/index.js";



const initialState = {
  posts: [],
  isLoading: false,
  postFetched: false,
  loggedIn: false,  
  isError: false,
  isSuccess: false,
  message: "",
  Comments: [],
  postId: "",
};  

const postSlice = createSlice({
  name: "post",
  initialState, 
    reducers: {
    reset: () => initialState,
    resetPostId: (state) => {
      state.postId = "";
      state.Comments = [];
    },
  },    
    extraReducers: (builder) => {
    builder
        // Get All Posts
        .addCase(getAllPosts.pending, (state) => {  
        state.isLoading = true;
        state.message = "Fetching posts...";
    })
    .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;    
        state.isError = false;
        state.isSuccess = true;
        state.postFetched = true;    
        state.posts = action.payload.posts.reverse();    
        state.message = action.payload.message || "Posts fetched successfully";    
    }
    )
    .addCase(getAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;    
        state.message = action.payload || "Failed to fetch posts";    
    })
    .addCase(getAllComments.fulfilled, (state, action) => {
        state.postId = action.payload.post_id;   
        state.Comments = action.payload.comments
  })



}
});


export const { reset, resetPostId } = postSlice.actions;    
export default postSlice.reducer;


        
