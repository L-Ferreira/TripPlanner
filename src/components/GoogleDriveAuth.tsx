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
          <h3 className="text-lg font-semibold text-gray-900">Como Funciona a Sincronização</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <strong className="text-gray-900">Autenticação Baseada em Sessão:</strong> A sua ligação ao Google Drive
            permanecerá ativa durante cerca de 1 hora. Terá de se religar quando a sessão expirar.
          </div>
          <div>
            <strong className="text-gray-900">Sincronizar Agora:</strong> Transfere dados remotos, combina com
            alterações locais e carrega o resultado. O seu trabalho é preservado.
          </div>
          <div>
            <strong className="text-gray-900">Forçar Carregamento:</strong> Carrega os seus dados atuais
            independentemente das alterações remotas.
          </div>
          <div>
            <strong className="text-gray-900">Forçar Transferência:</strong> Transfere dados remotos e substitui os seus
            dados locais.
          </div>
          <div>
            <strong className="text-gray-900">Forçar Re-carregamento:</strong> Elimina o ficheiro remoto e cria uma
            cópia nova.
          </div>
          <div>
            <strong className="text-gray-900">Auto-sincronização:</strong> Executa a cada 5 minutos quando ativada.
            Deixará de funcionar quando a sua sessão expirar (~1 hora).
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} size="sm">
            Entendi
          </Button>
        </div>
      </div>
    </div>
  );
};

export const GoogleDriveAuth = () => {
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
      return 'A sincronizar...';
    }

    if (syncError) {
      return 'Sincronização falhada';
    }

    if (hasLocalChanges) {
      return 'Alterações locais pendentes';
    }

    if (lastSyncTime) {
      const timeDiff = Date.now() - lastSyncTime.getTime();
      const minutes = Math.floor(timeDiff / 60000);
      if (minutes < 1) {
        return 'Acabou de sincronizar';
      } else if (minutes < 60) {
        return `Sincronizado há ${minutes}m`;
      } else {
        return `Sincronizado há ${Math.floor(minutes / 60)}h`;
      }
    }

    return 'Nunca sincronizado';
  };

  // Helper function to format countdown
  const formatCountdown = (seconds: number) => {
    if (seconds <= 0) return 'A sincronizar em breve...';

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins > 0) {
      return `Próxima sincronização em ${mins}m ${secs}s`;
    } else {
      return `Próxima sincronização em ${secs}s`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm">A verificar autenticação...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <CloudOff className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">Não ligado ao Google Drive</span>
        </div>

        <Button onClick={handleLogin} disabled={isLoading} className="w-full flex items-center justify-center gap-2">
          <Cloud className="h-4 w-4" />
          Ligar ao Google Drive
        </Button>

        {error && (
          <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
              <button onClick={clearError} className="text-red-600 hover:text-red-800 text-sm mt-1">
                Dispensar
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
              <span className="text-sm text-green-600 font-medium">Ligado ao Google Drive</span>
              {user?.email && (
                <span className="text-xs text-gray-600">{user.name ? `${user.name} (${user.email})` : user.email}</span>
              )}
              {(() => {
                const service = getGoogleDriveService();
                const hasRefreshToken = service.hasRefreshToken();
                const tokenInfo = service.getTokenExpirationInfo();

                if (hasRefreshToken) {
                  return <span className="text-xs text-green-500">✓ Ligação persistente ativada</span>;
                } else if (tokenInfo) {
                  const expiresIn = Math.max(0, tokenInfo.expires_at - Date.now());
                  const hoursLeft = Math.floor(expiresIn / (1000 * 60 * 60));
                  const minutesLeft = Math.floor((expiresIn % (1000 * 60 * 60)) / (1000 * 60));

                  if (expiresIn > 0) {
                    return (
                      <span className="text-xs text-orange-500">
                        ⚠ Sessão expira em {hoursLeft > 0 ? `${hoursLeft}h ` : ''}
                        {minutesLeft}m
                      </span>
                    );
                  } else {
                    return <span className="text-xs text-red-500">⚠ Sessão expirada, por favor religar</span>;
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
              title="Como funciona a sincronização"
            >
              <Info className="h-4 w-4" />
            </button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Desligar
            </Button>
          </div>
        </div>

        {/* Sync Status */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Estado da Sincronização</span>
            <div className="flex items-center space-x-2">
              {isSyncing && <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">Auto-sincronização</span>
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
              <span className="text-xs text-orange-600">Alterações locais não sincronizadas</span>
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
            Sincronizar Agora
          </Button>

          <Button
            onClick={() => setShowUploadModal(true)}
            disabled={isSyncing || !tripData}
            size="sm"
            variant="outline"
            className="flex items-center justify-center gap-1"
          >
            <Upload className="h-4 w-4" />
            Forçar Carregamento
          </Button>

          <Button
            onClick={() => setShowDownloadModal(true)}
            disabled={isSyncing}
            size="sm"
            variant="outline"
            className="flex items-center justify-center gap-1"
          >
            <Download className="h-4 w-4" />
            Forçar Transferência
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
            Forçar Re-carregamento
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
                Dispensar
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
        title="Sincronizar Agora"
        message="Isto irá transferir dados do Google Drive, combiná-los com as suas alterações locais e carregar o resultado. O seu trabalho será preservado."
        confirmText="Sincronizar Agora"
      />

      <ConfirmationModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onConfirm={handleForceUpload}
        title="Forçar Carregamento"
        message="Isto irá carregar os seus dados de viagem atuais para o Google Drive, substituindo quaisquer dados remotos existentes."
        confirmText="Forçar Carregamento"
      />

      <ConfirmationModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onConfirm={handleForceDownload}
        title="Forçar Transferência"
        message="Isto irá transferir dados de viagem do Google Drive e substituir os seus dados locais atuais. Quaisquer alterações locais não guardadas serão perdidas."
        confirmText="Forçar Transferência"
        isDestructive={true}
      />

      <ConfirmationModal
        isOpen={showReuploadModal}
        onClose={() => setShowReuploadModal(false)}
        onConfirm={handleForceReupload}
        title="Forçar Re-carregamento"
        message="Isto irá eliminar o ficheiro existente no Google Drive e criar uma cópia nova com os seus dados atuais. Use isto se o ficheiro remoto estiver corrompido."
        confirmText="Forçar Re-carregamento"
        isDestructive={true}
      />

      {/* Info Modal */}
      <InfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
    </>
  );
};
