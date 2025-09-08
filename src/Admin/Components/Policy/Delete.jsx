import React from 'react';

const DeleteAccount = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-yellow-500 mb-6">Delete Account</h1>
        <p className="text-gray-700 mb-4">
          At Learning Saint, we value your privacy and ensure that your personal data and learning history are handled with the highest responsibility. 
          This Delete Policy explains the steps and conditions for deleting user accounts, progress, and related information from our platform.
        </p>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-yellow-500 mb-2">1. User Account Deletion</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Verification: We may verify your identity to protect against unauthorized account deletion.</li>
            <li>Processing Time: Account deletion requests are processed within 7–10 business days.</li>
            <li>Data Deletion: Once deleted, all course progress, test results, and saved preferences will be permanently removed unless required by law.</li>
          </ul>
        </div>

        

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-yellow-500 mb-2">2. Data Retention Exceptions</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Legal Compliance: Certain information may be kept to meet legal or regulatory obligations.</li>
            
          </ul>
        </div>

       

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-yellow-500 mb-2">3. Third-Party Tools</h2>
          <p className="text-gray-700">
            If your learning data (like certifications or payment records) has been shared with third-party platforms, Learning Saint cannot remove those records directly. 
            Please contact the respective service provider for deletion requests.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-yellow-500 mb-2">4. Contact Information</h2>
          <p className="text-gray-700">
            For queries or to submit a deletion request, please reach out to us at:
          </p>
          <ul className="list-disc list-inside text-gray-700">
            <li>Learning Saint Support Team</li>
            <li>Email: info@learningsaint.com</li>
            <li>Phone: +91-9695913043</li>
            <li>Address: H70, 2nd Floor, Sector 63, NOIDA (201301)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;
