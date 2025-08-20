import {
    DeleteOutlined,
    ImageOutlined,
    MoreHorizOutlined,
} from '@mui/icons-material';
import {
    Box,
    Divider,
    Typography,
    InputBase,
    useTheme,
    Button,
    IconButton,
    useMediaQuery,
} from '@mui/material';
import FlexBetween from '../../components/FlexBetween';
import Dropzone from 'react-dropzone';
import UserImage from '../../components/UserImage';
import WidgetWrapper from '../../components/WidgetWrapper';
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '../../state';
import {io} from 'socket.io-client';
// import TagInput from '../../components/TagInput';

const MyPostWidget = ({picturePath})=>{
   //#region State declarations

    const dispatch = useDispatch();
    const [isImage, setIsImage] = useState(false);
    const [image, setImage] = useState(null);
    const [imageForUpld, setImageForUpld] = useState(null);
    const [post, setPost] = useState('');
    const [taggedUsers, setTaggedUsers] = useState([]); // Stores tagged user data
    const [suggestions, setSuggestions] = useState([]); // User suggestion list
    const [tagInput, setTagInput] = useState(''); // Input after '@'

    const {palette} = useTheme();
    const {_id} = useSelector((state)=>state.user);
    const loggedInUser = useSelector((state)=> state.user)
    const token = useSelector((state)=>state.token);
    const isNonMobileScreens = useMediaQuery('(min-width:1000px)');
    const mediumMain = palette.neutral.mediumMain;
    const medium = palette.neutral.medium;
    const socket = useRef();

      //#endregion
        
      //#region Face Detection
        const [isFaceDetectionNeeded, setIsFaceDetectionNeeded] = useState(false);
        const [faces, setFaces] = useState([]);
        const [width, setWidth] = useState(0);
        const [height, setHeight] = useState(0);
        const imgRef = useRef();
    
        useEffect(() => {
            const loadModels = () => {
              Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
                faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
                faceapi.nets.faceExpressionNet.loadFromUri("/models"),
              ])
                .then(DetectFaces)
                .catch((e) => console.log(e));
            };
        
            image && loadModels();
          }, [image, isFaceDetectionNeeded]);

        useEffect(() => {
            if (isFaceDetectionNeeded && image && imgRef.current) {
              const objectUrl = URL.createObjectURL(image); // ✅ create object URL
              const imgObj = new Image();
              imgObj.src = objectUrl;
            
              imgObj.onload = () => {
                setHeight(imgObj.height);
                setWidth(imgObj.width);
                URL.revokeObjectURL(objectUrl); // ✅ cleanup
              };
          
              setImageForUpld({ url: objectUrl }); // ✅ set the preview image
            }
          }, [image]);
          
    
          const DetectFaces = async () => {
            try {
              // Detect faces once models are loaded
              if (imgRef.current) {
                const detections = await faceapi?.detectAllFaces(
                  imgRef.current,
                  new faceapi.TinyFaceDetectorOptions()
                );
                //console.log('detections',detections)
                setFaces(detections.map(d => Object.values(d.box))); // Extract coordinates
              }
            } catch (error) {
              console.error("Error loading models or detecting faces:", error);
            }
          };
        //#endregion
    

     useEffect(() => {
        socket.current = io(process.env.REACT_APP_SOCKET_SERVER);
        socket.current.on("newPost", (post) => {
          console.log("New post received:", post);
         dispatch(setPosts({ posts: post }));
        });
      
        return () => {
          socket.current.disconnect(); // Disconnect socket properly
          socket.current.off("newPost");
        };
      }, []);

