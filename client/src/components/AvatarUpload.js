// client/src/components/AvatarUpload.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext'; // Import useNotification
import { UserCircle, Upload, Trash2, RefreshCw } from 'lucide-react';

const AvatarUpload = () => {
  const { token, user, setUser } = useAuth();
  const { addNotification } = useNotification(); // Use the notification hook
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  // Removed local message and error states

  useEffect(() => {
    if (user && user.avatarUrl) {
      setAvatarPreview(user.avatarUrl);
    }
  }, [user]);

  const onFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      // Removed local message and error states
    }
  };

  const handleUpload = async () => {
    if (!avatarFile) {
      addNotification('Please select an image file to upload.', 'error'); // Use notification
      return;
    }

    setLoading(true);
    // Removed local message and error states

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    try {
      const res = await fetch('/api/auth/avatar', {
        method: 'PUT',
        headers: {
          'x-auth-token': token
        },
        body: formData
      });

      const resData = await res.json();

      if (!res.ok) {
        addNotification(resData.msg || 'Failed to upload avatar.', 'error'); // Use notification
      } else {
        addNotification(resData.msg, 'success'); // Use notification
        setUser({ ...user, avatarUrl: resData.avatarUrl, avatarPublicId: resData.avatarPublicId });
        setAvatarFile(null);
        if (avatarPreview && avatarPreview.startsWith('blob:')) {
          URL.revokeObjectURL(avatarPreview);
        }
        setAvatarPreview(resData.avatarUrl);
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      addNotification('Server error during avatar upload.', 'error'); // Use notification
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to remove your avatar and revert to default?')) {
        return;
    }
    setLoading(true);
    // Removed local message and error states

    try {
      const res = await fetch('/api/auth/avatar', {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });

      const resData = await res.json();

      if (!res.ok) {
        addNotification(resData.msg || 'Failed to delete avatar.', 'error'); // Use notification
      } else {
        addNotification(resData.msg, 'success'); // Use notification
        setUser({ ...user, avatarUrl: resData.avatarUrl, avatarPublicId: 'skill-tracker/default-avatar' });
        setAvatarFile(null);
        if (avatarPreview && avatarPreview.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreview);
        }
        setAvatarPreview(resData.avatarUrl);
      }
    } catch (err) {
      console.error('Error deleting avatar:', err);
      addNotification('Server error during avatar deletion.', 'error'); // Use notification
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
        <UserCircle className="mr-2 text-indigo-600" size={24} /> Profile Picture
      </h2>
      {/* Removed local message and error display */}

      {/* Avatar Display */}
      <div className="mb-6">
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="Profile Avatar"
            className="w-32 h-32 rounded-full object-cover mx-auto shadow-md border-4 border-indigo-200"
            onError={(e) => { e.target.onerror = null; e.target.src = user?.avatarUrl || 'https://placehold.co/200x200/cccccc/333333?text=Avatar'; }}
          />
        ) : (
          <UserCircle className="w-32 h-32 text-gray-400 mx-auto" />
        )}
      </div>

      {/* File Input */}
      <div className="mb-4">
        <label htmlFor="avatar-upload" className="block text-sm font-medium text-gray-700 mb-2">
          Upload New Avatar (JPG, PNG, GIF - Max 2MB)
        </label>
        <input
          type="file"
          id="avatar-upload"
          name="avatar"
          onChange={onFileChange}
          accept="image/jpeg,image/png,image/gif"
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100 cursor-pointer"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-6">
        <button
          onClick={handleUpload}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 text-sm font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !avatarFile}
        >
          {loading && avatarFile ? (
            <RefreshCw className="animate-spin mr-2" size={16} />
          ) : (
            <Upload className="mr-2" size={16} />
          )}
          Upload
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 text-sm font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !user || !user.avatarPublicId || user.avatarPublicId === 'skill-tracker/default-avatar'}
        >
          {loading && !avatarFile ? (
            <RefreshCw className="animate-spin mr-2" size={16} />
          ) : (
            <Trash2 className="mr-2" size={16} />
          )}
          Remove
        </button>
      </div>
    </div>
  );
};

export default AvatarUpload;
