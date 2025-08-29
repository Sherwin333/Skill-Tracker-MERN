    // client/src/pages/SkillsPage.js
    import React, { useState } from 'react';
    import SkillForm from '../components/SkillForm';
    import SkillList from '../components/SkillList';
    import Navbar from '../components/Navbar';

    function SkillsPage() {
      // State to trigger a refresh of the skill list after a new addition
      const [refreshListTrigger, setRefreshListTrigger] = useState(0);

      const handleAddSuccess = () => {
        setRefreshListTrigger(prev => prev + 1); // Increment to trigger useEffect in SkillList
      };

      return (
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
              Manage Your Skills
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <SkillForm onAddSuccess={handleAddSuccess} />
              </div>
              <div className="lg:col-span-2">
                <SkillList refreshTrigger={refreshListTrigger} />
              </div>
            </div>
          </div>
        </div>
      );
    }

    export default SkillsPage;
    