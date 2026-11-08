// Спільні дрібниці навігації.
import { store } from './store.js';
export const REPO_URL = 'https://github.com/whyuxavier/keyboard-academy';
export function setLast(title) {
  store.data.last = { hash: location.hash, title, at: Date.now() };
  store.save();
}
