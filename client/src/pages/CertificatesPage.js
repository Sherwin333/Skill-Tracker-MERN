    // client/src/pages/CertificatesPage.js
    import React, { useState } from 'react';
    import CertificateForm from '../components/CertificateForm';
    import CertificateList from '../components/CertificateList';
    import Navbar from '../components/Navbar'; // We'll create this next

    function CertificatesPage() {
      // State to trigger a refresh of the certificate list after a new upload
      const [refreshListTrigger, setRefreshListTrigger] = useState(0);

      const handleUploadSuccess = () => {
        setRefreshListTrigger(prev => prev + 1); // Increment to trigger useEffect in CertificateList
      };

      return (
        <div className="min-h-screen bg-gray-100">
          <Navbar /> {/* Navigation bar */}
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
              Manage Your Certificates
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <CertificateForm onUploadSuccess={handleUploadSuccess} />
              </div>
              <div className="lg:col-span-2">
                <CertificateList refreshTrigger={refreshListTrigger} />
              </div>
            </div>
          </div>
        </div>
      );
    }

    export default CertificatesPage;
    