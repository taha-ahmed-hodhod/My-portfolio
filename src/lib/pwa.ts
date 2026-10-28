// Service Worker registration & PWA state manager (Vanilla TypeScript, 0 packages)

type UpdateCallback = (reg: ServiceWorkerRegistration) => void;
const updateListeners: Set<UpdateCallback> = new Set();
let waitingWorkerRegistration: ServiceWorkerRegistration | null = null;

export function onServiceWorkerUpdate(cb: UpdateCallback) {
  updateListeners.add(cb);
  if (waitingWorkerRegistration) {
    cb(waitingWorkerRegistration);
  }
  return () => {
    updateListeners.delete(cb);
  };
}

export function applyServiceWorkerUpdate() {
  if (!waitingWorkerRegistration || !waitingWorkerRegistration.waiting) {
    window.location.reload();
    return;
  }
  // Tell waiting worker to skipWaiting
  waitingWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  // When the new worker takes control, reload once
  navigator.serviceWorker.addEventListener(
    'controllerchange',
    () => {
      window.location.reload();
    },
    { once: true }
  );
}

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  // Excluded in vite dev; registers in production builds only
  if (!import.meta.env.PROD) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        // If there's already a worker waiting from a previous session
        if (reg.waiting) {
          waitingWorkerRegistration = reg;
          updateListeners.forEach((cb) => cb(reg));
        }

        reg.addEventListener('updatefound', () => {
          const installingWorker = reg.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // A new update is ready!
              waitingWorkerRegistration = reg;
              updateListeners.forEach((cb) => cb(reg));
            }
          });
        });
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker registration failed:', err);
      });
  });
}

// ---------------------------------------------------------------------------
// PWA Installation helpers (used in Admin Dashboard in Part B)
// ---------------------------------------------------------------------------

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
type InstallStateCallback = (canInstall: boolean) => void;
const installListeners: Set<InstallStateCallback> = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;
    installListeners.forEach((cb) => cb(true));
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    installListeners.forEach((cb) => cb(false));
  });
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function isIosSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isWebkit = /webkit/i.test(ua);
  const isChromeOrFirefox = /crios|fxios/i.test(ua);
  return isIos && isWebkit && !isChromeOrFirefox && !isStandalone();
}

export function onInstallPromptChange(cb: InstallStateCallback) {
  installListeners.add(cb);
  cb(deferredInstallPrompt !== null);
  return () => {
    installListeners.delete(cb);
  };
}

export async function triggerInstallPrompt(): Promise<boolean> {
  if (!deferredInstallPrompt) return false;
  try {
    await deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installListeners.forEach((cb) => cb(false));
    return outcome === 'accepted';
  } catch {
    return false;
  }
}

