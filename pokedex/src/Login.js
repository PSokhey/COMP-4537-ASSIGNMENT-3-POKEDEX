import React, { useState, useEffect } from 'react';
import axios from 'axios';
import App from './App';
import Dashboard from './Dashboard';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedAccessToken = localStorage.getItem('accessToken');
    if (storedUser && storedAccessToken) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      if (isLogin) {
        const res = await axios.post('https://prabh-sokhey-pokedex.onrender.com/login', { username, password });
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
      } else {
        await axios.post('https://prabh-sokhey-pokedex.onrender.com/signup', { username, password, role });
        setIsLogin(true);
      }
    } catch (err) {
      setErrorMessage('Incorrect username/password');
      console.log(err);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const toggleLoginSignup = () => {
    setIsLogin(!isLogin);
    setErrorMessage('');
  };

  if (user) {
    return user.role === 'admin' ? (
      <>
        <Dashboard />
        <button onClick={logout}>Logout</button>
      </>
    ) : (
      <>
        <App />
        <button onClick={logout}>Logout</button>
      </>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        {!isLogin && (
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        )}
        <br />
        <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>
      {errorMessage && <p>{errorMessage}</p>}
      <button onClick={toggleLoginSignup}>
        {isLogin ? 'Sign Up' : 'Login'}
      </button>
    </div>
  );
}

export default Login;
