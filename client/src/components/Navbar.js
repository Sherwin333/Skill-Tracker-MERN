// client/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Award,
  User,
  LogOut,
  Code,
  Folder,
  Share2,
  Settings,
  UserCircle
} from 'lucide-react';

function Navbar() {
  const { isAuthenticated, logout, user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg p-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <Link to="/" className="text-3xl font-bold tracking-wide flex items-center mb-4 md:mb-0">
          <Briefcase className="mr-3" size={30} />
          SkillTracker
        </Link>

        <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-8">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="text-lg font-medium hover:text-blue-200 transition-colors duration-200 flex items-center"
              >
                <User className="mr-2" size={20} /> Dashboard
              </Link>

              <Link
                to="/certificates"
                className="text-lg font-medium hover:text-blue-200 transition-colors duration-200 flex items-center"
              >
                <Award className="mr-2" size={20} /> Certificates
              </Link>

              <Link
                to="/skills"
                className="text-lg font-medium hover:text-blue-200 transition-colors duration-200 flex items-center"
              >
                <Code className="mr-2" size={20} /> Skills
              </Link>

              <Link
                to="/projects"
                className="text-lg font-medium hover:text-blue-200 transition-colors duration-200 flex items-center"
              >
                <Folder className="mr-2" size={20} /> Projects
              </Link>

              {/* Public Portfolio */}
              {user && user.isPublicPortfolioEnabled && user.publicPortfolioId ? (
                <a
                  href={`${window.location.origin}/portfolio/${user.publicPortfolioId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-medium hover:text-blue-200 transition-colors duration-200 flex items-center bg-blue-500 px-3 py-1 rounded-md"
                >
                  <Share2 className="mr-2" size={20} /> View Portfolio
                </a>
              ) : (
                <span className="text-lg font-medium text-blue-200 transition-colors duration-200 flex items-center opacity-60 cursor-not-allowed">
                  <Share2 className="mr-2" size={20} /> Public Portfolio
                </span>
              )}

              <div className="flex items-center space-x-3">
                {/* Avatar (with fallback) */}
                {user && user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full object-cover border-2 border-white"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://placehold.co/200x200/cccccc/333333?text=Avatar';
                    }}
                  />
                ) : (
                  <UserCircle className="w-8 h-8 text-white" />
                )}

                <Link
                  to="/settings"
                  className="text-lg font-medium hover:text-blue-200 transition-colors duration-200 flex items-center"
                >
                  <Settings className="mr-2" size={20} /> Settings
                </Link>

                <span className="text-blue-100 text-sm italic hidden md:block">
                  {user ? `Logged in as ${user.name}` : 'Loading...'}
                </span>

                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition duration-200 text-sm font-semibold shadow-md"
                >
                  <LogOut className="mr-2" size={18} /> Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="text-lg font-medium hover:text-blue-200 transition-colors duration-200"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="text-lg font-medium hover:text-blue-200 transition-colors duration-200"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
