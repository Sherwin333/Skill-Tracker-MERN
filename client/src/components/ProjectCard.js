// client/src/components/ProjectCard.js
import React from 'react';
import { BookOpen, FileText, Code, Calendar, Link, Github, Zap, Edit, Trash2, Globe } from 'lucide-react'; // Added Globe icon

const ProjectCard = ({ project, onDelete, onEdit }) => {
  const { _id, title, description, technologies, startDate, endDate, projectUrl, githubUrl, associatedSkills, isPublic } = project; // Destructure isPublic

  const formattedStartDate = startDate ? new Date(startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : 'N/A';
  const formattedEndDate = endDate ? new Date(endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : 'Present';

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 ease-in-out">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900 leading-tight flex items-center">
          <BookOpen className="mr-2 text-purple-600" size={20} /> {title}
        </h3>
        {isPublic && ( // Show Globe icon if public
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Globe className="mr-1" size={12} /> Public
          </span>
        )}
      </div>


      <p className="text-gray-700 text-sm mb-4 flex items-start">
        <FileText className="mr-2 mt-1 text-purple-500" size={16} /> {description}
      </p>

      {technologies && technologies.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 flex items-center mb-1">
            <Code className="mr-2 text-purple-500" size={16} /> Technologies:
          </p>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech, index) => (
              <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center text-sm text-gray-600 mb-4">
        <Calendar className="mr-2 text-purple-500" size={16} />
        <span>{formattedStartDate} - {formattedEndDate}</span>
      </div>

      {associatedSkills && associatedSkills.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 flex items-center mb-1">
            <Zap className="mr-2 text-purple-500" size={16} /> Associated Skills:
          </p>
          <div className="flex flex-wrap gap-2">
            {associatedSkills.map(skill => (
              <span key={skill._id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                {skill.name} ({skill.level})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-5">
        {projectUrl && (
          <a
            href={projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 text-sm font-medium shadow-sm hover:shadow-md"
          >
            <Link className="mr-2" size={16} /> Live Demo
          </a>
        )}
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition duration-200 text-sm font-medium shadow-sm hover:shadow-md"
          >
            <Github className="mr-2" size={16} /> GitHub
          </a>
        )}
        <button
          onClick={() => onEdit(project)}
          className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200 text-sm font-medium shadow-sm hover:shadow-md"
        >
          <Edit className="mr-2" size={16} /> Edit
        </button>
        <button
          onClick={() => onDelete(_id)}
          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 text-sm font-medium shadow-sm hover:shadow-md"
        >
          <Trash2 className="mr-2" size={16} /> Delete
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
