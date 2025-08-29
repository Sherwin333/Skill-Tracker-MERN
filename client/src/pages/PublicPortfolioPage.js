// client/src/pages/PublicPortfolioPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CertificateCard from '../components/CertificateCard';
import SkillCard from '../components/SkillCard';
import ProjectCard from '../components/ProjectCard';
import { RefreshCw, User, Mail, Award, Code, Folder, XCircle, Info, UserCircle, FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';

function PublicPortfolioPage() {
  const { publicPortfolioId } = useParams();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    const fetchPublicPortfolio = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/public-portfolio/${publicPortfolioId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.msg || 'Failed to load public portfolio.');
          setPortfolioData(null);
        } else {
          setPortfolioData(data);
        }
      } catch (err) {
        console.error('Error fetching public portfolio:', err);
        setError('Server error or network issue loading portfolio.');
        setPortfolioData(null);
      } finally {
        setLoading(false);
      }
    };

    if (publicPortfolioId) {
      fetchPublicPortfolio();
    }
  }, [publicPortfolioId]);

  // Helper function to get theme-specific classes
  const getThemeClasses = (themeName) => {
    switch (themeName) {
      case 'modern':
        return {
          bg: 'bg-gradient-to-br from-blue-500 to-indigo-700',
          cardBg: 'bg-white',
          cardShadow: 'shadow-xl',
          textColor: 'text-gray-900',
          secondaryText: 'text-gray-700',
          borderColor: 'border-blue-200',
          sectionTitle: 'text-indigo-700',
          iconColor: 'text-blue-600',
        };
      case 'minimal':
        return {
          bg: 'bg-gray-50',
          cardBg: 'bg-white',
          cardShadow: 'shadow-md',
          textColor: 'text-gray-800',
          secondaryText: 'text-gray-600',
          borderColor: 'border-gray-100',
          sectionTitle: 'text-gray-700',
          iconColor: 'text-gray-500',
        };
      case 'dark':
        return {
          bg: 'bg-gray-900',
          cardBg: 'bg-gray-800',
          cardShadow: 'shadow-lg',
          textColor: 'text-gray-100',
          secondaryText: 'text-gray-300',
          borderColor: 'border-gray-700',
          sectionTitle: 'text-indigo-400',
          iconColor: 'text-indigo-300',
        };
      case 'default':
      default:
        return {
          bg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
          cardBg: 'bg-white',
          cardShadow: 'shadow-2xl',
          textColor: 'text-gray-900',
          secondaryText: 'text-gray-600',
          borderColor: 'border-gray-200',
          sectionTitle: 'text-indigo-600',
          iconColor: 'text-indigo-600',
        };
    }
  };

  const handleGeneratePdf = () => {
    setIsGeneratingPdf(true);
    const element = document.getElementById('portfolio-content');
    const opt = {
      margin:       0.5,
      filename:     `${portfolioData.user.name.replace(/\s/g, '_')}_Portfolio.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, logging: true, dpi: 192, letterRendering: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().finally(() => {
      setIsGeneratingPdf(false);
    });
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
        <RefreshCw className="animate-spin text-indigo-500 mb-4" size={40} />
        <p className="text-xl text-gray-700">Loading portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-8 text-center">
        <XCircle className="text-red-600 mb-4" size={40} />
        <h1 className="text-3xl font-bold text-red-800 mb-2">Error Loading Portfolio</h1>
        <p className="text-lg text-red-700">{error}</p>
        <p className="text-md text-red-600 mt-4">This portfolio might not exist or is currently disabled.</p>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
        <Info className="text-gray-500 mb-4" size={40} />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Portfolio Not Found</h1>
        <p className="text-lg text-gray-600">Please check the URL or contact the owner.</p>
      </div>
    );
  }

  const { user: portfolioUser, certificates, skills, projects } = portfolioData;
  const theme = getThemeClasses(portfolioUser.portfolioTheme);
  const { portfolioSettings } = portfolioUser; // Get advanced settings


  // Map section names to their corresponding components and data
  const sectionComponents = {
    certificates: portfolioSettings.showCertificates && certificates.length > 0 && (
      <div className="mb-10">
        <h2 className={`text-3xl font-bold mb-6 flex items-center ${theme.sectionTitle}`}>
          <Award className={`mr-3 ${theme.iconColor}`} size={30} /> My Certificates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map(cert => (
            <CertificateCard key={cert._id} certificate={cert} onDelete={() => {}} onEdit={() => {}} />
          ))}
        </div>
      </div>
    ),
    skills: portfolioSettings.showSkills && skills.length > 0 && (
      <div className="mb-10">
        <h2 className={`text-3xl font-bold mb-6 flex items-center ${theme.sectionTitle}`}>
          <Code className={`mr-3 ${theme.iconColor}`} size={30} /> My Skills
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map(skill => (
            <SkillCard key={skill._id} skill={skill} onDelete={() => {}} onEdit={() => {}} />
          ))}
        </div>
      </div>
    ),
    projects: portfolioSettings.showProjects && projects.length > 0 && (
      <div className="mb-10">
        <h2 className={`text-3xl font-bold mb-6 flex items-center ${theme.sectionTitle}`}>
          <Folder className={`mr-3 ${theme.iconColor}`} size={30} /> My Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map(proj => (
            <ProjectCard key={proj._id} project={proj} onDelete={() => {}} onEdit={() => {}} />
          ))}
        </div>
      </div>
    ),
  };

  // Filter out null/false sections and order them
  const orderedSections = portfolioSettings.sectionOrder
    .map(sectionName => sectionComponents[sectionName])
    .filter(Boolean); // Filter out sections that are not enabled or have no data


  return (
    <div className={`min-h-screen ${theme.bg} p-6 md:p-12`}>
        {/* PDF Download Button - Outside the main content div so it's not part of the PDF */}
        <div className="flex justify-end mb-6">
            <button
                onClick={handleGeneratePdf}
                className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isGeneratingPdf}
            >
                {isGeneratingPdf ? (
                    <>
                        <RefreshCw className="animate-spin mr-2" size={20} /> Generating PDF...
                    </>
                ) : (
                    <>
                        <FileText className="mr-2" size={20} /> Download as PDF
                    </>
                )}
            </button>
        </div>

      <div id="portfolio-content" className={`container mx-auto ${theme.cardBg} rounded-xl ${theme.cardShadow} p-6 md:p-10 lg:p-12 max-w-5xl ${theme.textColor}`}>
        {/* User Info Section */}
        <div className={`text-center mb-10 pb-8 border-b-2 ${theme.borderColor}`}>
          {portfolioUser.avatarUrl ? (
            <img
              src={portfolioUser.avatarUrl}
              alt="Profile Avatar"
              className={`w-40 h-40 rounded-full object-cover mx-auto mb-4 shadow-lg border-4 ${theme.iconColor.replace('text-', 'border-')}-300`}
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/cccccc/333333?text=Avatar'; }}
            />
          ) : (
            <UserCircle className={`mx-auto ${theme.iconColor} mb-4`} size={100} />
          )}

          <h1 className="text-5xl font-extrabold mb-3">{portfolioUser.name}</h1>
          <p className={`text-xl ${theme.secondaryText} flex items-center justify-center`}>
            <Mail className={`mr-2 ${theme.secondaryText}`} size={20} /> {portfolioUser.email}
          </p>

          {/* About Me Section */}
          {portfolioSettings.aboutMe && (
            <div className={`mt-6 pt-4 border-t ${theme.borderColor} text-left`}>
              <h3 className={`text-2xl font-bold mb-3 ${theme.sectionTitle}`}>About Me</h3>
              <p className={`text-lg ${theme.secondaryText} whitespace-pre-wrap`}>{portfolioSettings.aboutMe}</p>
            </div>
          )}
        </div>

        {/* Dynamically rendered and ordered sections */}
        {orderedSections.length > 0 ? (
            orderedSections
        ) : (
            <div className={`text-center p-10 bg-gray-50 rounded-lg ${theme.secondaryText}`}>
                <Info className="mx-auto mb-4" size={40} />
                <p className="text-xl">No public content to display yet. The owner might be still building their portfolio or has chosen to hide all sections.</p>
            </div>
        )}

      </div>
    </div>
  );
}

export default PublicPortfolioPage;
