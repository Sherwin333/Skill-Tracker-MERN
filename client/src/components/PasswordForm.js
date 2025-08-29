// client/src/components/PasswordForm.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext'; // Import useNotification
import { Lock, Key, RefreshCw, Save } from 'lucide-react';

const PasswordForm = () => {
  const { token } = useAuth();
  const { addNotification } = useNotification(); // Use the notification hook
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(false);
  // Removed local message and error states

  const { currentPassword, newPassword, confirmNewPassword } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    // Removed setMessage and setError

    if (newPassword !== confirmNewPassword) {
      addNotification('New passwords do not match.', 'error'); // Use notification
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      addNotification('New password must be at least 6 characters long.', 'error'); // Use notification
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const resData = await res.json();

      if (!res.ok) {
        addNotification(resData.msg || 'Failed to change password.', 'error'); // Use notification
      } else {
        addNotification(resData.msg || 'Password updated successfully!', 'success'); // Use notification
        setFormData({ // Reset form
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      }
    } catch (err) {
      console.error('Error changing password:', err);
      addNotification('Server error during password change.', 'error'); // Use notification
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Lock className="mr-2 text-red-600" size={24} /> Change Password
      </h2>
      {/* Removed message and error display */}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Current Password */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
            <Key className="inline-block mr-1" size={16} /> Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={currentPassword}
            onChange={onChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
            placeholder="Enter current password"
          />
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            <Lock className="inline-block mr-1" size={16} /> New Password
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={newPassword}
            onChange={onChange}
            minLength="6"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
            placeholder="Enter new password (min 6 chars)"
          />
        </div>

        {/* Confirm New Password */}
        <div>
          <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
            <Lock className="inline-block mr-1" size={16} /> Confirm New Password
          </label>
          <input
            type="password"
            id="confirmNewPassword"
            name="confirmNewPassword"
            value={confirmNewPassword}
            onChange={onChange}
            minLength="6"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
            placeholder="Confirm new password"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin mr-2" size={20} /> Updating...
            </>
          ) : (
            <>
              <Save className="mr-2" size={20} /> Change Password
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PasswordForm;
