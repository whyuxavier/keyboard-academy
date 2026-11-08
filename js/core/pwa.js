// Реєстрація Service Worker, оновлення та встановлення застосунку.
import { toast } from './ui.js';

let deferred = null;
export const canInstall = () => !!deferred;
export const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
export async function promptInstall() {
  if (!deferred) return false;
  deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  window.dispatchEvent(new CustomEvent('ka:install-changed'));
  return outcome === 'accepted';
}

export function initPWA() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferred = e;
    window.dispatchEvent(new CustomEvent('ka:install-changed'));
  });
  window.addEventListener('appinstalled', () => { deferred = null; toast('Застосунок встановлено. Його можна відкривати з робочого столу.'); });
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    location.reload();
  });
  navigator.serviceWorker.register('sw.js').then(reg => {
    const offer = worker => toast('Доступна нова версія тренажера.', {
      duration: 15000,
      action: { label: 'Оновити', onClick: () => worker.postMessage('skipWaiting') },
    });
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      if (!w) return;
      w.addEventListener('statechange', () => {
        if (w.state === 'installed') {
          if (navigator.serviceWorker.controller) offer(w);
          else toast('Тренажер збережено для роботи без інтернету.', { icon: 'check' });
        }
      });
    });
  }).catch(err => console.warn('Service Worker не зареєстровано', err));
}
