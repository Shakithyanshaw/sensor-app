import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

function App() {
  const [sensorData, setSensorData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSensorData();
  }, []);

  const fetchSensorData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/sensor-data', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSensorData(response.data);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="App">
      <h1>Sensor Data</h1>
      {error && <p>Error fetching sensor data: {error}</p>}
      <table>
        <thead>
          <tr>
            <th>Sensor ID</th>
            <th>Date</th>
            <th>Data Value</th>
          </tr>
        </thead>
        <tbody>
          {sensorData.map((data) => (
            <tr key={data.id}>
              <td>{data.sensor_id}</td>
              <td>{data.date}</td>
              <td>{data.data_value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <LineChart width={600} height={300} data={sensorData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="data_value" stroke="#8884d8" />
      </LineChart>
    </div>
  );
}

export default App;
