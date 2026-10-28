import React, { useEffect } from 'react';
import { Share, PlusSquare, Check, X } from 'lucide-react';
import type { Locale } from '../../types';
import { adminI18n } from '../../adminI18n';

interface IosInstallModalProps {
  locale: Locale;
  isOpen: boolean;
  onClose: () => void;
}

export const IosInstallModal: React.FC<IosInstallModalProps> = ({ locale, isOpen, onClose }) => {
  const t = adminI18n[locale];
  const isAr = locale === 'ar';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="admin-modal-backdrop"
      onClick={onClose}
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(4, 9, 9, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-label={t.iosInstallTitle}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0e161c',
          border: '1px solid rgba(20, 184, 166, 0.3)',
          borderRadius: '1rem',
          maxWidth: '420px',
          width: '100%',
          padding: '1.75rem',
          color: '#f1f5f9',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          direction: isAr ? 'rtl' : 'ltr',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#f1f5f9' }}>
            {t.iosInstallTitle}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <ol style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9rem', lineHeight: 1.4 }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.15)', color: '#2dd4bf', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Share size={15} />
            </span>
            <span>{t.iosInstallStep1}</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9rem', lineHeight: 1.4 }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.15)', color: '#2dd4bf', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <PlusSquare size={15} />
            </span>
            <span>{t.iosInstallStep2}</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9rem', lineHeight: 1.4 }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.15)', color: '#2dd4bf', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={15} />
            </span>
            <span>{t.iosInstallStep3}</span>
          </li>
        </ol>

        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            minHeight: '44px',
            background: 'linear-gradient(135deg, #14b8a6, #2dd4bf)',
            color: '#040909',
            border: 'none',
            borderRadius: '0.625rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          {t.closeModal}
        </button>
      </div>
    </div>
  );
};

