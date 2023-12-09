const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { randomBytes } = require("crypto");

const app = express();
app.use(bodyParser.json());

// store all events
const events = [];

app.post("/events", (req, res) => {
  console.log("Received Event", req.body.type);
  const eventId = randomBytes(4).toString("hex");
  const event = {
    ...req.body,
    eventId,
  };

  // store the event
  events.push(event);

  // distribute the event to all services
  axios
    .post("http://posts-clusterip-service:4000/events", event)
    .catch((err) => {
      console.log(err.message);
    });
  axios
    .post("http://comments-clusterip-service:4001/events", event)
    .catch((err) => {
      console.log(err.message);
    });
  axios
    .post("http://query-clusterip-service:4002/events", event)
    .catch((err) => {
      console.log(err.message);
    });
  axios
    .post("http://comment-moderator-clusterip-service:4003/events", event)
    .catch((err) => {
      console.log(err.message);
    });
  res.send({ status: "OK" });
});

// get all events
app.get("/events", (req, res) => {
  res.send(events);
  console.log("Events retrieved");
});

app.listen(4005, () => {
  console.log("Listening on 4005");
});
