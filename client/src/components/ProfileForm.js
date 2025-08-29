// client/src/components/ProfileForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext'; // Import useNotification
import { User, Mail, Save, RefreshCw } from 'lucide-react';

const ProfileForm = () => {
  const { token, user, setUser } = useAuth();
  const { addNotification } = useNotification(); // Use the notification hook
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  // Removed local message and error states

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const { name, email } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    // Removed setMessage and setError

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(formData)
      });

      const resData = await res.json();

      if (!res.ok) {
        addNotification(resData.msg || 'Failed to update profile.', 'error'); // Use notification
      } else {
        addNotification('Profile updated successfully!', 'success'); // Use notification
        setUser(resData);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      addNotification('Server error during profile update.', 'error'); // Use notification
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <User className="mr-2 text-blue-600" size={24} /> Update Profile
      </h2>
      {/* Removed message and error display */}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            <User className="inline-block mr-1" size={16} /> Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={onChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            placeholder="Your full name"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            <Mail className="inline-block mr-1" size={16} /> Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            placeholder="Your email address"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin mr-2" size={20} /> Updating...
            </>
          ) : (
            <>
              <Save className="mr-2" size={20} /> Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;
