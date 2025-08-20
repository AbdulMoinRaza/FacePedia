import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { useMemo, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { io } from "socket.io-client"; // Import socket.io-client
import { setOnlineUsers } from "./state"; // Import setOnlineUsers action
import { themeSettings } from "./theme";

import HomePage from "./scenes/homePage";
import LoginPage from "./scenes/loginPage";
import ProfilePage from "./scenes/profilePage";
import Messenger from "./scenes/messenger";
import EditProfilePage from "./scenes/editProfilePage";
import Notifications from "./scenes/notifications";
import Help from "./scenes/help";
import Posts from "./scenes/postsPage";

function App() {
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const isAuth = Boolean(useSelector((state) => state.token));
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const socket = useRef(null);

  useEffect(() => {
    if (isAuth && user) {
      socket.current = io(process.env.REACT_APP_SOCKET_SERVER); // Connect to socket server

      socket.current.emit("addUser", user._id); // Notify server user is online

      socket.current.on("getUsers", (users) => {
        dispatch(setOnlineUsers(users)); // Update online users in Redux
      });

      return () => {
        socket.current.disconnect(); // Disconnect on logout or unmount
      };
    }
  }, [isAuth, user, dispatch]);

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/home" element={isAuth ? <HomePage /> : <Navigate to="/" />} />
            <Route path="/profile/:userId" element={(isAuth ) ? <ProfilePage /> : <Navigate to="/" />} />
            <Route path="/editProfile/:userId" element={isAuth ? <EditProfilePage /> : <Navigate to="/" />} />
            <Route path="/messenger" element={isAuth ? <Messenger /> : <Navigate to="/" />} />
            <Route path="/notifications" element={isAuth ? <Notifications /> : <Navigate to="/" />} />
            <Route path="/help" element={isAuth ? <Help /> : <Navigate to="/" />} />
            <Route path="/posts/:postId" element={isAuth ? <Posts /> : <Navigate to="/" />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
