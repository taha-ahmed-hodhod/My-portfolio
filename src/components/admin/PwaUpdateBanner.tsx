import React, { useEffect, useState } from 'react';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import type { Locale } from '../../types';
import { onServiceWorkerUpdate, applyServiceWorkerUpdate } from '../../lib/pwa';

interface PwaUpdateBannerProps {
  locale: Locale;
}

export const PwaUpdateBanner: React.FC<PwaUpdateBannerProps> = ({ locale }) => {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    return onServiceWorkerUpdate(() => {
      setHasUpdate(true);
    });
  }, []);

  if (!hasUpdate || dismissed) {
    return null;
  }

  const isAr = locale === 'ar';

  const handleUpdate = () => {
    setUpdating(true);
    applyServiceWorkerUpdate();
  };

  return (
    <div
      className="pwa-update-banner"
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '0.625rem 1rem',
        background: 'linear-gradient(90deg, rgba(20, 184, 166, 0.15), rgba(45, 212, 191, 0.08))',
        border: '1px solid rgba(20, 184, 166, 0.35)',
        borderRadius: '0.75rem',
        margin: '0.75rem 1rem 0',
        color: '#f1f5f9',
        fontSize: '0.875rem',
        direction: isAr ? 'rtl' : 'ltr',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Sparkles size={16} style={{ color: '#2dd4bf', flexShrink: 0 }} />
        <span>
          {isAr
            ? 'يتوفر تحديث جديد للوحة التحكم.'
            : 'A new version of the dashboard is available.'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={handleUpdate}
          disabled={updating}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '0.5rem',
            background: '#14b8a6',
            color: '#040909',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: updating ? 'wait' : 'pointer',
            minHeight: '32px',
          }}
        >
          <RefreshCw size={13} className={updating ? 'spinning' : ''} />
          <span>{isAr ? 'تحديث الآن' : 'Update now'}</span>
        </button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={isAr ? 'إغلاق' : 'Dismiss'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            borderRadius: '0.375rem',
          }}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

