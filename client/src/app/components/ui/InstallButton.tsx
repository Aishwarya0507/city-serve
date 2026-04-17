import React from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useTranslation } from 'react-i18next';

export const InstallButton: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation();
  const { isInstallable, handleInstall } = usePWAInstall();

  if (!isInstallable) return null;

  return (
    <button
      onClick={handleInstall}
      className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-md active:scale-95 text-sm md:text-base ${className}`}
    >
      <Download className="w-4 h-4" />
      <span>{t('install_app') || 'Install App'}</span>
    </button>
  );
};
