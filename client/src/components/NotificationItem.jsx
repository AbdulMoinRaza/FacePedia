// NotificationItem.jsx
import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useTimeAgo from "../hooks/useTimeAgo";
import { useNavigate } from "react-router-dom";

const buttonStyle = {
  padding: "0.4rem 1rem",
  borderRadius: "8px",
  bgcolor: "primary.main",
  color: 'palette.primary.dark',
  fontSize: "0.875rem",
  fontWeight: 500,
  letterSpacing: "0.5px",
  boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.15)",
  textTransform: "uppercase",
  "&:hover": {
    bgcolor: "primary.dark",
    transform: "scale(1.03)",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
  },
  transition: "all 0.2s ease-in-out",
  cursor: "pointer",
};

const NotificationItem = ({ notification, onFollowBack, onRemove }) => {
  const timeAgo = useTimeAgo(notification.time);
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      padding="1.5rem"
      margin="1rem 0"
      borderRadius="8px"
      bgcolor="background.paper"
      boxShadow="0px 4px 8px rgba(0, 0, 0, 0.1)"
      sx={{
        "&:hover": {
          bgcolor: "background.default",
          transform: "scale(1.02)",
          boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <Box display="flex" flexDirection="column" gap="0.25rem">
        <Typography
          variant="h6"
          color="text.primary"
          fontWeight={500}
          sx={{ "&:hover": { color: "text.secondary", cursor: "pointer" } }}
        >
          {notification.des}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {timeAgo}
        </Typography>
      </Box>

      {notification.type === "follow" && (
        <Box display="flex" gap="1rem" marginLeft="auto">
          <IconButton
            onClick={() => navigate(`/profile/${notification.postId}`)}
            sx={buttonStyle}
          >
            VISIT
          </IconButton>
          <IconButton
            onClick={() => onFollowBack(notification.postId)}
            sx={buttonStyle}
          >
            FOLLOW
          </IconButton>
        </Box>
      )}

      {notification.type === "tag" && (
        <Box display="flex" gap="1rem" marginLeft="auto">
          <IconButton
            onClick={() => navigate(`/posts/${notification.postId}`)}
            sx={buttonStyle}
          >
            VIEW
          </IconButton>
        </Box>
      )}

      <IconButton
        aria-label="close"
        sx={{
          color: "text.secondary",
          "&:hover": {
            color: "error.main",
            transform: "scale(1.2)",
          },
          transition: "color 0.2s ease, transform 0.2s ease",
        }}
        onClick={() => onRemove(notification)}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  );
};

export default NotificationItem;