//#region tagging...
      const fetchSuggestions = async (query) => {
        //console.log("Suggestions \n query",query)
        const response = await fetch(process.env.REACT_APP_SERVER+`/users/search?query=${query}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          
        });
        //console.log(response)
        const data = await response.json();
        //console.log(`suggestions data : ${data}`)
        setSuggestions(data);
        
    };
    const handleInputChange = (e) => {
      const inputValue = e.target.value;
      setPost(inputValue);
  
      // Check if user is typing a tag (starts with @)
      const atIndex = inputValue.lastIndexOf('@');
      if (atIndex !== -1) {
          const query = inputValue.slice(atIndex + 1); // Extract text after '@'
          setTagInput(query);
          if (query.length > 0) {
              fetchSuggestions(query); // Fetch matching users
          }
      } else {
          setTagInput('');
          setSuggestions([]);
      }
  };
  const handleTagSelect = (user) => {
    // Replace the @query with the user's name
    const atIndex = post.lastIndexOf('@');
    const updatedPost = post.slice(0, atIndex) + `@${user.firstName} ${user.lastName}`;
    setPost(updatedPost);

    // Add tagged user to state
    setTaggedUsers([...taggedUsers, user]);

    // Clear tag input and suggestions
    setTagInput('');
    setSuggestions([]);
};

  
    //#endregion
      
    const handlePost = async () => {
     // console.log(taggedUsers); // Debugging tagged users
      isFaceDetectionNeeded && 
      await DetectFaces();
      setIsImage(!isImage);
  
      try {
          const formData = new FormData();
  
          // Append user and post details
          formData.append("userId", _id);
          formData.append("description", post);
          // Serialize and append the tagged users array
          const formattedTags = taggedUsers
          .filter(user => post.includes(`@${user.firstName}`)) // Filter only users mentioned in the post
          .map(user => ({
              userId: user._id,
              name: `${user.firstName} ${user.lastName}`,
          }));
      
      //console.log(formattedTags);
      
        formData.append("tags", JSON.stringify(formattedTags));
  
          // Append image and faces if available
          if (image) {
              formData.append("picture", image);
              formData.append("picturePath", image.name);
              formData.append("faces", JSON.stringify(faces)); // Serialize faces
          }
  console.log(formData, "post");
  
          // Send the request to the backend
          const response = await fetch(process.env.REACT_APP_SERVER+"/posts", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData, // No 'Content-Type'; it will be set automatically
          });
  
          const newPost = await response.json();
          console.log(newPost[newPost.length-1]._id)
          // Clear the form state after success
          setImage(null);
          setPost("");
          setTaggedUsers([]);
          // Emit the new post to the server
          socket.current.emit("createPost", newPost);
          const newNotification = {
            type: 'tag',
            message: `You have been tagged in a post by ${loggedInUser.firstName} ${loggedInUser.lastName}`,
            postId: `${newPost[newPost.length-1]._id}`,
        };
        console.log(newNotification)
          try {
            const notifications = formattedTags.map(async (taggedUser) => {
              console.log(taggedUser);      
                const res = await fetch(
                    process.env.REACT_APP_SERVER+`/users/${taggedUser.userId}/notifications`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(newNotification),
                    }
                );
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json(); // Optional: Return the response data if needed
            });
            // Wait for all requests to finish
            const results = await Promise.all(notifications);
            console.log("Notifications sent successfully:", results);
        } catch (error) {
            console.error("Error sending notifications:", error);
        }
      } catch (error) {
          console.error("Error creating post:", error);
      }
  };  

    return (
        <WidgetWrapper>
            <FlexBetween gap = '1.5rem'>
                <UserImage image={picturePath} />
                <div
                
                style ={{
                    position: 'relative',
                    width : '100%',
                }}
                >
                <InputBase
                placeholder="What's on your mind ..."
                onChange={handleInputChange}
                value={post}
                sx={{
                    width: '100%',
                    backgroundColor: palette.neutral.light,
                    borderRadius: '2rem',
                    padding: '1rem 2rem',
                    
                }} 
            />

{suggestions.length > 0 && (
    <Box
        sx={{
            position: 'absolute',
            top:'30%', 
            left:'50%',
            backgroundColor: 'background.paper', // Adapts to theme
            borderRadius: '1rem',
            boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000,
            overflow: 'hidden', // Ensures rounded corners for child elements
        }}
    >
        {suggestions.map((user) => (
            <Box
                key={user._id}
                onClick={() => handleTagSelect(user)}
                sx={{
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                        backgroundColor: 'action.hover', // Dark mode-compatible hover effect
                    },
                }}
            >
                <Typography variant="body1" sx={{ color: 'text.primary' }}>
                    {user.firstName} {user.lastName}
                </Typography>
            </Box>
        ))}
    </Box>
)}
</div>


            </FlexBetween>
            {isImage && (
                <Box
                    borderRadius='5px'
                    border={'1px solid  {medium}'}
                    mt='1rem'
                    p='1rem'
                >
<Dropzone
    acceptedFiles=".jpg,.jpeg,.png,.gif,.mp4,.mkv"
    multiple={false}
    onDrop={(acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            setImage(file);
            const isImage = ['.jpeg', '.jpg', '.png'].some((ext) => file.name.toLowerCase().endsWith(ext));
            setIsFaceDetectionNeeded(isImage);
        }
    }}
>

                    {({ getRootProps, getInputProps }) => (
                      <FlexBetween>
                        <Box
                            {...getRootProps()}
                            border={`2px dashed ${palette.primary.main}`}
                            p="1rem"
                            width='100%'
                            sx={{ "&:hover": { cursor: "pointer" } }}
                        >
                            <input {...getInputProps()} />
                            {!image ? (
                            <p>Drop Files Here</p>
                            ) : (
                            <FlexBetween>
                            {image && (
                                <img
                                    width="100%"
                                    height="auto"
                                    ref={imgRef}
                                    crossOrigin="anonymous"
                                    alt="My post"
                                    style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
                                    src={imageForUpld?.url}
                                />
                                )}
  
                                {/* <Typography>{image.name}</Typography>
                                <EditOutlined /> */}
                            </FlexBetween>
                            )}
                        </Box>
                        {image && (
                            <IconButton 
                                onClick={()=>setImage(null)}
                                sx={{width:"15%"}}
                            >
                                <DeleteOutlined />
                            </IconButton>
                        )}
                      </FlexBetween>
                    )}
                  </Dropzone>  
                </Box>
            )}
            <Divider sx={{margin:'1.25rem 0'}} />
            <FlexBetween>
                <FlexBetween gap="0.25rem" onClick={() => setIsImage(!isImage)} sx={{ '&:hover': { cursor: 'pointer' } }}>
                    <ImageOutlined sx={{ color: mediumMain }} />
                    <Typography
                        color={mediumMain}
                        sx={{ '&:hover': { cursor: 'pointer', color: medium } }}
                    >
                        Add any file
                    </Typography>
                </FlexBetween>

                {isNonMobileScreens ? (
                    <>
                        
                    </>
                )
                :(
                    <FlexBetween gap='.25rem'>
                        <MoreHorizOutlined sx={{color:mediumMain}} />
                    </FlexBetween>
                )}

                <Button 
                    disabled={!post}
                    onClick={handlePost}
                    sx={{
                        color:palette.background.alt,
                        backgroundColor:palette.primary.main,
                        borderRadius:'3rem'
                    }}
                    
                >
                    POST
                </Button>
            </FlexBetween>
        </WidgetWrapper>
    )

};

export default MyPostWidget;