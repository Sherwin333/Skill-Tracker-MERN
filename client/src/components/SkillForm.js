// client/src/components/SkillForm.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext'; // Import useNotification
import { RefreshCw, PlusCircle, PenTool, Hash, TrendingUp, Info } from 'lucide-react';

const SkillForm = ({ onAddSuccess }) => {
  const { token } = useAuth();
  const { addNotification } = useNotification(); // Use the notification hook
  const [formData, setFormData] = useState({
    name: '',
    category: 'Other',
    level: 'Beginner',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  // Removed local message and error states

  const { name, category, level, description } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    // Removed local message and error states

    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(formData)
      });

      const resData = await res.json();

      if (!res.ok) {
        addNotification(resData.msg || 'Failed to add skill.', 'error'); // Use notification
      } else {
        addNotification('Skill added successfully!', 'success'); // Use notification
        setFormData({ // Reset form
          name: '',
          category: 'Other',
          level: 'Beginner',
          description: ''
        });
        if (onAddSuccess) onAddSuccess(resData);
      }
    } catch (err) {
      console.error('Error adding skill:', err);
      addNotification('Server error during skill addition.', 'error'); // Use notification
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <PlusCircle className="mr-2 text-blue-600" size={24} /> Add New Skill
      </h2>
      {/* Removed local message and error display */}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Skill Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            <PenTool className="inline-block mr-1" size={16} /> Skill Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={onChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            placeholder="e.g., JavaScript, Project Management"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            <Hash className="inline-block mr-1" size={16} /> Category
          </label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
          >
            <option value="Frontend Development">Frontend Development</option>
            <option value="Backend Development">Backend Development</option>
            <option value="Fullstack Development">Fullstack Development</option>
            <option value="Mobile Development">Mobile Development</option>
            <option value="Database Management">Database Management</option>
            <option value="DevOps">DevOps</option>
            <option value="Cloud Computing">Cloud Computing</option>
            <option value="Data Science & AI">Data Science & AI</option>
            <option value="Machine Learning">Machine Learning</option>
            <option value="Project Management">Project Management</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="Graphic Design">Graphic Design</option>
            <option value="Testing & QA">Testing & QA</option>
            <option value="Soft Skills">Soft Skills</option>
            <option value="Languages">Languages</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Level */}
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
            <TrendingUp className="inline-block mr-1" size={16} /> Proficiency Level
          </label>
          <select
            id="level"
            name="level"
            value={level}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            <Info className="inline-block mr-1" size={16} /> Description
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={onChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            placeholder="Briefly describe your experience with this skill"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin mr-2" size={20} /> Adding Skill...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2" size={20} /> Add Skill
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SkillForm;
