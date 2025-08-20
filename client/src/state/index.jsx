import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "dark",
  user: null,
  token: null,
  posts: [],
  onlineUsers: [], // Add onlineUsers state
  count : 30,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
      state.onlineUsers = []; // Reset onlineUsers on logout
    },
    setFriends: (state, action) => {
      if (state.user) {
        state.user.friends = action.payload.friends;
      } else {
        console.error("user friends non-existent :(");
      }
    },
    setPosts: (state, action) => {
      state.posts = action.payload.posts;
    },
    setPost: (state, action) => {
      const updatedPosts = state.posts.map((post) => {
        if (post._id === action.payload.post._id) return action.payload.post;
        return post;
      });
      state.posts = updatedPosts;
    },
    addPost: (state, action) => {
      state.posts = [action.payload.post, ...state.posts];
    },
    removePost: (state, action) => {
      state.posts = state.posts.filter((post) => post._id !== action.payload.postId);
    },
    
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload; // Set entire array at once
    },
    setCount: (state,action) => {
      state.count = action.payload;
    },
    appendPosts: (state, action) => {
  state.posts = [...state.posts, ...action.payload.posts];
},

  },
});

export const { setMode, setLogin, setLogout, setFriends, setPosts, setPost, setOnlineUsers, removePost, addPost, setCount, appendPosts } = authSlice.actions;
export default authSlice.reducer;
