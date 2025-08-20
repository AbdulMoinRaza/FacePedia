import { PersonAddOutlined, PersonRemoveOutlined, Message, Delete, Edit } from '@mui/icons-material';
import { Box, IconButton, Typography, useTheme, InputBase, Button , Divider} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import FlexBetween from './FlexBetween';
import UserImage from './UserImage';
import { setFriends, removePost } from '../state';
import { io } from "socket.io-client";
import { useState, useRef, useEffect } from 'react';


const Friend = ({ friendId, name, subtitle, userPicturePath, admin, postId, visitor }) => {
    const dispatch = useDispatch();
    const onlineUsers = useSelector((state) => state.onlineUsers);
    const navigate = useNavigate();
    const token = useSelector((state) => state.token);
    const friends = useSelector((state) => state.user.friends);
    const isFriend = friends.find((friend) => friend._id === friendId);
    const {_id} = useSelector((state)=>state.user);
    const socket = useRef();
    
    const [messages, setMessages] = useState([]);
    const [isMessage, setIsMessage] = useState(false);
    const [messageText, setMessageText] = useState('')
    const [conversationId, setConversationId] = useState("");
    const [friendProfile, setFriendProfile] = useState({});
    
    const loggedInUser = useSelector((state) => state.user);
    const { palette } = useTheme();
    const primaryLight = palette.primary.light;
    const primaryDark = palette.primary.dark;
    const primaryMain = palette.neutral.main;
    const primaryMedium = palette.neutral.medium;

    const [postDeletion, setPostDeletion] = useState(false);
    


    const self = _id === friendId;

   // console.log("visitor : ",visitor)

    useEffect(()=>{
        socket.current = io(process.env.REACT_APP_SOCKET_SERVER);
    },[socket])

    const patchFriend = async () => {
        if (self) {
            alert("Can't add yourself as a friend. SORRY!!!");
        } else {
            try {
                const response = await fetch(
                    process.env.REACT_APP_SERVER+`/users/${_id}/${friendId}`,
                    {
                        method: "PATCH",
                        credentials: 'include',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                dispatch(setFriends({ friends: data }));
                const newNotification = {
                    type : 'follow',
                    message : `${loggedInUser.firstName} ${loggedInUser.lastName}started following you`,
                    postId : `${_id}`,
                }
                const res = await fetch(
                    process.env.REACT_APP_SERVER+`/users/${friendId}/notifications`,
                    {
                        method: "POST",
                        credentials: 'include',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body : JSON.stringify(newNotification),
                    }
                )
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
            } catch (error) {
                console.error('Error updating friend:', error);
            }
        }
    };

    const getConversationId = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_SERVER+`/api/conversations/find/${friendId}/${_id}`, {
                method: "GET",
                credentials: 'include',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (data && data._id) {
                setConversationId(data._id);
                return data._id; // Return the existing conversation ID
            } else {
                return await createConversationId(); // Create a new conversation and return its ID
            }
        } catch (err) {
            console.log(err);
        }
        return null; // Return null if there was an error
    };
    
    const createConversationId = async () => {
        try {
            const bodyOfRequest = {
                senderId: friendId,
                receiverId: _id,
            };
    
            const response = await fetch(process.env.REACT_APP_SERVER+`/api/conversations/`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyOfRequest),
            });
    
            if (!response.ok) {
                throw new Error(`Failed to create conversation. Status: ${response.status}`);
            }
    
            const data = await response.json();

            setConversationId(data._id);
            console.log('Create convo id:', conversationId);
            return data._id; // Return the newly created conversation ID
        } catch (err) {
            console.error("Error creating conversation:", err);
        }
        return null; // Return null if there was an error
    };
    
    const handleSubmit = async () => {
        const convoId = await getConversationId(); // Get the conversation ID
        if (!convoId) {
            console.log('Failed to get or create conversation ID');
            return;
        }
    
        const message = {
            sender: loggedInUser._id,
            text: messageText,
            conversationId: convoId,
        };
        console.log('The message:', message);
        
        try {
            const response = await fetch(process.env.REACT_APP_SERVER+`/api/messages`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            setMessages([...messages, data]);
            navigate("/messenger")
            setMessageText("");
        } catch (err) {
            console.log('Error sending message:', err);
        }
        
        socket.current.emit("sendMessage", {
            senderId: _id,
            receiverId : [friendId] ,
            text: messageText,
          });
          setIsMessage(!isMessage)
    };
    
    useEffect(() => {
        socket.current.on("postDeleted", ({ postId }) => {
          console.log("Post deleted:", postId);
      
          // Remove the post from Redux store or local state
          dispatch(removePost({ postId }));
        });
      
        return () => {
          socket.current.off("postDeleted");
        };
      }, []);

    const deletePost = async () => {
        try {
          const response = await fetch(process.env.REACT_APP_SERVER+`/posts/${postId}`, {
            method: "DELETE",
            credentials: 'include',
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
      
          if (!response.ok) {
            console.error("Failed to delete post");
            return;
          }
      
          const result = await response.json();
          console.log("Post deleted:", result.message);
      
          // Dispatch an action to update the Redux store
          dispatch(removePost({ postId }));
      
          // Emit the deletion event to the server
          socket.current.emit("deletePost", { postId });
        } catch (error) {
          console.error("Error deleting post:", error);
        }
      };

    const patchPost  = async () => {
        console.log("Edit Post Success !!!")
    }
      
    useEffect(()=>{
        const getFriendProfile = async () => {
            const response = await fetch(process.env.REACT_APP_SERVER+`/users/${friendId}`, {
              method: "GET",
              credentials: 'include',
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setFriendProfile(data);
          };
          friendId && getFriendProfile();
    },[])
    
    const togglePostDeletion = ()=>{
        setPostDeletion(!postDeletion);
        
    }

return (
    <Box>
        <FlexBetween>
            <FlexBetween gap="1rem">
                <UserImage 
                    image={friendProfile?.picturePath} 
                    size="55px"
                    id={friendId}
                    isOnline={!self && onlineUsers.some(user => user.userId === friendId)}

                    />
                <Box
                    onClick={() => {
                        navigate(`/profile/${friendId}`);
                        navigate(0);
                    }}
                >
                    <Typography
                        color={primaryMain}
                        variant="h5"
                        fontWeight="500"
                        sx={{
                            '&:hover': {
                                color: palette.primary.light,
                                cursor: 'pointer',
                            },
                        }}
                    >
                        {name}
                    </Typography>
                    <Typography color={primaryMedium} fontSize="0.75rem">
                        {subtitle}
                    </Typography>
                </Box>
            </FlexBetween>

            {admin ? 
            <FlexBetween gap="0.5rem">
            <IconButton onClick={patchPost}>
                    <Edit />
                </IconButton>
                <IconButton onClick={togglePostDeletion}>
                    <Delete />
                </IconButton>
            </FlexBetween>
            : <FlexBetween gap="0.5rem">
            {!visitor && (
  <>
    {/* Friend Management Button */}
    <IconButton
      onClick={patchFriend}
      sx={{ backgroundColor: primaryLight, p: '0.6rem' }}
    >
      {isFriend ? (
        <PersonRemoveOutlined sx={{ color: primaryDark }} />
      ) : (
        <PersonAddOutlined sx={{ color: primaryDark }} />
      )}
    </IconButton>

    {/* Messaging Toggle Button */}
    <IconButton
      onClick={() => setIsMessage(!isMessage)}
      sx={{ backgroundColor: primaryLight, p: '0.6rem' }}
    >
      <Message sx={{ color: primaryDark }} />
    </IconButton>
  </>
)}

            </FlexBetween>}

        </FlexBetween>

        {isMessage && (
            <Box mt="1rem"> {/* Added a margin-top to separate the text bar */}
                <FlexBetween gap="1.5rem" marginBottom="1rem">
                    <FlexBetween gap="1.5rem">
                        <UserImage image={loggedInUser.picturePath} size='35px'/>
                        <InputBase
                            placeholder="Your Text here .."
                            onChange={(e) => setMessageText(e.target.value)}
                            value={messageText}
                            sx={{
                                width: "100%",
                                backgroundColor: palette.neutral.light,
                                borderRadius: "2rem",
                                padding: "0.4rem 1rem",
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && messageText.trim()) {
                                    handleSubmit();
                                }}}
                        />
                    </FlexBetween>
                    <Button
                        disabled={!messageText}
                        onClick={messageText.trim() && handleSubmit}

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
            </Box>
        )}
    {postDeletion && (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 2000,
      width: '100vw',
      height: '100vh',
      backdropFilter: 'blur(6px)',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Box
      sx={{
        width: '400px',
        padding: '2rem',
        backgroundColor: palette.background.default,
        borderRadius: '1rem',
        textAlign: 'center',
        boxShadow: '0px 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Are you sure you want to delete this post?
      </Typography>
      <Box display="flex" justifyContent="space-around">
        <Button
          onClick={() => {
            deletePost(); // your actual API call
            setPostDeletion(false); // close the dialog
          }}
          sx={{
            backgroundColor: palette.error.main,
            color: palette.background.alt,
            '&:hover': {
              backgroundColor: palette.error.dark,
            },
          }}
        >
          Delete
        </Button>
        <Button
          onClick={togglePostDeletion}
          sx={{
            backgroundColor: palette.neutral.medium,
            color: palette.background.alt,
            '&:hover': {
              backgroundColor: palette.neutral.dark,
            },
          }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  </Box>
)}

    </Box>
);


};

export default Friend;
