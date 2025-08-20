import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTheme, useMediaQuery, Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import Navbar from "../navbar";
import WidgetWrapper from "../../components/WidgetWrapper";
import { setFriends } from "../../state";
import NotificationItem from "../../components/NotificationItem";

function Notifications() {
  const token = useSelector((state) => state.token);
  const { _id } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const [notificationList, setNotificationList] = useState([]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER}/users/${_id}/notifications`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      const formatted = data.map((n) => ({
        id: n._id,
        des: n.message,
        type: n.type,
        postId: n.postId,
        time: n.timestamp,
      }));
      setNotificationList(formatted.reverse());
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const followBack = async (friendId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER}/users/${_id}/${friendId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      dispatch(setFriends({ friends: data }));
    } catch (err) {
      console.error("Error following back:", err);
    }
  };

  const removeNotification = async (notification) => {
    setNotificationList((prev) => prev.filter((n) => n.id !== notification.id));
    try {
      await fetch(
        `${process.env.REACT_APP_SERVER}/users/${_id}/notifications/${notification.id}/seen`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error("Error marking notification seen:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <>
      <Navbar />
      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="2rem"
        justifyContent="center"
      >
        {notificationList.length > 0 ? (
          <WidgetWrapper flexBasis={isNonMobileScreens ? "85%" : "100%"}>
            {notificationList.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onFollowBack={followBack}
                onRemove={removeNotification}
              />
            ))}
          </WidgetWrapper>
        ) : (
          <Typography variant="h4">NO NEW NOTIFICATIONS</Typography>
        )}
      </Box>
    </>
  );
}

export default Notifications;
