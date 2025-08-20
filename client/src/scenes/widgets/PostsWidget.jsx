import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts, appendPosts } from "../../state";
import PostWidget from "./PostWidget";

const LIMIT = 5;

const PostsWidget = ({ userId, isProfile }) => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts);
  const token = useSelector((state) => state.token);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observer = useRef();

  const lastPostRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchPosts = async (currentPage) => {
    setLoading(true);
    const url = isProfile
      ? `${process.env.REACT_APP_SERVER}/posts/${userId}/posts?page=${currentPage}&limit=${LIMIT}`
      : `${process.env.REACT_APP_SERVER}/posts?page=${currentPage}&limit=${LIMIT}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    const newPosts = data.posts || data;

    if (currentPage === 1) {
      dispatch(setPosts({ posts: newPosts }));
    } else {
      dispatch(appendPosts({ posts: newPosts }));
    }

    if (newPosts.length < LIMIT) {
      setHasMore(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPosts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProfile, userId]);

  useEffect(() => {
    if (page === 1) return;
    fetchPosts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <>
      {posts && posts.length > 0 ? (
        posts.map((post, index) => {
          const {
            _id,
            userId,
            firstName,
            lastName,
            description,
            location,
            picturePath,
            faces,
            tags,
            userPicturePath,
            likes,
            comments,
          } = post;

          if (index === posts.length - 1) {
            return (
              <div key={_id} ref={lastPostRef}>
                <PostWidget
                  postId={_id}
                  postUserId={userId}
                  name={`${firstName} ${lastName}`}
                  description={description}
                  location={location}
                  picturePath={picturePath}
                  faces={faces}
                  tags={tags}
                  userPicturePath={userPicturePath}
                  likes={likes}
                  comments={comments}
                />
              </div>
            );
          }

          return (
            <PostWidget
              key={_id}
              postId={_id}
              postUserId={userId}
              name={`${firstName} ${lastName}`}
              description={description}
              location={location}
              picturePath={picturePath}
              faces={faces}
              tags={tags}
              userPicturePath={userPicturePath}
              likes={likes}
              comments={comments}
            />
          );
        })
      ) : (
        <h1>No posts available.</h1>
      )}

      {loading && <p>Loading more posts...</p>}
    </>
  );
};

export default PostsWidget;
//VIRTUOSO IMPLEMENTED VERSION
// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { setPosts, appendPosts } from "../../state";
// import PostWidget from "./PostWidget";
// import { Virtuoso } from "react-virtuoso";

// const LIMIT = 5;

// const PostsWidget = ({ userId, isProfile }) => {
//   const dispatch = useDispatch();
//   const posts = useSelector((state) => state.posts);
//   const token = useSelector((state) => state.token);

//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [loading, setLoading] = useState(false);

//   const fetchPosts = async (currentPage) => {
//     setLoading(true);

//     const url = isProfile
//       ? `${process.env.REACT_APP_SERVER}/posts/${userId}/posts?page=${currentPage}&limit=${LIMIT}`
//       : `${process.env.REACT_APP_SERVER}/posts?page=${currentPage}&limit=${LIMIT}`;

//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const data = await response.json();
//     const newPosts = data.posts || data;

//     if (currentPage === 1) {
//       dispatch(setPosts({ posts: newPosts }));
//     } else {
//       dispatch(appendPosts({ posts: newPosts }));
//     }

//     if (newPosts.length < LIMIT) {
//       setHasMore(false);
//     }

//     setLoading(false);
//   };

//   useEffect(() => {
//     setPage(1);
//     setHasMore(true);
//     fetchPosts(1);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isProfile, userId]);

//   const loadMore = () => {
//     if (!loading && hasMore) {
//       setPage((prevPage) => prevPage + 1);
//       fetchPosts(page + 1);
//     }
//   };

//   return (
//     <>
//       {posts && posts.length > 0 ? (
//         <Virtuoso
//           style={{ height: "100%", width: "100%" }}
//           data={posts}
//           itemContent={(index, post) => (
//             <PostWidget
//               key={post._id}
//               postId={post._id}
//               postUserId={post.userId}
//               name={`${post.firstName} ${post.lastName}`}
//               description={post.description}
//               location={post.location}
//               picturePath={post.picturePath}
//               faces={post.faces}
//               tags={post.tags}
//               userPicturePath={post.userPicturePath}
//               likes={post.likes}
//               comments={post.comments}
//             />
//           )}
//           endReached={loadMore}
//           components={{
//             Footer: () =>
//               loading ? <div style={{ padding: "1rem" }}>Loading more...</div> : null,
//           }}
//         />
//       ) : (
//         <h1>No posts available.</h1>
//       )}
//     </>
//   );
// };

// export default PostsWidget;
