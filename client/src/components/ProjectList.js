// client/src/components/ProjectList.js
import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext'; // Import useNotification
import ProjectCard from './ProjectCard';
import {
  RefreshCw,
  X,
  Save,
  BookOpen,
  FileText,
  Code,
  Calendar,
  Link,
  Github,
  Zap,
  Globe,
  Search,
  AlertTriangle
} from 'lucide-react'; // Added AlertTriangle icon

const ProjectList = ({ refreshTrigger }) => {
  const { token } = useAuth();
  const { addNotification } = useNotification(); // Use the notification hook
  const [projects, setProjects] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  useEffect(() => {
    const fetchProjectsAndSkills = async () => {
      setLoading(true);
      try {
        const projectRes = await fetch('/api/projects', {
          headers: { 'x-auth-token': token }
        });
        const projectData = await projectRes.json();
        if (!projectRes.ok) {
          addNotification(projectData.msg || 'Failed to fetch projects.', 'error');
        }
        setProjects(projectData);

        const skillRes = await fetch('/api/skills', {
          headers: { 'x-auth-token': token }
        });
        const skillData = await skillRes.json();
        if (skillRes.ok) {
          setAllSkills(skillData);
        } else {
          console.error('Failed to fetch skills for project lists:', skillData.msg);
          addNotification(skillData.msg || 'Failed to load skills for project lists.', 'error');
        }
      } catch (err) {
        console.error('Error fetching projects/skills:', err);
        addNotification(err.message || 'Server error during fetch.', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProjectsAndSkills();
    }
  }, [token, refreshTrigger, addNotification]);

  const confirmDelete = (id) => {
    setProjectToDelete(id);
    setShowDeleteConfirmModal(true);
  };

  const handleDelete = async () => {
    setShowDeleteConfirmModal(false);
    if (!projectToDelete) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectToDelete}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });

      if (!res.ok) {
        const data = await res.json();
        addNotification(data.msg || 'Failed to delete project.', 'error');
      } else {
        setProjects(projects.filter((project) => project._id !== projectToDelete));
        addNotification('Project deleted successfully!', 'success');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      addNotification('Server error during deletion.', 'error');
    } finally {
      setLoading(false);
      setProjectToDelete(null);
    }
  };

  const handleEditClick = (project) => {
    setEditingProject(project);
    setEditFormData({
      ...project,
      technologies: project.technologies.join(', '),
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      associatedSkills: project.associatedSkills.map((skill) => skill._id)
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked, options } = e.target;
    if (name === 'associatedSkills') {
      const selectedOptions = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      setEditFormData({ ...editFormData, [name]: selectedOptions });
    } else {
      setEditFormData({ ...editFormData, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${editingProject._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(editFormData)
      });

      const data = await res.json();
      if (!res.ok) {
        addNotification(data.msg || 'Failed to update project.', 'error');
      } else {
        setProjects(
          projects.map((proj) => (proj._id === editingProject._id ? data : proj))
        );
        addNotification('Project updated successfully!', 'success');
        setShowEditModal(false);
        setEditingProject(null);
      }
    } catch (err) {
      console.error('Error updating project:', err);
      addNotification('Server error during update.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    let currentProjects = [...projects];

    if (filterCategory !== 'All') {
      currentProjects = currentProjects.filter((project) =>
        project.technologies.some(
          (tech) => tech.toLowerCase() === filterCategory.toLowerCase()
        )
      );
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentProjects = currentProjects.filter(
        (project) =>
          project.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          project.description.toLowerCase().includes(lowerCaseSearchTerm) ||
          project.technologies.some((tech) =>
            tech.toLowerCase().includes(lowerCaseSearchTerm)
          ) ||
          project.associatedSkills.some((skill) =>
            skill.name.toLowerCase().includes(lowerCaseSearchTerm)
          )
      );
    }

    return currentProjects;
  }, [projects, filterCategory, searchTerm]);

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="animate-spin text-purple-500 mr-3" size={24} />
        <p className="text-gray-700">Loading projects...</p>
      </div>
    );
  }

  const uniqueTechnologies = [
    'All',
    ...new Set(projects.flatMap((project) => project.technologies))
  ].sort();

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Projects</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
        <select
          className="md:w-auto w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 bg-white"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          {uniqueTechnologies.map((tech) => (
            <option key={tech} value={tech}>
              {tech}
            </option>
          ))}
        </select>
      </div>

      {filteredProjects.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No matching projects found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredProjects.map((proj) => (
            <ProjectCard
              key={proj._id}
              project={proj}
              onDelete={() => confirmDelete(proj._id)}
              onEdit={handleEditClick}
            />
          ))}
        </div>
      )}

      {/* 🔥 Edit Modal */}
      {showEditModal && editingProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Edit Project</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="editTitle"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <BookOpen className="inline-block mr-1" size={16} /> Project Title
                </label>
                <input
                  type="text"
                  id="editTitle"
                  name="title"
                  value={editFormData.title || ''}
                  onChange={handleEditFormChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label
                  htmlFor="editDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <FileText className="inline-block mr-1" size={16} /> Description
                </label>
                <textarea
                  id="editDescription"
                  name="description"
                  value={editFormData.description || ''}
                  onChange={handleEditFormChange}
                  rows="4"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="editTechnologies"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <Code className="inline-block mr-1" size={16} /> Technologies
                  (comma-separated)
                </label>
                <input
                  type="text"
                  id="editTechnologies"
                  name="technologies"
                  value={editFormData.technologies || ''}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label
                  htmlFor="editStartDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <Calendar className="inline-block mr-1" size={16} /> Start Date
                </label>
                <input
                  type="date"
                  id="editStartDate"
                  name="startDate"
                  value={editFormData.startDate || ''}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label
                  htmlFor="editEndDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <Calendar className="inline-block mr-1" size={16} /> End Date
                </label>
                <input
                  type="date"
                  id="editEndDate"
                  name="endDate"
                  value={editFormData.endDate || ''}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label
                  htmlFor="editProjectUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <Link className="inline-block mr-1" size={16} /> Live URL
                </label>
                <input
                  type="url"
                  id="editProjectUrl"
                  name="projectUrl"
                  value={editFormData.projectUrl || ''}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label
                  htmlFor="editGithubUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <Github className="inline-block mr-1" size={16} /> GitHub URL
                </label>
                <input
                  type="url"
                  id="editGithubUrl"
                  name="githubUrl"
                  value={editFormData.githubUrl || ''}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label
                  htmlFor="editAssociatedSkills"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <Zap className="inline-block mr-1" size={16} /> Associated Skills
                </label>
                <select
                  multiple
                  id="editAssociatedSkills"
                  name="associatedSkills"
                  value={editFormData.associatedSkills || []}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white h-32"
                >
                  {allSkills.length === 0 ? (
                    <option value="" disabled>
                      No skills added yet.
                    </option>
                  ) : (
                    allSkills.map((skill) => (
                      <option key={skill._id} value={skill._id}>
                        {skill.name} ({skill.level})
                      </option>
                    ))
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Hold Ctrl/Cmd to select multiple skills.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <label
                  htmlFor="editIsPublic"
                  className="block text-sm font-medium text-gray-700 flex items-center"
                >
                  <Globe className="mr-2" size={16} /> Make Public
                </label>
                <label
                  htmlFor="editIsPublic"
                  className="flex items-center cursor-pointer"
                >
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
                    <div
                      className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                        editFormData.isPublic
                          ? 'transform translate-x-full bg-green-500'
                          : 'bg-gray-400'
                      }`}
                    ></div>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* 🔥 Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm relative text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={40} />
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this project? This action cannot be
              undone.
            </p>
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

export default ProjectList;
