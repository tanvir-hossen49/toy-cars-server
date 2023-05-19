const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("doctor is running");
});

app.listen(PORT, () => {
  console.log("app is running on port ", PORT);
});
