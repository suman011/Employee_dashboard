// form-webhook/server.js

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, "employees.json");

// Load the full array
function loadData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
}

// Overwrite it
function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// Optional: let your React dashboard fetch the up-to-date list
app.get("/employees", (req, res) => {
  res.json(loadData());
});

// When the form POSTS back, update that participant’s answers
app.post("/webhook", (req, res) => {
  const { participant, answers } = req.body;
  const data = loadData();
  const idx = data.findIndex((e) => e.name === participant);
  if (idx < 0) return res.status(404).send("Participant not found");

  // merge in their latest answers
  data[idx].answers = answers;
  saveData(data);
  res.sendStatus(200);
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Webhook listening on http://localhost:${PORT}`);
});
