const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || [];

  comments.push({ id: commentId, content });

  commentsByPostId[req.params.id] = comments;

  await axios.post("http://event-bus-clusterip-service:4005/events", {
    type: "CommentCreated",
    data: {
      id: commentId,
      content,
      postId: req.params.id,
    },
  });

  res.status(201).send(comments);
  console.log("CommentCreated -> Event-Bus");
});

// app.delete("/posts/:postId/comments/:commentId", async (req, res) => {
//   const { postId, commentId } = req.params;

//   await axios.post("http://blog.com/events", {
//     type: "CommentDeleted",
//     data: {
//       postId,
//       commentId,
//     },
//   });

//   res.status(200).send({});
// });

app.post("/events", (req, res) => {
  console.log("Received Event", req.body.type);
  const { type, data } = req.body;

  // Catch commnet moderation event.
  if (type === "CommentModerated") {
    const { id, postId, content, status } = data;

    // Emit event.
    axios.post("http://event-bus-clusterip-service:4005/events", {
      type: "CommentUpdated",
      data: {
        id,
        postId,
        content,
        status,
      },
    });
    console.log("CommentUpdated -> Event-Bus");
  }

  res.send({});
});

app.listen(4001, () => {
  console.log("Listening on 4001");
});
