const CommentSection = ({ comments }) => {
  return (
    <div>
      <h4>Comments</h4>
      {comments.map((c, index) => (
        <p key={index}>{c.text}</p>
      ))}
    </div>
  );
};

export default CommentSection;