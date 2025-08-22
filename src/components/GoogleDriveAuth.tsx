import { useSyncContext } from '@/contexts/SyncContext';
import { AlertCircle, CheckCircle, Cloud, CloudOff, Download, Info, RefreshCw, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getGoogleDriveService, useGoogleAuth } from '../hooks/useGoogleAuth';
import { ConfirmationModal } from './ConfirmationModal';
import { Button } from './ui/button';
import { Switch } from './ui/switch';

// Info Modal Component
const InfoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('sync.howSyncWorks')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <strong className="text-gray-900">{t('sync.sessionBasedAuth')}:</strong> {t('sync.sessionBasedAuthDesc')}
          </div>
          <div>
            <strong className="text-gray-900">{t('sync.syncNow')}:</strong> {t('sync.syncNowDesc')}
          </div>
          <div>
            <strong className="text-gray-900">{t('sync.forceUpload')}:</strong> {t('sync.forceUploadDesc')}
          </div>
          <div>
            <strong className="text-gray-900">{t('sync.forceDownload')}:</strong> {t('sync.forceDownloadDesc')}
          </div>
          <div>
            <strong className="text-gray-900">{t('sync.forceReupload')}:</strong> {t('sync.forceReuploadDesc')}
          </div>
          <div>
            <strong className="text-gray-900">{t('sync.autoSync')}:</strong> {t('sync.autoSyncDesc')}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} size="sm">
            {t('common.dismiss')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const GoogleDriveAuth = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, error, user, login, logout, clearError } = useGoogleAuth();

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
      return t('sync.syncing');
    }

    if (syncError) {
      return t('sync.syncFailed');
    }

    if (hasLocalChanges) {
      return t('sync.localChangesPending');
    }

    if (lastSyncTime) {
      const timeDiff = Date.now() - lastSyncTime.getTime();
      const minutes = Math.floor(timeDiff / 60000);
      if (minutes < 1) {
        return t('sync.justSynced');
      } else if (minutes < 60) {
        return t('sync.syncedAgo', { time: `${minutes}m` });
      } else {
        return t('sync.syncedAgo', { time: `${Math.floor(minutes / 60)}h` });
      }
    }

    return t('sync.neverSynced');
  };

  // Helper function to format countdown
  const formatCountdown = (seconds: number) => {
    if (seconds <= 0) return t('sync.syncingSoon');

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins > 0) {
      return t('sync.nextSyncIn', { time: `${mins}m ${secs}s` });
    } else {
      return t('sync.nextSyncIn', { time: `${secs}s` });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm">{t('sync.checkingAuth')}</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <CloudOff className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">{t('sync.notConnected')}</span>
        </div>

        <Button onClick={handleLogin} disabled={isLoading} className="w-full flex items-center justify-center gap-2">
          <Cloud className="h-4 w-4" />
          {t('sync.connectToGoogleDrive')}
        </Button>

        {error && (
          <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
              <button onClick={clearError} className="text-red-600 hover:text-red-800 text-sm mt-1">
                {t('common.dismiss')}
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
              <span className="text-sm text-green-600 font-medium">{t('sync.connected')}</span>
              {user?.email && (
                <span className="text-xs text-gray-600">{user.name ? `${user.name} (${user.email})` : user.email}</span>
              )}
              {(() => {
                const service = getGoogleDriveService();
                const hasRefreshToken = service.hasRefreshToken();
                const tokenInfo = service.getTokenExpirationInfo();

                if (hasRefreshToken) {
                  return <span className="text-xs text-green-500">✓ {t('sync.persistentConnection')}</span>;
                } else if (tokenInfo) {
                  const expiresIn = Math.max(0, tokenInfo.expires_at - Date.now());
                  const hoursLeft = Math.floor(expiresIn / (1000 * 60 * 60));
                  const minutesLeft = Math.floor((expiresIn % (1000 * 60 * 60)) / (1000 * 60));

                  if (expiresIn > 0) {
                    return (
                      <span className="text-xs text-orange-500">
                        ⚠ {t('sync.sessionExpiresIn')} {hoursLeft > 0 ? `${hoursLeft}h ` : ''}
                        {minutesLeft}m
                      </span>
                    );
                  } else {
                    return <span className="text-xs text-red-500">⚠ {t('sync.sessionExpired')}</span>;
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
              title={t('sync.howSyncWorksTooltip')}
            >
              <Info className="h-4 w-4" />
            </button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              {t('sync.disconnect')}
            </Button>
          </div>
        </div>

        {/* Sync Status */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{t('sync.syncStatus')}</span>
            <div className="flex items-center space-x-2">
              {isSyncing && <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">{t('sync.autoSync')}</span>
                <Switch checked={autoSyncEnabled} onCheckedChange={() => toggleAutoSync()} disabled={isSyncing} />
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
              <span className="text-xs text-orange-600">{t('sync.localChangesNotSynced')}</span>
            </div>
          )}
        </div>

        {/* Sync Controls */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => setShowSyncModal(true)}
            disabled={isSyncing}
            size="sm"
            className="col-span-2 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {t('sync.syncNow')}
          </Button>

          <Button
            onClick={() => setShowUploadModal(true)}
            disabled={isSyncing || !tripData}
            size="sm"
            variant="outline"
            className="flex items-center justify-center gap-1"
          >
            <Upload className="h-4 w-4" />
            {t('sync.forceUpload')}
          </Button>

          <Button
            onClick={() => setShowDownloadModal(true)}
            disabled={isSyncing}
            size="sm"
            variant="outline"
            className="flex items-center justify-center gap-1"
          >
            <Download className="h-4 w-4" />
            {t('sync.forceDownload')}
          </Button>
        </div>

        {/* Additional Controls */}
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowReuploadModal(true)}
            disabled={isSyncing || !tripData}
            size="sm"
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t('sync.forceReupload')}
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
                className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm mt-1"
              >
                <X className="h-3 w-3" />
                {t('common.dismiss')}
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
        title={t('sync.syncConfirmation.title')}
        message={t('sync.syncConfirmation.message')}
        confirmText={t('sync.syncNow')}
      />

      <ConfirmationModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onConfirm={handleForceUpload}
        title={t('sync.uploadConfirmation.title')}
        message={t('sync.uploadConfirmation.message')}
        confirmText={t('sync.forceUpload')}
      />

      <ConfirmationModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onConfirm={handleForceDownload}
        title={t('sync.downloadConfirmation.title')}
        message={t('sync.downloadConfirmation.message')}
        confirmText={t('sync.forceDownload')}
        isDestructive={true}
      />

      <ConfirmationModal
        isOpen={showReuploadModal}
        onClose={() => setShowReuploadModal(false)}
        onConfirm={handleForceReupload}
        title={t('sync.reuploadConfirmation.title')}
        message={t('sync.reuploadConfirmation.message')}
        confirmText={t('sync.forceReupload')}
        isDestructive={true}
      />

      {/* Info Modal */}
      <InfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
    </>
  );
};
