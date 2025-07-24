import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddParticipant() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [factory, setFactory] = useState('');
  const [project, setProject] = useState('');

  const handleSubmit = () => {
    if (!name || !factory || !project) {
      alert("All fields required.");
      return;
    }

    const newParticipant = { name, factory, project };
    const existingData = JSON.parse(localStorage.getItem("employees")) || [];
    existingData.push(newParticipant);
    localStorage.setItem("employees", JSON.stringify(existingData));
    navigate('/admin-dashboard');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Add New Participant</h2>
      <div>
        <label>Name: </label><br />
        <input value={name} onChange={(e) => setName(e.target.value)} /><br />
        <label>Factory: </label><br />
        <input value={factory} onChange={(e) => setFactory(e.target.value)} /><br />
        <label>Project: </label><br />
        <input value={project} onChange={(e) => setProject(e.target.value)} /><br /><br />
        <button onClick={handleSubmit}>Add</button>
      </div>
    </div>
  );
}
