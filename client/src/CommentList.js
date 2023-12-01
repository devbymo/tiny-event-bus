import React from "react";

const CommentList = ({ comments }) => {
  const renderedComments = comments.map((comment) => {
    // check comment status.
    let commentContent = comment.content;
    if (comment.status === "pending") {
      commentContent = "waiting to review the comment";
    }
    if (comment.status === "rejected") {
      commentContent = "comment rejected";
    }

    console.log(comments);

    return <li key={comment.id}>{commentContent}</li>;
  });

  return <ul>{renderedComments}</ul>;
};

export default CommentList;
