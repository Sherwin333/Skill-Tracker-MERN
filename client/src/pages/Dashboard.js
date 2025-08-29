// client/src/pages/Dashboard.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DashboardStats from '../components/DashboardStats';

function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth(); // Removed logout as it's not used here directly
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-700">Loading user data...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-500 to-green-500">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Welcome, {user ? user.name : 'Guest'}!
          </h1>
          <p className="text-xl text-gray-700">This is your Skill Tracker Dashboard.</p>
          {/* Removed email display and logout button */}
        </div>

        {/* Render Dashboard Stats */}
        <div className="w-full max-w-6xl">
            <DashboardStats />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;