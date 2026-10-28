import React, { useEffect, useState } from 'react';
import { Download, Smartphone, CheckCircle2 } from 'lucide-react';
import type { Locale } from '../../types';
import { adminI18n } from '../../adminI18n';
import { onInstallPromptChange, triggerInstallPrompt, isStandalone, isIosSafari } from '../../lib/pwa';
import { IosInstallModal } from './IosInstallModal';

interface AdminInstallButtonProps {
  locale: Locale;
  variant?: 'topbar' | 'sidebar' | 'settings';
}

export const AdminInstallButton: React.FC<AdminInstallButtonProps> = ({ locale, variant = 'topbar' }) => {
  const t = adminI18n[locale];
  const [canInstall, setCanInstall] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
    setIsIos(isIosSafari());
    return onInstallPromptChange((available) => {
      setCanInstall(available);
      setStandalone(isStandalone());
    });
  }, []);

  // In standalone mode, only show a subtle indicator in settings, nothing in topbar/sidebar
  if (standalone) {
    if (variant === 'settings') {
      return (
        <div className="admin-installed-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#2dd4bf', fontSize: '0.85rem' }}>
          <CheckCircle2 size={16} />
          <span>{t.runningStandalone}</span>
        </div>
      );
    }
    return null;
  }

  // If not installable and not iOS Safari, hide button
  if (!canInstall && !isIos) {
    return null;
  }

  const handleClick = async () => {
    if (isIos) {
      setShowIosModal(true);
      return;
    }
    await triggerInstallPrompt();
  };

  if (variant === 'sidebar') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className="admin-sidebar-install-btn"
          title={t.installApp}
          aria-label={t.installApp}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            width: '100%',
            minHeight: '44px',
            padding: '0.5rem 0.75rem',
            marginBottom: '0.5rem',
            background: 'rgba(20, 184, 166, 0.1)',
            border: '1px solid rgba(20, 184, 166, 0.3)',
            borderRadius: '0.625rem',
            color: '#2dd4bf',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {isIos ? <Smartphone size={16} /> : <Download size={16} />}
          <span>{t.installApp}</span>
        </button>
        <IosInstallModal locale={locale} isOpen={showIosModal} onClose={() => setShowIosModal(false)} />
      </>
    );
  }

  if (variant === 'settings') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className="admin-settings-install-btn"
        >
          {isIos ? <Smartphone size={16} /> : <Download size={16} />}
          <span>{t.installApp}</span>
        </button>
        <IosInstallModal locale={locale} isOpen={showIosModal} onClose={() => setShowIosModal(false)} />
      </>
    );
  }

  // Topbar variant (desktop / wide viewports)
  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="admin-topbar-btn admin-install-topbar-btn"
        title={t.installApp}
        aria-label={t.installApp}
      >
        {isIos ? <Smartphone size={17} /> : <Download size={17} />}
        <span className="install-label">{t.installApp}</span>
      </button>
      <IosInstallModal locale={locale} isOpen={showIosModal} onClose={() => setShowIosModal(false)} />
    </>
  );
};

