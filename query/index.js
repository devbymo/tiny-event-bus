const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

// Handle events
const handleEvent = (type, data) => {
  if (type === "PostCreated") {
    const { id, title } = data;

    posts[id] = { id, title, comments: [] };
  }

  if (type === "CommentCreated") {
    const { id, content, postId } = data;

    const post = posts[postId];
    post.comments.push({ id, content, status: "pending" });
  }

  if (type === "CommentUpdated") {
    const { id, postId, content, status } = data;

    // Find post
    const post = posts[postId];

    // Update comment status
    post.comments = post.comments.map((commnet) => {
      if (commnet.id === id) {
        commnet.status = status;
        commnet.content = content;
      }
      return commnet;
    });
  }
};

app.post("/events", (req, res) => {
  const { type, data } = req.body;
  handleEvent(type, data);
  res.send({});
});

app.listen(4002, () => {
  console.log("Listening on 4002");

  // Fetch all events from event-bus
  axios.get("http://localhost:4005/events").then((res) => {
    for (let event of res.data) {
      console.log("Processing event: ", event.type);

      // Process each event
      handleEvent(event.type, event.data);
    }
  });
});
