import { useSyncContext } from '@/contexts/SyncContext';
import { AlertCircle, CheckCircle, Cloud, CloudOff, Download, Info, RefreshCw, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getGoogleDriveService, useGoogleAuth } from '../hooks/useGoogleAuth';
import { ConfirmationModal } from './ConfirmationModal';
import { Button } from './ui/button';
import { Switch } from './ui/switch';

// Info Modal Component
const InfoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">How Sync Works</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <strong className="text-gray-900">Session-Based Authentication:</strong> Your Google Drive connection will
            stay active for about 1 hour. You&apos;ll need to reconnect when the session expires.
          </div>
          <div>
            <strong className="text-gray-900">Sync Now:</strong> Downloads remote data, merges with local changes, and
            uploads the result. Your work is preserved.
          </div>
          <div>
            <strong className="text-gray-900">Force Upload:</strong> Uploads your current data regardless of remote
            changes.
          </div>
          <div>
            <strong className="text-gray-900">Force Download:</strong> Downloads remote data and replaces your local
            data.
          </div>
          <div>
            <strong className="text-gray-900">Force Re-upload:</strong> Deletes the remote file and creates a fresh
            copy.
          </div>
          <div>
            <strong className="text-gray-900">Auto-sync:</strong> Runs every 5 minutes when enabled. Will stop working
            when your session expires (~1 hour).
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} size="sm">
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
};

export const GoogleDriveAuth = () => {
  const { isAuthenticated, isLoading, error, login, logout, clearError } = useGoogleAuth();

  const {
    tripData,
    hasLocalChanges,
    isSyncing,
    lastSyncTime,
    error: syncError,
    autoSyncEnabled,
    countdownSeconds,
    syncNow,
    forceUpload,
    forceDownload,
    forceReupload,
    clearError: clearSyncError,
    toggleAutoSync,
    setAuthenticated,
  } = useSyncContext();

  // Sync authentication state with context
  useEffect(() => {
    setAuthenticated(isAuthenticated);
  }, [isAuthenticated, setAuthenticated]);

  // Modal states
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showReuploadModal, setShowReuploadModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

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
    clearSyncError();
    await forceReupload();
  };

  // Helper function to get sync status message
  const getSyncStatusMessage = () => {
    if (isSyncing) {
      return 'Syncing...';
    }

    if (syncError) {
      return 'Sync failed';
    }

    if (hasLocalChanges) {
      return 'Local changes pending';
    }

    if (lastSyncTime) {
      const timeDiff = Date.now() - lastSyncTime.getTime();
      const minutes = Math.floor(timeDiff / 60000);
      if (minutes < 1) {
        return 'Just synced';
      } else if (minutes < 60) {
        return `Synced ${minutes}m ago`;
      } else {
        return `Synced ${Math.floor(minutes / 60)}h ago`;
      }
    }

    return 'Never synced';
  };

  // Helper function to format countdown
  const formatCountdown = (seconds: number) => {
    if (seconds <= 0) return 'Syncing soon...';

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins > 0) {
      return `Next sync in ${mins}m ${secs}s`;
    } else {
      return `Next sync in ${secs}s`;
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

        <Button onClick={handleLogin} disabled={isLoading} className="w-full">
          <Cloud className="h-4 w-4 mr-2" />
          Connect to Google Drive
        </Button>

        {error && (
          <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
              <button onClick={clearError} className="text-red-600 hover:text-red-800 text-sm mt-1">
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cloud className="h-5 w-5 text-green-600" />
            <div className="flex flex-col">
              <span className="text-sm text-green-600 font-medium">Connected to Google Drive</span>
              {(() => {
                const service = getGoogleDriveService();
                const hasRefreshToken = service.hasRefreshToken();
                const tokenInfo = service.getTokenExpirationInfo();

                if (hasRefreshToken) {
                  return <span className="text-xs text-green-500">✓ Persistent connection enabled</span>;
                } else if (tokenInfo) {
                  const expiresIn = Math.max(0, tokenInfo.expires_at - Date.now());
                  const hoursLeft = Math.floor(expiresIn / (1000 * 60 * 60));
                  const minutesLeft = Math.floor((expiresIn % (1000 * 60 * 60)) / (1000 * 60));

                  if (expiresIn > 0) {
                    return (
                      <span className="text-xs text-orange-500">
                        ⚠ Session expires in {hoursLeft > 0 ? `${hoursLeft}h ` : ''}
                        {minutesLeft}m
                      </span>
                    );
                  } else {
                    return <span className="text-xs text-red-500">⚠ Session expired, please reconnect</span>;
                  }
                }
                return null;
              })()}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowInfoModal(true)}
              className="p-1 rounded text-gray-500 hover:text-gray-700"
              title="How sync works"
            >
              <Info className="h-4 w-4" />
            </button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Disconnect
            </Button>
          </div>
        </div>

        {/* Sync Status */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Sync Status</span>
            <div className="flex items-center space-x-2">
              {isSyncing && <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">Auto-sync</span>
                <Switch
                  className="bg-blue-600"
                  checked={autoSyncEnabled}
                  onCheckedChange={() => toggleAutoSync()}
                  disabled={isSyncing}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {syncError ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : lastSyncTime ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-xs text-gray-600">{getSyncStatusMessage()}</span>
          </div>

          {/* Auto-sync status */}
          {autoSyncEnabled && countdownSeconds > 0 && (
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-600">{formatCountdown(countdownSeconds)}</span>
            </div>
          )}

          {hasLocalChanges && (
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-xs text-orange-600">Local changes not synced</span>
            </div>
          )}
        </div>

        {/* Sync Controls */}
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => setShowSyncModal(true)} disabled={isSyncing} size="sm" className="col-span-2">
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
            Force Upload
          </Button>

          <Button onClick={() => setShowDownloadModal(true)} disabled={isSyncing} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Force Download
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
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        onConfirm={handleSync}
        title="Sync Now"
        message="This will download data from Google Drive, merge it with your local changes, and upload the result. Your work will be preserved."
        confirmText="Sync Now"
      />

      <ConfirmationModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onConfirm={handleForceUpload}
        title="Force Upload"
        message="This will upload your current trip data to Google Drive, overwriting any existing remote data."
        confirmText="Force Upload"
      />

      <ConfirmationModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onConfirm={handleForceDownload}
        title="Force Download"
        message="This will download trip data from Google Drive and replace your current local data. Any unsaved local changes will be lost."
        confirmText="Force Download"
        isDestructive={true}
      />

      <ConfirmationModal
        isOpen={showReuploadModal}
        onClose={() => setShowReuploadModal(false)}
        onConfirm={handleForceReupload}
        title="Force Re-upload"
        message="This will delete the existing file in Google Drive and create a fresh copy with your current data. Use this if the remote file is corrupted."
        confirmText="Force Re-upload"
        isDestructive={true}
      />

      {/* Info Modal */}
      <InfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
    </>
  );
};
