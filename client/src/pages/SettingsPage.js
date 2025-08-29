    // client/src/pages/SettingsPage.js
    import React from 'react';
    import Navbar from '../components/Navbar';
    import ProfileForm from '../components/ProfileForm';
    import PasswordForm from '../components/PasswordForm';
    import PublicPortfolioSettings from '../components/PublicPortfolioSettings';
    import AvatarUpload from '../components/AvatarUpload'; // Import new component
    import { Settings } from 'lucide-react';

    function SettingsPage() {
      return (
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center">
              <Settings className="mr-3 text-gray-700" size={36} /> Account Settings
            </h1>

            {/* Avatar Upload Section */}
            <div className="max-w-xl mx-auto mb-8">
                <AvatarUpload />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <ProfileForm />
              </div>
              <div>
                <PasswordForm />
              </div>
            </div>

            {/* Public Portfolio Settings Section */}
            <div className="max-w-xl mx-auto">
              <PublicPortfolioSettings />
            </div>

          </div>
        </div>
      );
    }

    export default SettingsPage;
    