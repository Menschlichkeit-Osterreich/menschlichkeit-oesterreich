import React from 'react';
import { useAppState } from './AppStateManager';
import { AuthSystem } from './AuthSystem';
import { UserProfile } from './UserProfile';
import { SecurityDashboard } from './SecurityDashboard';
import { PrivacyCenter } from './PrivacyCenter';
import { SepaManagement } from './SepaManagement';

export function ModalManager() {
  const { state, closeModal, login, setError } = useAppState();

  const handleAuthSubmit = async (credentials: { email: string; password: string }) => {
    try {
      await login(credentials);
    } catch (error) {
      setError('Anmeldung fehlgeschlagen');
    }
  };

  const renderModal = () => {
    switch (state.currentModal) {
      case 'auth':
        return (
          <AuthSystem
            isOpen={true}
            onClose={closeModal}
            mode={state.authMode}
          />
        );
      
      case 'profile':
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Mein Profil</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                <UserProfile />
              </div>
            </div>
          </div>
        );
      
      case 'security':
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Sicherheits-Dashboard</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                <SecurityDashboard />
              </div>
            </div>
          </div>
        );
      
      case 'privacy':
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Datenschutz-Center</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                <PrivacyCenter />
              </div>
            </div>
          </div>
        );
      
      case 'sepa':
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">SEPA-Lastschrift Verwaltung</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                <SepaManagement />
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return renderModal();
}