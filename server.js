const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Dummy employee list from your JSON
const employees = require('./employees.json');

// Route to return employee list
app.get('/api/employees', (req, res) => {
  res.json(employees);
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
