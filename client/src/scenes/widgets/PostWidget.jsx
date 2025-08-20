import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
} from "@mui/icons-material";
import { Box, Divider, IconButton, Typography, useTheme, InputBase,  Button } from "@mui/material";
import FlexBetween from "../../components/FlexBetween";
import Friend from "../../components/Friend";
import UserImage from "../../components/UserImage";
import WidgetWrapper from "../../components/WidgetWrapper";
import CommentSection from "../../components/CommentSection";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector }  from 'react-redux';
import { setPost } from "../../state";
import {io} from 'socket.io-client';
import PostDescription from "../../components/PostDescription";


const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  faces,
  tags,
  userPicturePath,
  likes,
  comments,
}) => {
  //console.log(tags)
  const [isComments, setIsComments] = useState(false);
  const [comment, setComment] = useState("");
  const [liveComments, setLiveComments] = useState(comments || []);
  const socket = useRef();
  
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token );
  const loggedInUserId = useSelector((state) => state.user._id );
  const self = postUserId === loggedInUserId;
  const loggedInUser = useSelector((state) => state.user);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;

  const { palette } = useTheme();
  
  const primary = palette.primary.main;

//#region Face Detection : 
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const canvasRef = useRef();
  const [showFaces, setShowFaces] = useState(false);

  // Load image dimensions
  useEffect(() => {
    if (picturePath) {
      const img = new Image();
      img.src = process.env.REACT_APP_SERVER+`/assets/${picturePath}`;
      img.onload = () => {
        setHeight(img.height);
        setWidth(img.width);
      };
    }
  }, [picturePath]);

  // Draw faces on canvas
  useEffect(() => {
    if (showFaces && faces.length && width > 0 && height > 0) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, width, height); // Clear previous rectangles
      ctx.lineWidth = 5;
      ctx.strokeStyle = "yellow";
      faces.forEach((face) => ctx.strokeRect(...face));
    }
  }, [faces, showFaces, width, height]);

  // Socket setup and cleanup
  useEffect(() => {
    socket.current = io(process.env.REACT_APP_SOCKET_SERVER);

    socket.current.on("updateComments", ({ postId: receivedPostId, comment }) => {
      if (receivedPostId === postId) {
        setLiveComments((prevComments) => [...prevComments, comment]);
      }
    });

    return () => {
      socket.current.disconnect();
      socket.current = null;
    };
  }, [postId]);
//#endregion
  
const patchComment = async (commentText) => {
    const commentData = {
      userId: loggedInUserId,
      text: commentText,
      userPic: loggedInUser.picturePath,
    };

    try {
      const response = await fetch(process.env.REACT_APP_SERVER+`/posts/${postId}/comments`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost }));

      // Emit the new comment to the server
      socket.current.emit("newComment", { postId, comment: commentData });
      setComment("");
    } catch (error) {
      console.error(error.message);
    }
  };
  const patchLike = async () => {
    if(self){
        alert("Can't like your own posts. SORRY !!!")
    }
    else{
    const response = await fetch(process.env.REACT_APP_SERVER+`/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));}
  };

  return (
    <WidgetWrapper m="2rem 0">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath}
        admin={self}
        postId={postId}
      />
      <PostDescription description={description} tags={tags}></PostDescription> 
      {picturePath && (
  <>
  {picturePath && (
  <>
    {picturePath.endsWith(".mp4") || picturePath.endsWith(".webm") ? (
      <video
        width="100%"
        height="auto"
        controls
        autoPlay
        muted
        loop
        style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
      >
        <source src={process.env.REACT_APP_SERVER+`/assets/${picturePath}`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    ) : picturePath.endsWith(".gif") || picturePath.endsWith(".png") || picturePath.endsWith(".jpg") || picturePath.endsWith(".jpeg") ? (
      <div
  style={{ position: "relative", maxWidth: width, maxHeight: height }}
  onMouseEnter={() => setShowFaces(true)}
  onMouseLeave={() => setShowFaces(false)}
>
  <img
    width="100%"
    height="auto"
    crossOrigin="anonymous"
    alt="post"
    style={{
      borderRadius: "0.75rem",
      marginTop: "0.75rem",
      objectFit: "contain",
    }}
    src={process.env.REACT_APP_SERVER+`/assets/${picturePath}`}
  />
  <canvas
    ref={canvasRef}
    width={width} 
    height={height}
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: showFaces ? "block" : "none",
      pointerEvents: "none", 
    }}
  />
</div>
    ) : (
      <p>Unsupported media type</p>
    )}
  </>
)}

  </>
)}

      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">

          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: primary }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>
            <Typography>{likeCount}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton onClick={()=>setIsComments(!isComments)} >
                <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography aria-label={`Number of comments: ${liveComments.length}`}>
              {liveComments.length}
            </Typography>

          </FlexBetween>

        </FlexBetween>

        <IconButton>
          <ShareOutlined />
        </IconButton>
      </FlexBetween>
      {isComments && (
<>

  <FlexBetween gap="1.5rem" marginBottom='1rem'>
    <FlexBetween gap="1.5rem">
      <UserImage image={loggedInUser.picturePath} />
      <InputBase
        placeholder="Comment here .."
        onChange={(e) => setComment(e.target.value)} // Update this line
        value={comment}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && comment.trim() ) {
            patchComment(comment);
          }
        }}
        sx={{
          width: "100%",
          backgroundColor: palette.neutral.light,
          borderRadius: "2rem",
          padding: "0.4rem 1rem",
        }}
      />
    </FlexBetween>
    <Button
    disabled={!comment.trim()} // Prevent button activation on empty input
    onClick={() => comment.trim() && patchComment(comment)} // Trigger only if comment exists

    sx={{
      color: palette.background.alt,
      backgroundColor: palette.primary.main,
      borderRadius: "3rem",
    }}
  >
    SEND
  </Button>


  </FlexBetween>
      
  <Divider />


  <Box mt="0.5rem">
    <CommentSection comments={liveComments} main={palette.neutral.main} />
  
</Box>



<Divider />
</>
)}
    </WidgetWrapper>
  );
};

export default PostWidget;
