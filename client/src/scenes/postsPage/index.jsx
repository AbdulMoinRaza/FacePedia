import React, { useState, useEffect } from 'react';
import Navbar from '../navbar';
import { Box, useMediaQuery } from "@mui/material";
import { useParams } from "react-router-dom";
import PostWidget from '../widgets/PostWidget';
import { useSelector } from 'react-redux';

function Posts() {
  const isNonMobileScreens = useMediaQuery('(min-width:1000px)');
  const { postId } = useParams(); // Extract postId from URL
  const [post, setPost] = useState(null); // State for storing the post data
  const [isPostAvailable, setIsPostAvailable] = useState(true); // Track if the post exists
  const token = useSelector((state) => state.token);

  // Fetch the post when the component mounts or postId changes
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_SERVER+`/posts/${postId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 404) {
          setIsPostAvailable(false); // Post not found
          return;
        }

        const data = await response.json();
        setPost(data); // Update state with the fetched post
        setIsPostAvailable(true); // Post is available
      } catch (error) {
        console.error("Failed to fetch post:", error);
        setIsPostAvailable(false); // Assume post is unavailable on error
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId, token]);

  // If the post hasn't been fetched yet, display a loading message
  if (post === null && isPostAvailable) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {isPostAvailable ? (
        <>
          <Navbar />
          <Box
            width="100%"
            padding="2rem 6%"
            display="flex"
            justifyContent="center"
          >
            <Box
              width={isNonMobileScreens ? '50%' : '100%'} // Set responsive width
              mt={isNonMobileScreens ? undefined : '2rem'} // Adjust margin for mobile screens
              maxWidth="600px" // Restrict the max width of a single post for better readability
            >
              {post && (
                <PostWidget
                  key={post._id}
                  postId={post._id}
                  postUserId={post.userId}
                  name={`${post.firstName} ${post.lastName}`}
                  description={post.description}
                  location={post.location}
                  picturePath={post.picturePath}
                  faces={post.faces}
                  tags={post.tags}
                  userPicturePath={post.userPicturePath}
                  likes={post.likes}
                  comments={post.comments}
                />
              )}
            </Box>
          </Box>
        </>
      ) : (
        <>
        <Navbar />
        <h1>Post No Longer Available</h1>
        </>
      )}
    </>
  );
}

export default Posts;
