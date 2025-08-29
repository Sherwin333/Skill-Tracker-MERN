// client/src/components/CertificateList.js
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext'; // Import useNotification
import CertificateCard from './CertificateCard';
import { RefreshCw, X, Save, FileText, Calendar, Award, Link, Info, Tag, Globe, Search, AlertTriangle } from 'lucide-react'; // Added AlertTriangle icon

const CertificateList = ({ refreshTrigger }) => {
  const { token } = useAuth();
  const { addNotification } = useNotification(); // Use the notification hook
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  // Removed local error and message states

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // New state for custom delete confirmation modal
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      // Removed local error state
      try {
        const res = await fetch('/api/certificates', {
          headers: {
            'x-auth-token': token
          }
        });
        const data = await res.json();
        if (!res.ok) {
          addNotification(data.msg || 'Failed to fetch certificates.', 'error'); // Use notification
        } else {
          setCertificates(data);
        }
      } catch (err) {
        console.error('Error fetching certificates:', err);
        addNotification('Server error during fetch.', 'error'); // Use notification
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCertificates();
    }
  }, [token, refreshTrigger, addNotification]); // Add addNotification to dependencies

  // Function to open delete confirmation modal
  const confirmDelete = (id) => {
    setCertificateToDelete(id);
    setShowDeleteConfirmModal(true);
  };

  // Function to handle actual deletion after confirmation
  const handleDelete = async () => {
    setShowDeleteConfirmModal(false); // Close modal
    if (!certificateToDelete) return; // Should not happen if modal is properly triggered

    setLoading(true);
    // Removed local error and message states
    try {
      const res = await fetch(`/api/certificates/${certificateToDelete}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });

      if (!res.ok) {
        const data = await res.json();
        addNotification(data.msg || 'Failed to delete certificate.', 'error'); // Use notification
      } else {
        setCertificates(certificates.filter(cert => cert._id !== certificateToDelete));
        addNotification('Certificate deleted successfully!', 'success'); // Use notification
      }
    } catch (err) {
      console.error('Error deleting certificate:', err);
      addNotification('Server error during deletion.', 'error'); // Use notification
    } finally {
      setLoading(false);
      setCertificateToDelete(null); // Clear certificate to delete
    }
  };

  const handleEditClick = (certificate) => {
    setEditingCertificate(certificate);
    setEditFormData({
      ...certificate,
      issueDate: certificate.issueDate ? new Date(certificate.issueDate).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };


  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Removed local error and message states
    try {
      const res = await fetch(`/api/certificates/${editingCertificate._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(editFormData)
      });

      const data = await res.json();
      if (!res.ok) {
        addNotification(data.msg || 'Failed to update certificate.', 'error'); // Use notification
      } else {
        setCertificates(certificates.map(cert =>
          cert._id === editingCertificate._id ? data : cert
        ));
        addNotification('Certificate updated successfully!', 'success'); // Use notification
        setShowEditModal(false);
        setEditingCertificate(null);
      }
    } catch (err) {
      console.error('Error updating certificate:', err);
      addNotification('Server error during update.', 'error'); // Use notification
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = useMemo(() => {
    let currentCertificates = [...certificates];

    if (filterCategory !== 'All') {
      currentCertificates = currentCertificates.filter(
        (cert) => cert.category === filterCategory
      );
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentCertificates = currentCertificates.filter(
        (cert) =>
          cert.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          cert.issuer.toLowerCase().includes(lowerCaseSearchTerm) ||
          (cert.description && cert.description.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    return currentCertificates;
  }, [certificates, filterCategory, searchTerm]);


  if (loading && certificates.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="animate-spin text-indigo-500 mr-3" size={24} />
        <p className="text-gray-700">Loading certificates...</p>
      </div>
    );
  }

  // Removed global error display as notifications handle it

  const uniqueCategories = ['All', ...new Set(certificates.map(cert => cert.category))].sort();


  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Certificates</h2>
      {/* Removed local message display */}

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search certificates..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <select
          className="md:w-auto w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 bg-white"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          {uniqueCategories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      {/* End Search and Filter Bar */}


      {filteredCertificates.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No matching certificates found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map(cert => (
            <CertificateCard
              key={cert._id}
              certificate={cert}
              onDelete={() => confirmDelete(cert._id)} // Use confirmDelete
              onEdit={handleEditClick}
            />
          ))}
        </div>
      )}

      {/* Edit Modal (remains the same) */}
      {showEditModal && editingCertificate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Edit Certificate</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  id="editTitle"
                  name="title"
                  value={editFormData.title || ''}
                  onChange={handleEditFormChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="editIssuer" className="block text-sm font-medium text-gray-700 mb-1">Issuer</label>
                <input
                  type="text"
                  id="editIssuer"
                  name="issuer"
                  value={editFormData.issuer || ''}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="editIssueDate" className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <input
                  type="date"
                  id="editIssueDate"
                  name="issueDate"
                  value={editFormData.issueDate || ''}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="editCredentialId" className="block text-sm font-medium text-gray-700 mb-1">Credential ID</label>
                <input
                  type="text"
                  id="editCredentialId"
                  name="credentialId"
                  value={editFormData.credentialId || ''}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="editCredentialUrl" className="block text-sm font-medium text-gray-700 mb-1">Credential URL</label>
                <input
                  type="url"
                  id="editCredentialUrl"
                  name="credentialUrl"
                  value={editFormData.credentialUrl || ''}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="editDescription"
                  name="description"
                  value={editFormData.description || ''}
                  onChange={handleEditFormChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
              <div>
                <label htmlFor="editCategory" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  id="editCategory"
                  name="category"
                  value={editFormData.category || 'Other'}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Project Management">Project Management</option>
                  <option value="Soft Skills">Soft Skills</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* isPublic Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <label htmlFor="editIsPublic" className="block text-sm font-medium text-gray-700 flex items-center">
                  <Globe className="mr-2" size={16} /> Make Public
                </label>
                <label htmlFor="editIsPublic" className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="editIsPublic"
                      name="isPublic"
                      checked={editFormData.isPublic || false}
                      onChange={handleEditFormChange}
                      className="sr-only"
                    />
                    <div className="block bg-gray-300 w-14 h-8 rounded-full"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${editFormData.isPublic ? 'transform translate-x-full bg-green-500' : 'bg-gray-400'}`}></div>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm relative text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={40} />
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this certificate? This action cannot be undone.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateList;
