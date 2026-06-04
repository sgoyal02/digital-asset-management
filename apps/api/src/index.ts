import express from "express";
const app = express();

app.get("/", (req, res) => {
  res.send("api running");
});

app.listen(5000, () => {
  console.log("server run on port 5000");
});