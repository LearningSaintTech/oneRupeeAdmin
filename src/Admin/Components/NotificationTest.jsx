import React, { useState } from 'react';
import { testNotification } from '../Services/firebase';
import { runNotificationTests, checkNotificationSettings, testNotificationWithFocusStates, forceServiceWorkerUpdate } from '../Services/notificationTest';

const NotificationTest = () => {
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunTests = async () => {
    setIsLoading(true);
    try {
      const results = await runNotificationTests();
      setTestResults(results);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setIsLoading(true);
    try {
      const result = await testNotification();
      setTestResults({ testNotification: result });
    } catch (error) {
      console.error('Notification test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckSettings = async () => {
    setIsLoading(true);
    try {
      const settings = checkNotificationSettings();
      const focusStates = await testNotificationWithFocusStates();
      setTestResults({ settings, focusStates });
    } catch (error) {
      console.error('Settings check failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceUpdate = async () => {
    setIsLoading(true);
    try {
      const result = await forceServiceWorkerUpdate();
      if (result.success) {
        alert('Service worker updated successfully! Page will reload...');
      } else {
        alert('Failed to update service worker: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating service worker:', error);
      alert('Error updating service worker: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">🔔 Notification Test Panel</h2>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={handleRunTests}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Running Tests...' : '🧪 Run All Tests'}
          </button>
          
          <button
            onClick={handleTestNotification}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : '🔔 Test Notification'}
          </button>

          <button
            onClick={handleCheckSettings}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {isLoading ? 'Checking...' : '⚙️ Check Settings'}
          </button>

          <button
            onClick={handleForceUpdate}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : '🔄 Force Update SW'}
          </button>
        </div>

        {testResults && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold text-yellow-800 mb-2">🔍 Troubleshooting Tips:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Make sure notifications are enabled in your browser settings</li>
            <li>• Check that the service worker is registered (see console logs)</li>
            <li>• Ensure you're on HTTPS or localhost for service workers</li>
            <li>• Try refreshing the page if notifications don't work initially</li>
            <li>• Check browser console for detailed error messages</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Current Status:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <div>• Notification Permission: <span className="font-mono">{Notification.permission}</span></div>
            <div>• Service Worker Support: <span className="font-mono">{'serviceWorker' in navigator ? 'Yes' : 'No'}</span></div>
            <div>• Notification Support: <span className="font-mono">{'Notification' in window ? 'Yes' : 'No'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationTest;
