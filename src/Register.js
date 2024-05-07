import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; // Import your CSS file for styling

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/register', {
        username,
        password,
      });
      setMessage('User registered successfully!');
    } catch (error) {
      setMessage('Error registering user');
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-register">
          Register
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default Register;
