import React from 'react';
import {
  FileText,
  Calendar,
  Award,
  Link,
  Info,
  Download,
  Trash2,
  Edit,
  Globe,
  Tag
} from 'lucide-react';

const CertificateCard = ({ certificate, onDelete, onEdit }) => {
  const {
    title,
    issuer,
    issueDate,
    credentialId,
    credentialUrl,
    description,
    fileUrl,
    category,
    _id,
    isPublic
  } = certificate;

  const formattedDate = issueDate
    ? new Date(issueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';

  const handleDownload = () => {
    window.open(fileUrl, '_blank');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 ease-in-out">
      {/* Title + Badges */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900 leading-tight">{title}</h3>
        <div className="flex items-center space-x-2">
          {isPublic && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Globe className="mr-1" size={12} /> Public
            </span>
          )}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            <Tag className="mr-1" size={12} /> {category}
          </span>
        </div>
      </div>

      {/* 🔥 Inline Preview */}
      <div className="mb-4">
        {fileUrl && (
          <>
            {fileUrl.endsWith('.pdf') ? (
              <iframe
                src={fileUrl}
                title="Certificate Preview"
                className="w-full h-64 rounded-lg border border-gray-300"
              />
            ) : (
              <img
                src={fileUrl}
                alt={`${title} certificate`}
                className="w-full h-64 object-contain rounded-lg border border-gray-300"
              />
            )}
          </>
        )}
      </div>

      {/* Certificate Info */}
      <div className="space-y-3 text-gray-700 text-sm mb-6">
        {issuer && (
          <p className="flex items-center">
            <Award className="mr-2 text-indigo-500" size={16} />
            <span className="font-semibold">Issuer:</span> {issuer}
          </p>
        )}
        {issueDate && (
          <p className="flex items-center">
            <Calendar className="mr-2 text-indigo-500" size={16} />
            <span className="font-semibold">Issued On:</span> {formattedDate}
          </p>
        )}
        {credentialId && (
          <p className="flex items-center">
            <Info className="mr-2 text-indigo-500" size={16} />
            <span className="font-semibold">Credential ID:</span> {credentialId}
          </p>
        )}
        {credentialUrl && (
          <a
            href={credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-indigo-600 hover:underline hover:text-indigo-800 transition-colors duration-200"
          >
            <Link className="mr-2" size={16} />
            <span className="font-semibold">Verify Credential</span>
          </a>
        )}
        {description && (
          <p className="flex items-start">
            <FileText className="mr-2 mt-1 text-indigo-500" size={16} />
            <span className="font-semibold">Description:</span> {description}
          </p>
        )}
      </div>

      {/* 🔧 Fixed Button Alignment with Grid */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 text-sm font-medium shadow-sm hover:shadow-md"
        >
          <Download className="mr-2" size={16} /> Download
        </button>
        <button
          onClick={() => onEdit(certificate)}
          className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200 text-sm font-medium shadow-sm hover:shadow-md"
        >
          <Edit className="mr-2" size={16} /> Edit
        </button>
        <button
          onClick={() => onDelete(_id)}
          className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 text-sm font-medium shadow-sm hover:shadow-md"
        >
          <Trash2 className="mr-2" size={16} /> Delete
        </button>
      </div>
    </div>
  );
};

export default CertificateCard;
