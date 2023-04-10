import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Treemap,
} from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#d8bcf9', '#b5ecf9', '#ffa45b'];

function Dashboard() {
  const [uniqueApiUsers, setUniqueApiUsers] = useState([]);
  const [topApiUsers, setTopApiUsers] = useState([]);
  const [topUsersByEndpoint, setTopUsersByEndpoint] = useState([]);
  const [errorsByEndpoint, setErrorsByEndpoint] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem('accessToken');
      const responseUniqueApiUsers = await axios.get('https://prabh-sokhey-pokedex.onrender.com/analytics/unique-api-users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUniqueApiUsers(responseUniqueApiUsers.data.data);

      const responseTopApiUsers = await axios.get('https://prabh-sokhey-pokedex.onrender.com/analytics/top-api-users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTopApiUsers(responseTopApiUsers.data.data);

      const responseTopUsersByEndpoint = await axios.get('https://prabh-sokhey-pokedex.onrender.com/analytics/top-users-by-endpoint', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTopUsersByEndpoint(responseTopUsersByEndpoint.data.data);

      const responseErrorsByEndpoint = await axios.get('https://prabh-sokhey-pokedex.onrender.com/analytics/errors-by-endpoint', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setErrorsByEndpoint(responseErrorsByEndpoint.data.data);
    }

    fetchData();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
  
      <h2>Unique API Users by Date</h2>
      <p>This bar chart displays the number of unique API users per day.</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={uniqueApiUsers}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
  
      <h2>Top API Users</h2>
      <p>This pie chart shows the distribution of API usage among the top users.</p>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={topApiUsers}
            dataKey="count"
            nameKey="username"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {topApiUsers.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
  
      <h2>Top Users by Endpoint</h2>
      <p>This treemap represents the distribution of API usage by endpoint for the top users.</p>
      <ResponsiveContainer width="100%" height={300}>
        <Treemap
          width={400}
          height={200}
          data={topUsersByEndpoint}
          dataKey="count"
          ratio={4 / 3}
          stroke="#fff"
          fill="#8884d8"
        />
      </ResponsiveContainer>
  
      <h2>4xx Errors by Endpoint</h2>
      <p>This bar chart displays the number of 4xx errors encountered per API endpoint.</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={errorsByEndpoint}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="requestPath" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Dashboard;
