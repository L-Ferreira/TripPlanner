import { AlertCircle, CheckCircle, Cloud, CloudOff, Download, RefreshCw, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useGoogleDriveSync } from '../hooks/useGoogleDriveSync';
import { useTripData } from '../hooks/useTripData';
import { ConfirmationModal } from './ConfirmationModal';
import { Button } from './ui/button';

export const GoogleDriveAuth = () => {
  const { isAuthenticated, isLoading, error, login, logout, clearError } = useGoogleAuth();
  const { tripData, setFullTripData } = useTripData();
  
  const {
    isSyncing,
    lastSyncTime,
    error: syncError,
    hasLocalChanges,
    hasRemoteChanges,
    syncNow,
    clearError: clearSyncError,
    forceUpload,
    forceDownload,
  } = useGoogleDriveSync(isAuthenticated, tripData, setFullTripData);

  // Modal states
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showReuploadModal, setShowReuploadModal] = useState(false);

  const handleLogin = () => {
    clearError();
    login();
  };

  const handleLogout = () => {
    logout();
  };



  const handleSync = async () => {
    clearSyncError();
    await syncNow();
  };

  const handleForceUpload = async () => {
    clearSyncError();
    await forceUpload();
  };

  const handleForceDownload = async () => {
    clearSyncError();
    await forceDownload();
  };

  const handleForceReupload = async () => {
    if (!isAuthenticated || !tripData) return;
    
    try {
      clearSyncError();
      const { getGoogleDriveService } = await import('../hooks/useGoogleAuth');
      const service = getGoogleDriveService();
      
      // Delete existing file if it exists
      const existingFile = await service.findTripPlannerFile();
      if (existingFile) {
        await service.deleteFile(existingFile.id);
      }
      
      // Create fresh file with current data
      await service.uploadFile('trip-planner-data.json', JSON.stringify(tripData, null, 2));
      
      // Update sync state
      const now = new Date();
      localStorage.setItem('lastSyncTime', now.toISOString());
    } catch (error) {
      // Error is already handled by the sync hooks
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm">Checking authentication...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <CloudOff className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">Not connected to Google Drive</span>
        </div>
        
        <Button 
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full"
        >
          <Cloud className="h-4 w-4 mr-2" />
          Connect to Google Drive
        </Button>

        {error && (
          <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800 text-sm mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Cloud className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-600 font-medium">Connected to Google Drive</span>
        </div>
        <Button 
          onClick={handleLogout}
          variant="outline"
          size="sm"
        >
          Disconnect
        </Button>
      </div>

      {/* Sync Status */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Sync Status</span>
          {isSyncing && <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />}
        </div>

        {lastSyncTime && (
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-xs text-gray-600">
              Last synced: {lastSyncTime.toLocaleString()}
            </span>
          </div>
        )}

        {hasLocalChanges && (
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span className="text-xs text-orange-600">Local changes not synced</span>
          </div>
        )}

        {hasRemoteChanges && (
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-blue-600">Remote changes available</span>
          </div>
        )}
      </div>

            {/* Sync Controls */}
      <div className="grid grid-cols-2 gap-2">
        <Button 
          onClick={() => setShowSyncModal(true)}
          disabled={isSyncing}
          size="sm"
          className="col-span-2"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          Sync Now
        </Button>

        <Button 
          onClick={() => setShowUploadModal(true)}
          disabled={isSyncing || !tripData}
          size="sm"
          variant="outline"
        >
          <Upload className="h-4 w-4 mr-1" />
          Upload
        </Button>

        <Button 
          onClick={() => setShowDownloadModal(true)}
          disabled={isSyncing}
          size="sm"
          variant="outline"
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </div>

      {/* Additional Controls */}
      <div className="flex space-x-2">
        <Button 
          onClick={() => setShowReuploadModal(true)}
          disabled={isSyncing || !tripData}
          size="sm"
          variant="outline"
          className="flex-1"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Force Re-upload
        </Button>
      </div>

      {/* Error Display */}
      {(error || syncError) && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error || syncError}</p>
            <button
              onClick={() => {
                clearError();
                clearSyncError();
              }}
              className="flex items-center text-red-600 hover:text-red-800 text-sm mt-1"
            >
              <X className="h-3 w-3 mr-1" />
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        onConfirm={handleSync}
        title="Sync Now"
        message="This will synchronize your trip data with Google Drive. Local and remote changes will be merged intelligently."
        confirmText="Sync Now"
      />

      <ConfirmationModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onConfirm={handleForceUpload}
        title="Upload to Google Drive"
        message="This will upload your current trip data to Google Drive, overwriting any existing file."
        confirmText="Upload"
      />

      <ConfirmationModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onConfirm={handleForceDownload}
        title="Download from Google Drive"
        message="This will download trip data from Google Drive, overwriting your current local data."
        confirmText="Download"
        isDestructive={true}
      />

      <ConfirmationModal
        isOpen={showReuploadModal}
        onClose={() => setShowReuploadModal(false)}
        onConfirm={handleForceReupload}
        title="Force Re-upload"
        message="This will delete the existing file in Google Drive and create a fresh copy with your current data. Use this if your file is corrupted or empty."
        confirmText="Re-upload"
        isDestructive={true}
      />
    </div>
  );
}; 