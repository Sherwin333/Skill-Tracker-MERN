import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { Share2, Copy, RefreshCw, Palette, Eye, User, ListOrdered, FileText, Calendar, Award, Info, Tag, Folder, Code, Github, ExternalLink, Link } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PublicPortfolioPage = () => {
  const { publicPortfolioId } = useParams();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('Minimal');

  const getThemeClasses = (themeName) => {
    switch (themeName) {
      case 'Modern':
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-900',
          cardBg: 'bg-white',
          cardBorder: 'border-gray-300',
          heading: 'text-indigo-600',
          subheading: 'text-indigo-500',
        };
      case 'Dark':
        return {
          bg: 'bg-gray-900',
          text: 'text-gray-100',
          cardBg: 'bg-gray-800',
          cardBorder: 'border-gray-700',
          heading: 'text-blue-400',
          subheading: 'text-blue-300',
        };
      case 'Minimal':
      default:
        return {
          bg: 'bg-white',
          text: 'text-gray-800',
          cardBg: 'bg-white',
          cardBorder: 'border-gray-200',
          heading: 'text-gray-900',
          subheading: 'text-gray-700',
        };
    }
  };

  const themeClasses = getThemeClasses(theme);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || '/api';
        const res = await fetch(`${API_URL}/public-portfolio/${publicPortfolioId}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.msg || 'Portfolio not found.');
          setLoading(false);
          return;
        }
        setPortfolioData(data);
        if (data.user.portfolioSettings?.portfolioTheme) {
          setTheme(data.user.portfolioSettings.portfolioTheme);
        }
        setLoading(false);
      } catch (err) {
        setError('Server error. Could not load portfolio.');
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [publicPortfolioId]);

  const generatePDF = async () => {
    const element = document.getElementById('portfolio-to-pdf');
    const avatarImg = document.getElementById('portfolio-avatar');
    
    // Check if avatar exists and wait for it to load
    if (avatarImg && !avatarImg.complete) {
      await new Promise(resolve => {
        avatarImg.onload = resolve;
        avatarImg.onerror = resolve; // Continue even if there's an error
      });
    }

    // Temporarily apply print-friendly styles
    const printStyles = `
      .hide-on-pdf {
        display: none !important;
      }
      .page-break {
        page-break-before: always;
      }
      .public-portfolio-container {
        padding: 20px;
        color: #333;
        background: #fff;
      }
      .public-portfolio-container h1, .public-portfolio-container h2 {
        color: #333;
      }
      .public-portfolio-container p, .public-portfolio-container li {
        color: #555;
      }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = printStyles;
    document.head.appendChild(styleSheet);
    
    // Create a temporary clone for PDF generation
    const printElement = element.cloneNode(true);
    const hideContainer = printElement.querySelector('.hide-on-pdf-container');
    if (hideContainer) {
      hideContainer.remove();
    }
    printElement.classList.add('public-portfolio-container');

    // Append to a temporary div to get correct dimensions for PDF
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(printElement);
    document.body.appendChild(tempDiv);
    
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${portfolioData.user.name.replace(/\s/g, '_')}_Portfolio.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    
    await html2pdf().from(printElement).set(opt).save();

    // Clean up temporary elements and styles
    tempDiv.remove();
    styleSheet.remove();
  };
  
  const renderSection = (title, items, renderComponent, icon) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 flex items-center ${themeClasses.heading}`}>
          {icon}
          <span className="ml-2">{title}</span>
        </h2>
        <div className="space-y-4">
          {items.map(renderComponent)}
        </div>
      </div>
    );
  };
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading portfolio...</div>;
  }
  
  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }
  
  const { user, certificates, skills, projects } = portfolioData;

  const sections = [
    { id: 'about', title: 'About Me', show: user.portfolioSettings?.showAbout, component: () => (
      <p className={`mt-2 text-md ${themeClasses.text}`}>{user.portfolioSettings?.aboutMe}</p>
    ) },
    { id: 'certificates', title: 'My Certificates', show: user.portfolioSettings?.showCertificates, items: certificates, component: (item) => (
      <div key={item._id} className={`${themeClasses.cardBg} p-4 rounded-lg shadow-md flex items-start space-x-4`}>
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
          <Award size={32} />
        </div>
        <div>
          <h3 className={`font-semibold text-lg ${themeClasses.subheading}`}>{item.title}</h3>
          <p className={`text-sm ${themeClasses.text}`}>{item.issuer}</p>
          <p className={`text-xs ${themeClasses.text}`}>Issued: {new Date(item.issueDate).toLocaleDateString()}</p>
          {item.description && <p className={`mt-2 text-sm ${themeClasses.text}`}>{item.description}</p>}
          {item.credentialUrl && (
            <a href={item.credentialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-indigo-500 hover:underline mt-2">
              <Link size={16} className="mr-1" /> Verify Credential
            </a>
          )}
        </div>
      </div>
    ), icon: <Award size={24} /> },
    { id: 'skills', title: 'My Skills', show: user.portfolioSettings?.showSkills, items: skills, component: (item) => (
      <div key={item._id} className={`${themeClasses.cardBg} p-4 rounded-lg shadow-md`}>
        <h3 className={`font-semibold text-lg ${themeClasses.subheading}`}>{item.name}</h3>
        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1 ${themeClasses.text}`}>{item.category}</span>
        <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
          <div
            className="h-full rounded-full bg-indigo-500"
            style={{
              width: `${(item.level === 'Beginner' ? 25 : item.level === 'Intermediate' ? 50 : item.level === 'Advanced' ? 75 : 100)}%`,
            }}
          ></div>
        </div>
        <p className={`text-xs mt-1 text-right ${themeClasses.text}`}>{item.level}</p>
        {item.description && <p className={`mt-2 text-sm ${themeClasses.text}`}>{item.description}</p>}
      </div>
    ), icon: <Code size={24} /> },
    { id: 'projects', title: 'My Projects', show: user.portfolioSettings?.showProjects, items: projects, component: (item) => (
      <div key={item._id} className={`${themeClasses.cardBg} p-4 rounded-lg shadow-md`}>
        <h3 className={`font-semibold text-lg ${themeClasses.subheading}`}>{item.title}</h3>
        {item.technologies.length > 0 && (
          <p className={`text-sm mt-1 ${themeClasses.text}`}>
            <span className="font-semibold">Technologies:</span> {item.technologies.join(', ')}
          </p>
        )}
        <p className={`mt-2 text-sm ${themeClasses.text}`}>{item.description}</p>
        <div className="flex space-x-4 mt-4">
          {item.projectUrl && (
            <a href={item.projectUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-semibold text-indigo-500 hover:underline">
              <ExternalLink size={16} className="mr-1" /> Live Demo
            </a>
          )}
          {item.githubUrl && (
            <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-semibold text-indigo-500 hover:underline">
              <Github size={16} className="mr-1" /> GitHub
            </a>
          )}
        </div>
      </div>
    ), icon: <Folder size={24} /> }
  ];

  const filteredSections = sections.filter(section => section.show);
  const orderedSections = user.portfolioSettings?.sectionOrder?.length > 0
    ? user.portfolioSettings.sectionOrder.map(id => filteredSections.find(s => s.id === id)).filter(Boolean)
    : filteredSections;

  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text}`}>
      <div id="portfolio-to-pdf" className="container mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
            {user.avatarUrl && (
              <img
                id="portfolio-avatar"
                src={user.avatarUrl}
                alt={`${user.name}'s Avatar`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <h1 className={`text-4xl font-bold mt-4 ${themeClasses.heading}`}>{user.name}</h1>
          <p className={`text-lg ${themeClasses.subheading}`}>{user.email}</p>
        </div>

        {/* PDF Download Button (Hidden in PDF) */}
        <div className="text-right mb-8 hide-on-pdf">
          <button onClick={generatePDF} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300">
            <Share2 className="inline-block mr-2" size={16} /> Download as PDF
          </button>
        </div>
        
        {/* Dynamic Sections */}
        {orderedSections.map(section => (
          <div key={section.id}>
            {section.id === 'about' && (
              <div className="mb-8">
                <h2 className={`text-2xl font-bold mb-4 flex items-center ${themeClasses.heading}`}>
                  <User size={24} className="mr-2" />
                  About Me
                </h2>
                {section.component()}
              </div>
            )}
            {section.id !== 'about' && renderSection(section.title, section.items, section.component, section.icon)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicPortfolioPage;
