// client/src/components/PublicPortfolioSettings.js
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Share2, Link, Copy, RefreshCw, Palette, Eye, EyeOff, User, ListOrdered } from 'lucide-react'; // Added Eye, EyeOff, User, ListOrdered icons

const PublicPortfolioSettings = () => {
  const { token, user, setUser } = useAuth();
  const { addNotification } = useNotification();
  const [isPublic, setIsPublic] = useState(false);
  const [publicId, setPublicId] = useState('');
  const [portfolioTheme, setPortfolioTheme] = useState('default');
  const [loading, setLoading] = useState(false);

  // --- New states for advanced settings ---
  const [showCertificates, setShowCertificates] = useState(true);
  const [showSkills, setShowSkills] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [aboutMe, setAboutMe] = useState('');
  const [sectionOrder, setSectionOrder] = useState(['certificates', 'skills', 'projects']);
  const availableSections = ['certificates', 'skills', 'projects']; // Define available sections

  useEffect(() => {
    if (user) {
      setIsPublic(user.isPublicPortfolioEnabled);
      setPublicId(user.publicPortfolioId || '');
      setPortfolioTheme(user.portfolioTheme || 'default');
      // Initialize advanced settings from user data
      setShowCertificates(user.portfolioSettings?.showCertificates ?? true);
      setShowSkills(user.portfolioSettings?.showSkills ?? true);
      setShowProjects(user.portfolioSettings?.showProjects ?? true);
      setAboutMe(user.portfolioSettings?.aboutMe || '');
      setSectionOrder(user.portfolioSettings?.sectionOrder || ['certificates', 'skills', 'projects']);
    }
  }, [user]);

  const updatePublicPortfolioSettings = useCallback(async (settingsToUpdate) => {
    setLoading(true);

    try {
      const res = await fetch('/api/public-portfolio/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(settingsToUpdate)
      });

      const resData = await res.json();

      if (!res.ok) {
        addNotification(resData.msg || 'Failed to update public portfolio settings.', 'error');
      } else {
        setIsPublic(resData.isPublicPortfolioEnabled);
        setPublicId(resData.publicPortfolioId || '');
        setPortfolioTheme(resData.portfolioTheme || 'default');
        // Update advanced settings states
        setShowCertificates(resData.portfolioSettings?.showCertificates ?? true);
        setShowSkills(resData.portfolioSettings?.showSkills ?? true);
        setShowProjects(resData.portfolioSettings?.showProjects ?? true);
        setAboutMe(resData.portfolioSettings?.aboutMe || '');
        setSectionOrder(resData.portfolioSettings?.sectionOrder || ['certificates', 'skills', 'projects']);

        addNotification(resData.msg, 'success');
        setUser({
          ...user,
          isPublicPortfolioEnabled: resData.isPublicPortfolioEnabled,
          publicPortfolioId: resData.publicPortfolioId,
          portfolioTheme: resData.portfolioTheme,
          portfolioSettings: resData.portfolioSettings // Update advanced settings in global state
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
    updatePublicPortfolioSettings({ isPublicPortfolioEnabled: !isPublic, portfolioTheme, portfolioSettings: { showCertificates, showSkills, showProjects, aboutMe, sectionOrder } });
  };

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setPortfolioTheme(newTheme); // Update local state immediately
    updatePublicPortfolioSettings({ isPublicPortfolioEnabled: isPublic, portfolioTheme: newTheme, portfolioSettings: { showCertificates, showSkills, showProjects, aboutMe, sectionOrder } });
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
    updatePublicPortfolioSettings({ isPublicPortfolioEnabled: isPublic, portfolioTheme, portfolioSettings: updatedSettings });
  };

  const handleAboutMeChange = (e) => {
    const newAboutMe = e.target.value;
    setAboutMe(newAboutMe);
    updatePublicPortfolioSettings({ isPublicPortfolioEnabled: isPublic, portfolioTheme, portfolioSettings: { showCertificates, showSkills, showProjects, aboutMe: newAboutMe, sectionOrder } });
  };

  const handleSectionOrderChange = (e, index) => {
    const newOrder = [...sectionOrder];
    newOrder[index] = e.target.value;
    // Ensure no duplicates and all available sections are present after change
    const uniqueNewOrder = Array.from(new Set(newOrder.filter(Boolean).concat(availableSections))).filter(s => newOrder.includes(s) || availableSections.includes(s));

    setSectionOrder(uniqueNewOrder);
    updatePublicPortfolioSettings({ isPublicPortfolioEnabled: isPublic, portfolioTheme, portfolioSettings: { showCertificates, showSkills, showProjects, aboutMe, sectionOrder: uniqueNewOrder } });
  };


  const handleCopy = () => {
    if (publicId) {
      const publicLink = `${window.location.origin}/portfolio/${publicId}`;
      const textArea = document.createElement('textarea');
      textArea.value = publicLink;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        addNotification('Link copied to clipboard!', 'info');
      } catch (err) {
        console.error('Failed to copy text:', err);
        addNotification('Failed to copy link.', 'error');
      }
      document.body.removeChild(textArea);
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

      {/* --- New Advanced Settings Section --- */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <ListOrdered className="mr-2 text-blue-600" size={20} /> Advanced Display Settings
        </h3>

        {/* About Me Textarea */}
        <div className="mb-6">
          <label htmlFor="aboutMe" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <User className="mr-2" size={16} /> About Me Text (Public Profile)
          </label>
          <textarea
            id="aboutMe"
            name="aboutMe"
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)} // Local state update
            onBlur={handleAboutMeChange} // Save to backend on blur
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            placeholder="Write a brief introduction about yourself for your public portfolio."
            disabled={loading}
          ></textarea>
        </div>

        {/* Section Visibility Toggles */}
        <div className="mb-6 space-y-3">
          <p className="text-sm font-medium text-gray-700 flex items-center mb-2">
            <Eye className="mr-2" size={16} /> Show Sections:
          </p>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <label htmlFor="showCertificates" className="text-sm font-medium text-gray-700">Certificates</label>
            <label htmlFor="showCertificates" className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  id="showCertificates"
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
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <label htmlFor="showSkills" className="text-sm font-medium text-gray-700">Skills</label>
            <label htmlFor="showSkills" className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  id="showSkills"
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
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <label htmlFor="showProjects" className="text-sm font-medium text-gray-700">Projects</label>
            <label htmlFor="showProjects" className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  id="showProjects"
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

        {/* Section Order */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 flex items-center mb-2">
            <ListOrdered className="mr-2" size={16} /> Section Order:
          </p>
          <div className="space-y-2">
            {sectionOrder.map((section, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-gray-600 font-semibold">{index + 1}.</span>
                <select
                  value={section}
                  onChange={(e) => handleSectionOrderChange(e, index)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled={loading}
                >
                  {availableSections.map(opt => (
                    <option key={opt} value={opt} disabled={sectionOrder.filter((s, i) => i !== index).includes(opt)}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">Select the order in which sections appear. Each section can only be used once.</p>
        </div>

      </div>
      {/* --- End New Advanced Settings Section --- */}

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
          <p className="text-xs text-gray-500 mt-2">Share this link with recruiters or on your social media!</p>
        </div>
      ) : (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start text-yellow-800">
            <p className="text-sm">Your public portfolio is currently disabled. Toggle the switch above to enable it and generate your unique link.</p>
        </div>
      )}
    </div>
  );
};

export default PublicPortfolioSettings;
