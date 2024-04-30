import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import SensorData from './SensorData'; // Rename your previous App component to SensorData

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sensor-data" element={<SensorData />} />
      </Routes>
    </Router>
  );
}

export default App;
