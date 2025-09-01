// client/src/components/PublicPortfolioSettings.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Share2, Link, Copy, Palette, Eye } from 'lucide-react';

const PublicPortfolioSettings = () => {
  const { token, user, setUser } = useAuth();
  const { addNotification } = useNotification();
  const [isPublic, setIsPublic] = useState(false);
  const [publicId, setPublicId] = useState('');
  const [portfolioTheme, setPortfolioTheme] = useState('default');
  const [loading, setLoading] = useState(false);

  // --- States for section visibility ---
  const [showCertificates, setShowCertificates] = useState(true);
  const [showSkills, setShowSkills] = useState(true);
  const [showProjects, setShowProjects] = useState(true);

  useEffect(() => {
    if (user) {
      setIsPublic(user.isPublicPortfolioEnabled);
      setPublicId(user.publicPortfolioId || '');
      setPortfolioTheme(user.portfolioTheme || 'default');
      setShowCertificates(user.portfolioSettings?.showCertificates ?? true);
      setShowSkills(user.portfolioSettings?.showSkills ?? true);
      setShowProjects(user.portfolioSettings?.showProjects ?? true);
    }
  }, [user]);

  const updatePublicPortfolioSettings = useCallback(async (settingsToUpdate) => {
    setLoading(true);

    try {
      const res = await fetch('/api/public-portfolio/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(settingsToUpdate),
      });

      const resData = await res.json();

      if (!res.ok) {
        addNotification(resData.msg || 'Failed to update public portfolio settings.', 'error');
      } else {
        setIsPublic(resData.isPublicPortfolioEnabled);
        setPublicId(resData.publicPortfolioId || '');
        setPortfolioTheme(resData.portfolioTheme || 'default');
        setShowCertificates(resData.portfolioSettings?.showCertificates ?? true);
        setShowSkills(resData.portfolioSettings?.showSkills ?? true);
        setShowProjects(resData.portfolioSettings?.showProjects ?? true);

        addNotification(resData.msg, 'success');
        setUser({
          ...user,
          isPublicPortfolioEnabled: resData.isPublicPortfolioEnabled,
          publicPortfolioId: resData.publicPortfolioId,
          portfolioTheme: resData.portfolioTheme,
          portfolioSettings: resData.portfolioSettings,
        });
      }
    } catch (err) {
      console.error('Error updating public portfolio settings:', err);
      addNotification('Server error during update.', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, user, setUser, addNotification]);

  const handleTogglePublic = () => {
    updatePublicPortfolioSettings({
      isPublicPortfolioEnabled: !isPublic,
      portfolioTheme,
      portfolioSettings: { showCertificates, showSkills, showProjects },
    });
  };

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setPortfolioTheme(newTheme);
    updatePublicPortfolioSettings({
      isPublicPortfolioEnabled: isPublic,
      portfolioTheme: newTheme,
      portfolioSettings: { showCertificates, showSkills, showProjects },
    });
  };

  const handleSectionVisibilityChange = (sectionName) => {
    let updatedSettings = { ...user.portfolioSettings };
    switch (sectionName) {
      case 'certificates':
        updatedSettings.showCertificates = !showCertificates;
        setShowCertificates(!showCertificates);
        break;
      case 'skills':
        updatedSettings.showSkills = !showSkills;
        setShowSkills(!showSkills);
        break;
      case 'projects':
        updatedSettings.showProjects = !showProjects;
        setShowProjects(!showProjects);
        break;
      default:
        break;
    }
    updatePublicPortfolioSettings({
      isPublicPortfolioEnabled: isPublic,
      portfolioTheme,
      portfolioSettings: updatedSettings,
    });
  };

  const handleCopy = () => {
    if (publicId) {
      const publicLink = `${window.location.origin}/portfolio/${publicId}`;
      navigator.clipboard.writeText(publicLink)
        .then(() => addNotification('Link copied to clipboard!', 'info'))
        .catch(() => addNotification('Failed to copy link.', 'error'));
    }
  };

  const publicPortfolioUrl = publicId ? `${window.location.origin}/portfolio/${publicId}` : '';

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Share2 className="mr-2 text-green-600" size={24} /> Public Portfolio
      </h2>

      {/* Make Public Toggle */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <span className="text-lg font-medium text-gray-700">Make Portfolio Public:</span>
        <label htmlFor="togglePublic" className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              id="togglePublic"
              className="sr-only"
              checked={isPublic}
              onChange={handleTogglePublic}
              disabled={loading}
            />
            <div className="block bg-gray-300 w-14 h-8 rounded-full"></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${isPublic ? 'transform translate-x-full bg-green-500' : 'bg-gray-400'}`}></div>
          </div>
        </label>
      </div>

      {/* Theme Selector */}
      <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-lg">
        <label htmlFor="portfolioTheme" className="text-lg font-medium text-gray-700 flex items-center">
          <Palette className="mr-2 text-purple-600" size={20} /> Select Theme:
        </label>
        <select
          id="portfolioTheme"
          name="portfolioTheme"
          value={portfolioTheme}
          onChange={handleThemeChange}
          disabled={loading}
          className="w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 bg-white"
        >
          <option value="default">Default</option>
          <option value="modern">Modern</option>
          <option value="minimal">Minimal</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      {/* Section Visibility Toggles */}
      <div className="mb-6 space-y-3">
        <p className="text-sm font-medium text-gray-700 flex items-center mb-2">
          <Eye className="mr-2" size={16} /> Show Sections:
        </p>
        {/* Certificates Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Certificates</span>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={showCertificates}
                onChange={() => handleSectionVisibilityChange('certificates')}
                disabled={loading}
              />
              <div className="block bg-gray-300 w-14 h-8 rounded-full"></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${showCertificates ? 'transform translate-x-full bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
          </label>
        </div>

        {/* Skills Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Skills</span>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={showSkills}
                onChange={() => handleSectionVisibilityChange('skills')}
                disabled={loading}
              />
              <div className="block bg-gray-300 w-14 h-8 rounded-full"></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${showSkills ? 'transform translate-x-full bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
          </label>
        </div>

        {/* Projects Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Projects</span>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={showProjects}
                onChange={() => handleSectionVisibilityChange('projects')}
                disabled={loading}
              />
              <div className="block bg-gray-300 w-14 h-8 rounded-full"></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${showProjects ? 'transform translate-x-full bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
          </label>
        </div>
      </div>

      {/* Public Link */}
      {isPublic && publicId ? (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-700 text-sm font-medium mb-2 flex items-center">
            <Link className="mr-2" size={16} /> Your Public Portfolio Link:
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={publicPortfolioUrl}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 text-sm focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 text-sm font-medium shadow-sm"
            >
              <Copy className="mr-2" size={16} /> Copy
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Share this link with recruiters or on your social media!
          </p>
        </div>
      ) : (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start text-yellow-800">
          <p className="text-sm">
            Your public portfolio is currently disabled. Toggle the switch above to enable it and
            generate your unique link.
          </p>
        </div>
      )}
    </div>
  );
};

export default PublicPortfolioSettings;
