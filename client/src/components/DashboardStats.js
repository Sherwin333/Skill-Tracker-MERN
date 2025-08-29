    // client/src/components/DashboardStats.js
    import React, { useState, useEffect } from 'react';
    import { useAuth } from '../context/AuthContext';
    import { RefreshCw, Award, Code, CheckCircle, Lightbulb } from 'lucide-react'; // Icons

    const DashboardStats = () => {
      const { token } = useAuth();
      const [stats, setStats] = useState({
        totalCertificates: 0,
        totalSkills: 0,
        mostFrequentSkillCategory: 'N/A',
        mostFrequentCertCategory: 'N/A',
        loading: true,
        error: null
      });

      useEffect(() => {
        const fetchStats = async () => {
          if (!token) {
            setStats(prev => ({ ...prev, loading: false, error: 'No authentication token found.' }));
            return;
          }

          setStats(prev => ({ ...prev, loading: true, error: null }));

          try {
            // Fetch Certificates
            const certRes = await fetch('/api/certificates', {
              headers: { 'x-auth-token': token }
            });
            const certData = await certRes.json();
            let totalCertificates = 0;
            let certCategories = {};
            if (certRes.ok) {
              totalCertificates = certData.length;
              certData.forEach(cert => {
                certCategories[cert.category] = (certCategories[cert.category] || 0) + 1;
              });
            } else {
              throw new Error(certData.msg || 'Failed to fetch certificates for dashboard.');
            }

            // Fetch Skills
            const skillRes = await fetch('/api/skills', {
              headers: { 'x-auth-token': token }
            });
            const skillData = await skillRes.json();
            let totalSkills = 0;
            let skillCategories = {};
            if (skillRes.ok) {
              totalSkills = skillData.length;
              skillData.forEach(skill => {
                skillCategories[skill.category] = (skillCategories[skill.category] || 0) + 1;
              });
            } else {
              throw new Error(skillData.msg || 'Failed to fetch skills for dashboard.');
            }

            // Determine most frequent categories
            const getMostFrequent = (obj) => {
              if (Object.keys(obj).length === 0) return 'N/A';
              return Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b);
            };

            setStats({
              totalCertificates,
              totalSkills,
              mostFrequentCertCategory: getMostFrequent(certCategories),
              mostFrequentSkillCategory: getMostFrequent(skillCategories),
              loading: false,
              error: null
            });

          } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setStats(prev => ({ ...prev, loading: false, error: err.message || 'Failed to load stats.' }));
          }
        };

        fetchStats();
      }, [token]);

      if (stats.loading) {
        return (
          <div className="flex items-center justify-center p-4 bg-white rounded-xl shadow-md">
            <RefreshCw className="animate-spin text-blue-500 mr-3" size={20} />
            <p className="text-gray-700 text-sm">Loading stats...</p>
          </div>
        );
      }

      if (stats.error) {
        return (
          <div className="p-4 bg-red-100 text-red-700 rounded-xl shadow-md text-center text-sm">
            Error: {stats.error}
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {/* Total Certificates Card */}
          <div className="bg-white p-5 rounded-xl shadow-md flex items-center justify-between border border-blue-100 transform hover:scale-105 transition-transform duration-200">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Certificates</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCertificates}</p>
            </div>
            <Award className="text-blue-500" size={36} />
          </div>

          {/* Total Skills Card */}
          <div className="bg-white p-5 rounded-xl shadow-md flex items-center justify-between border border-green-100 transform hover:scale-105 transition-transform duration-200">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Skills</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSkills}</p>
            </div>
            <Code className="text-green-500" size={36} />
          </div>

          {/* Most Frequent Certificate Category */}
          <div className="bg-white p-5 rounded-xl shadow-md flex items-center justify-between border border-indigo-100 transform hover:scale-105 transition-transform duration-200">
            <div>
              <p className="text-sm font-medium text-gray-500">Top Cert Category</p>
              <p className="text-lg font-semibold text-gray-900 truncate">{stats.mostFrequentCertCategory}</p>
            </div>
            <CheckCircle className="text-indigo-500" size={36} />
          </div>

          {/* Most Frequent Skill Category */}
          <div className="bg-white p-5 rounded-xl shadow-md flex items-center justify-between border border-purple-100 transform hover:scale-105 transition-transform duration-200">
            <div>
              <p className="text-sm font-medium text-gray-500">Top Skill Category</p>
              <p className="text-lg font-semibold text-gray-900 truncate">{stats.mostFrequentSkillCategory}</p>
            </div>
            <Lightbulb className="text-purple-500" size={36} />
          </div>
        </div>
      );
    };

    export default DashboardStats;
    