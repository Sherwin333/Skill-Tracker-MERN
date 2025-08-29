    // client/src/pages/Login.js
    import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { useAuth } from '../context/AuthContext';

    function Login() {
      const [formData, setFormData] = useState({
        email: '',
        password: ''
      });
      const [message, setMessage] = useState('');
      const [error, setError] = useState('');

      const { setToken } = useAuth();
      const navigate = useNavigate();

      const { email, password } = formData;

      const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

      const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          });

          const data = await res.json();

          if (!res.ok) {
            setError(data.msg || 'Login failed');
          } else {
            setToken(data.token); // Store token in global state and localStorage
            setMessage('Login successful!');
            navigate('/dashboard'); // Navigate to dashboard after successful login
          }
        } catch (err) {
          console.error('Login error:', err);
          setError('Server error during login');
        }
      };

      return (
        <div className="min-h-screen bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-6">Login</h1>
            {message && <p className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-center">{message}</p>}
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">{error}</p>}
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Login
              </button>
            </form>
            <p className="mt-6 text-center text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-teal-600 hover:text-teal-800 font-semibold focus:outline-none"
              >
                Register
              </button>
            </p>
          </div>
        </div>
      );
    }

    export default Login;
    