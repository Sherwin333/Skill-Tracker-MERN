// client/src/components/SkillCard.js
import React from 'react';
import { Tag, TrendingUp, Info, Edit, Trash2, Globe } from 'lucide-react'; // Added Globe icon

const getLevelColor = (level) => {
  switch (level) {
    case 'Beginner':
      return 'bg-gray-200 text-gray-800';
    case 'Intermediate':
      return 'bg-yellow-200 text-yellow-800';
    case 'Advanced':
      return 'bg-blue-200 text-blue-800';
    case 'Expert':
      return 'bg-green-200 text-green-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

const getLevelWidth = (level) => {
  switch (level) {
    case 'Beginner':
      return 'w-1/4';
    case 'Intermediate':
      return 'w-2/4';
    case 'Advanced':
      return 'w-3/4';
    case 'Expert':
      return 'w-full';
    default:
      return 'w-0';
  }
};

const SkillCard = ({ skill, onDelete, onEdit }) => {
  const { _id, name, category, level, description, lastUpdated, isPublic } = skill; // Destructure isPublic

  const formattedDate = lastUpdated ? new Date(lastUpdated).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : 'N/A';

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 ease-in-out">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900 leading-tight capitalize">{name}</h3>
        <div className="flex items-center space-x-2">
          {isPublic && ( // Show Globe icon if public
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Globe className="mr-1" size={12} /> Public
            </span>
          )}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Tag className="mr-1" size={12} /> {category}
          </span>
        </div>
      </div>

      <div className="space-y-3 text-gray-700 text-sm mb-6">
        <p className="flex items-center">
          <TrendingUp className="mr-2 text-blue-500" size={16} />
          <span className="font-semibold">Level:</span> {level}
        </p>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div className={`h-2.5 rounded-full ${getLevelColor(level).split(' ')[0].replace('bg-', 'bg-')}-500 ${getLevelWidth(level)} transition-all duration-500 ease-in-out`}></div>
        </div>
        {description && (
          <p className="flex items-start">
            <Info className="mr-2 mt-1 text-blue-500" size={16} />
            <span className="font-semibold">Description:</span> {description}
          </p>
        )}
        <p className="text-xs text-gray-500">Last Updated: {formattedDate}</p>
      </div>

      <div className="flex justify-end space-x-3 mt-4">
        <button
          onClick={() => onEdit(skill)}
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

export default SkillCard;
