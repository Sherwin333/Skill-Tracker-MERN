// client/src/components/CertificateForm.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext'; // Import useNotification
import { RefreshCw, Upload, FileText, Calendar, Award, Link, Info, Tag } from 'lucide-react';

const CertificateForm = ({ onUploadSuccess }) => {
  const { token } = useAuth();
  const { addNotification } = useNotification(); // Use the notification hook
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issueDate: '',
    credentialId: '',
    credentialUrl: '',
    description: '',
    category: 'Other'
  });
  const [certificateFile, setCertificateFile] = useState(null);
  const [loading, setLoading] = useState(false);
  // Removed local message and error states

  const { title, issuer, issueDate, credentialId, credentialUrl, description, category } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setCertificateFile(file);
      // Removed local message and error states
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    // Removed local message and error states

    if (!certificateFile) {
      addNotification('Please select a certificate file to upload.', 'error'); // Use notification
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('certificateFile', certificateFile);
    data.append('title', title);
    data.append('issuer', issuer);
    data.append('issueDate', issueDate);
    data.append('credentialId', credentialId);
    data.append('credentialUrl', credentialUrl);
    data.append('description', description);
    data.append('category', category);

    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'x-auth-token': token
        },
        body: data
      });

      const resData = await res.json();

      if (!res.ok) {
        addNotification(resData.msg || 'Failed to upload certificate.', 'error'); // Use notification
      } else {
        addNotification('Certificate uploaded successfully!', 'success'); // Use notification
        setFormData({
          title: '',
          issuer: '',
          issueDate: '',
          credentialId: '',
          credentialUrl: '',
          description: '',
          category: 'Other'
        });
        setCertificateFile(null);
        if (onUploadSuccess) onUploadSuccess(resData);
      }
    } catch (err) {
      console.error('Error uploading certificate:', err);
      addNotification('Server error during upload.', 'error'); // Use notification
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Upload className="mr-2 text-indigo-600" size={24} /> Upload New Certificate
      </h2>
      {/* Removed local message and error display */}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            <FileText className="inline-block mr-1" size={16} /> Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            placeholder="e.g., Full Stack Development Bootcamp"
          />
        </div>

        {/* Issuer */}
        <div>
          <label htmlFor="issuer" className="block text-sm font-medium text-gray-700 mb-1">
            <Award className="inline-block mr-1" size={16} /> Issuer
          </label>
          <input
            type="text"
            id="issuer"
            name="issuer"
            value={issuer}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            placeholder="e.g., Coursera, Udemy, University of X"
          />
        </div>

        {/* Issue Date */}
        <div>
          <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline-block mr-1" size={16} /> Issue Date
          </label>
          <input
            type="date"
            id="issueDate"
            name="issueDate"
            value={issueDate}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
          />
        </div>

        {/* Credential ID */}
        <div>
          <label htmlFor="credentialId" className="block text-sm font-medium text-gray-700 mb-1">
            <Info className="inline-block mr-1" size={16} /> Credential ID
          </label>
          <input
            type="text"
            id="credentialId"
            name="credentialId"
            value={credentialId}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            placeholder="Optional: Unique ID for verification"
          />
        </div>

        {/* Credential URL */}
        <div>
          <label htmlFor="credentialUrl" className="block text-sm font-medium text-gray-700 mb-1">
            <Link className="inline-block mr-1" size={16} /> Credential URL
          </label>
          <input
            type="url"
            id="credentialUrl"
            name="credentialUrl"
            value={credentialUrl}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            placeholder="Optional: Link to verification page"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            <FileText className="inline-block mr-1" size={16} /> Description
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={onChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            placeholder="A brief description of what this certificate covers"
          ></textarea>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            <Tag className="inline-block mr-1" size={16} /> Category
          </label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 bg-white"
          >
            <option value="Programming">Programming</option>
            <option value="Design">Design</option>
            <option value="Project Management">Project Management</option>
            <option value="Soft Skills">Soft Skills</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label htmlFor="certificateFile" className="block text-sm font-medium text-gray-700 mb-1">
            <Upload className="inline-block mr-1" size={16} /> Certificate File (PDF/JPG/PNG) <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            id="certificateFile"
            name="certificateFile"
            onChange={onFileChange}
            required
            accept=".pdf,.jpg,.jpeg,.png"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100 cursor-pointer"
          />
          {certificateFile && <p className="mt-2 text-sm text-gray-600">Selected file: {certificateFile.name}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin mr-2" size={20} /> Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2" size={20} /> Upload Certificate
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CertificateForm;
