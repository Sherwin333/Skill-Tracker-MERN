// client/src/components/ProjectForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext'; // Import useNotification
import { RefreshCw, PlusCircle, BookOpen, FileText, Code, Calendar, Link, Github, Zap } from 'lucide-react';

const ProjectForm = ({ onAddSuccess }) => {
  const { token } = useAuth();
  const { addNotification } = useNotification(); // Use the notification hook
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '', // Comma-separated string
    startDate: '',
    endDate: '',
    projectUrl: '',
    githubUrl: '',
    associatedSkills: [] // Array of skill IDs
  });
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  // Removed local message and error states

  const { title, description, technologies, startDate, endDate, projectUrl, githubUrl, associatedSkills } = formData;

  useEffect(() => {
    const fetchSkills = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/skills', {
          headers: {
            'x-auth-token': token
          }
        });
        const data = await res.json();
        if (res.ok) {
          setAllSkills(data);
        } else {
          console.error('Failed to fetch skills for project form:', data.msg);
          addNotification(data.msg || 'Failed to load skills for project form.', 'error'); // Use notification
        }
      } catch (err) {
        console.error('Error fetching skills for project form:', err);
        addNotification('Server error fetching skills for project form.', 'error'); // Use notification
      }
    };
    fetchSkills();
  }, [token, addNotification]); // Add addNotification to dependencies

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSkillChange = e => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData({ ...formData, associatedSkills: selectedOptions });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    // Removed local message and error states

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(formData)
      });

      const resData = await res.json();

      if (!res.ok) {
        addNotification(resData.msg || 'Failed to add project.', 'error'); // Use notification
      } else {
        addNotification('Project added successfully!', 'success'); // Use notification
        setFormData({ // Reset form
          title: '',
          description: '',
          technologies: '',
          startDate: '',
          endDate: '',
          projectUrl: '',
          githubUrl: '',
          associatedSkills: []
        });
        if (onAddSuccess) onAddSuccess(resData);
      }
    } catch (err) {
      console.error('Error adding project:', err);
      addNotification('Server error during project addition.', 'error'); // Use notification
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <PlusCircle className="mr-2 text-purple-600" size={24} /> Add New Project
      </h2>
      {/* Removed local message and error display */}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            <BookOpen className="inline-block mr-1" size={16} /> Project Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
            placeholder="e.g., E-commerce Platform, Mobile Game"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            <FileText className="inline-block mr-1" size={16} /> Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={onChange}
            rows="4"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
            placeholder="Briefly describe the project, your role, and key features."
          ></textarea>
        </div>

        {/* Technologies */}
        <div>
          <label htmlFor="technologies" className="block text-sm font-medium text-gray-700 mb-1">
            <Code className="inline-block mr-1" size={16} /> Technologies (comma-separated)
          </label>
          <input
            type="text"
            id="technologies"
            name="technologies"
            value={technologies}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
            placeholder="e.g., React, Node.js, MongoDB, Tailwind CSS"
          />
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline-block mr-1" size={16} /> Start Date
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={startDate}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
          />
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline-block mr-1" size={16} /> End Date
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={endDate}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
          />
        </div>

        {/* Project URL */}
        <div>
          <label htmlFor="projectUrl" className="block text-sm font-medium text-gray-700 mb-1">
            <Link className="inline-block mr-1" size={16} /> Live URL
          </label>
          <input
            type="url"
            id="projectUrl"
            name="projectUrl"
            value={projectUrl}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
            placeholder="Link to live demo or deployed project"
          />
        </div>

        {/* GitHub URL */}
        <div>
          <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-1">
            <Github className="inline-block mr-1" size={16} /> GitHub URL
          </label>
          <input
            type="url"
            id="githubUrl"
            name="githubUrl"
            value={githubUrl}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
            placeholder="Link to project repository"
          />
        </div>

        {/* Associated Skills (Multi-select) */}
        <div>
          <label htmlFor="associatedSkills" className="block text-sm font-medium text-gray-700 mb-1">
            <Zap className="inline-block mr-1" size={16} /> Associated Skills
          </label>
          <select
            multiple
            id="associatedSkills"
            name="associatedSkills"
            value={associatedSkills}
            onChange={onSkillChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 bg-white h-32"
          >
            {allSkills.length === 0 ? (
              <option value="" disabled>No skills added yet. Add some in the Skills section!</option>
            ) : (
              allSkills.map(skill => (
                <option key={skill._id} value={skill._id}>
                  {skill.name} ({skill.level})
                </option>
              ))
            )}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple skills.</p>
        </div>


        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin mr-2" size={20} /> Adding Project...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2" size={20} /> Add Project
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ProjectForm;
