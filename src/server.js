
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const EMPLOYEE_FILE = path.join(__dirname, "data", "employees.json");

app.use(cors());
app.use(express.json());

const readEmployees = () => {
  const data = fs.readFileSync(EMPLOYEE_FILE);
  return JSON.parse(data);
};

const writeEmployees = (employees) => {
  fs.writeFileSync(EMPLOYEE_FILE, JSON.stringify(employees, null, 2));
};

app.get("/employees", (req, res) => {
  const employees = readEmployees();
  res.json(employees);
});

app.post("/employees", (req, res) => {
  const employees = readEmployees();
  const newEmp = req.body;
  newEmp.id = Date.now();
  employees.push(newEmp);
  writeEmployees(employees);
  res.json(newEmp);
});

app.put("/employees/:id", (req, res) => {
  const employees = readEmployees();
  const empId = parseInt(req.params.id);
  const updated = req.body;

  const idx = employees.findIndex(e => e.id === empId);
  if (idx !== -1) {
    employees[idx] = { ...employees[idx], ...updated };
    writeEmployees(employees);
    res.json(employees[idx]);
  } else {
    res.status(404).json({ message: "Employee not found" });
  }
});

app.delete("/employees/:id", (req, res) => {
  const employees = readEmployees();
  const empId = parseInt(req.params.id);
  const updatedList = employees.filter(e => e.id !== empId);
  writeEmployees(updatedList);
  res.json({ message: "Deleted" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
