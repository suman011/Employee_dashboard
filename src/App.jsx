import React from 'react';
import { BrowserRouter  as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeProfile from './pages/EmployeeProfile';
import EvaluationForm from './pages/EvaluationForm';
import EvaluationCriteria from './pages/EvaluationCriteria';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeProfile />} />
        <Route path="/employee/:id" element={<EmployeeProfile />} />
        <Route path="/evaluate" element={<EvaluationForm />} />
        <Route path="/evaluation-criteria" element={<EvaluationCriteria />} />

      </Routes>
    </Router>
  );
}

export default App;
