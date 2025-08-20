import CommentItem from "./CommentItem"; // ✅ Import new child component

const CommentSection = ({ comments, main }) => {
  return (
    <>
      {[...comments].reverse().map((comment, i) => (
        <CommentItem key={`${comment.name}-${i}`} comment={comment} main={main} />
      ))}
    </>
  );
};

export default CommentSection;
