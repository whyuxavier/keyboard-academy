// Досягнення.
import { store } from '../core/store.js';
import { icon, esc } from '../core/ui.js';
import { ACHIEVEMENTS } from '../core/stats.js';

export function render(el) {
  const got = store.data.achievements;
  const n = ACHIEVEMENTS.filter(a => got[a.id]).length;
  el.innerHTML = `<div class="page">
    <div class="page-head"><div><h1>Досягнення</h1><p>Віхи вашого навчання. Кожна з них означає нову навичку.</p></div><span class="pill amber">${icon('award')} ${n} з ${ACHIEVEMENTS.length}</span></div>
    <div class="grid c2">${ACHIEVEMENTS.map(a => `<div class="ach${got[a.id] ? ' got' : ''}">
      <span class="badge">${icon(got[a.id] ? a.icon : 'lock')}</span>
      <div><div class="t">${esc(a.name)}</div><div class="d">${esc(a.desc)}</div>
      ${got[a.id] ? `<div class="d" style="color:var(--amber)">Отримано ${new Date(got[a.id]).toLocaleDateString('uk-UA')}</div>` : ''}</div>
    </div>`).join('')}</div>
  </div>`;
}
