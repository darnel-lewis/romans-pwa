/* Today's Worship — demo
 *
 * Data shape (per block):
 *   { kind: 'song',      title, attribution, stanzas: [{ type, lines[] }] }
 *   { kind: 'scripture', reference, version, verses: [{ n, text }] }
 *   { kind: 'note',      title, body: [paragraphs] }
 *
 * Auth and storage are mocked with localStorage so the full flow works
 * without a backend. Swap for Supabase when ready.
 */

const STORAGE_KEYS = {
  session: 'worship.session',
  service: 'worship.service.v3',
  prefs: 'worship.prefs.v1',
  songLibrary: 'worship.song-library.v1',
};

const SEED_SERVICE = {
  church: 'The Well',
  style: 'a',
  subtitle: '',
  footer: 'Soli Deo Gloria',
  blocks: [
    {
      kind: 'song',
      title: 'Holy, Holy, Holy',
      attribution: 'Reginald Heber, 1826',
      stanzas: [
        { type: 'verse', lines: [
          'Holy, holy, holy! Lord God Almighty!',
          'Early in the morning our song shall rise to Thee.',
          'Holy, holy, holy! Merciful and mighty,',
          'God in three persons, blessèd Trinity.',
        ]},
        { type: 'verse', lines: [
          'Holy, holy, holy! All the saints adore Thee,',
          'Casting down their golden crowns around the glassy sea;',
          'Cherubim and seraphim falling down before Thee,',
          'Who wert, and art, and evermore shalt be.',
        ]},
        { type: 'chorus', lines: [
          'Holy, holy, holy! Though the darkness hide Thee,',
          'Though the eye of sinful man Thy glory may not see,',
          'Only Thou art holy; there is none beside Thee,',
          'Perfect in power, in love, and purity.',
        ]},
        { type: 'verse', lines: [
          'Holy, holy, holy! Lord God Almighty!',
          'All Thy works shall praise Thy name in earth and sky and sea.',
          'Holy, holy, holy! Merciful and mighty,',
          'God in three persons, blessèd Trinity.',
        ]},
      ],
    },
    {
      kind: 'song',
      title: 'Amazing Grace',
      attribution: 'John Newton, 1779',
      stanzas: [
        { type: 'verse', lines: [
          'Amazing grace! How sweet the sound',
          'That saved a wretch like me!',
          'I once was lost, but now am found;',
          'Was blind, but now I see.',
        ]},
        { type: 'verse', lines: [
          '’Twas grace that taught my heart to fear,',
          'And grace my fears relieved;',
          'How precious did that grace appear',
          'The hour I first believed.',
        ]},
        { type: 'verse', lines: [
          'Through many dangers, toils and snares,',
          'I have already come;',
          '’Tis grace hath brought me safe thus far,',
          'And grace will lead me home.',
        ]},
        { type: 'verse', lines: [
          'When we’ve been there ten thousand years,',
          'Bright shining as the sun,',
          'We’ve no less days to sing God’s praise',
          'Than when we’d first begun.',
        ]},
      ],
    },
    {
      kind: 'scripture',
      reference: 'Ephesians 2:4–9',
      version: 'Christian Standard Bible',
      verses: [
        { n: 4, text: 'But God, being rich in mercy, because of the great love with which he loved us,' },
        { n: 5, text: 'even when we were dead in our trespasses, made us alive together with Christ — by grace you have been saved —' },
        { n: 6, text: 'and raised us up with him and seated us with him in the heavenly places in Christ Jesus,' },
        { n: 7, text: 'so that in the coming ages he might show the immeasurable riches of his grace in kindness toward us in Christ Jesus.' },
        { n: 8, text: 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God,' },
        { n: 9, text: 'not a result of works, so that no one may boast.' },
      ],
    },
    {
      kind: 'note',
      title: 'Going Deeper This Week',
      body: [
        'Read Isaiah 6 in full. Notice how the vision of holiness leads not to despair but to commission — “Here I am. Send me.”',
        'Memorize Ephesians 2:8. Carry it with you on Tuesday, when grace feels furthest.',
      ],
    },
    {
      kind: 'song',
      title: 'Be Thou My Vision',
      attribution: 'Irish, 8th c. · tr. Eleanor Hull',
      stanzas: [
        { type: 'verse', lines: [
          'Be Thou my vision, O Lord of my heart;',
          'Naught be all else to me, save that Thou art;',
          'Thou my best thought, by day or by night,',
          'Waking or sleeping, Thy presence my light.',
        ]},
        { type: 'verse', lines: [
          'Be Thou my wisdom, and Thou my true word;',
          'I ever with Thee and Thou with me, Lord;',
          'Thou my great Father, I Thy true son;',
          'Thou in me dwelling, and I with Thee one.',
        ]},
        { type: 'verse', lines: [
          'High King of Heaven, my victory won,',
          'May I reach Heaven’s joys, O bright Heav’n’s Sun!',
          'Heart of my own heart, whatever befall,',
          'Still be my vision, O Ruler of all.',
        ]},
      ],
    },
  ],
};

/* ---------- storage helpers ---------- */

function getService() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.service);
    if (!raw) return clone(SEED_SERVICE);
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.blocks)) return clone(SEED_SERVICE);
    return parsed;
  } catch {
    return clone(SEED_SERVICE);
  }
}

function saveService(service) {
  localStorage.setItem(STORAGE_KEYS.service, JSON.stringify(service));
}

function getPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.prefs);
    return raw ? JSON.parse(raw) : { dark: false, size: 1 };
  } catch {
    return { dark: false, size: 1 };
  }
}

function savePrefs(p) {
  localStorage.setItem(STORAGE_KEYS.prefs, JSON.stringify(p));
}

function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.session);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSession(session) {
  if (session) localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  else localStorage.removeItem(STORAGE_KEYS.session);
}

function clone(o) { return JSON.parse(JSON.stringify(o)); }

/* ---------- song library ---------- *
 * Auto-grows on every save: any song an admin saves into a service is
 * upserted into a per-device library, keyed by normalized title. Powers
 * the autocomplete dropdown on the song-title input in admin. */

function getSongLibrary() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.songLibrary);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveSongLibrary(arr) {
  localStorage.setItem(STORAGE_KEYS.songLibrary, JSON.stringify(arr));
}

function normalizeTitle(t) {
  return (t || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function libraryUpsert(songs) {
  const lib = getSongLibrary();
  const byKey = new Map(lib.map((s) => [normalizeTitle(s.title), s]));
  const now = Date.now();
  songs.forEach((song) => {
    const key = normalizeTitle(song.title);
    if (!key) return;
    byKey.set(key, {
      title: song.title,
      attribution: song.attribution || '',
      stanzas: song.stanzas || [],
      lastUsed: now,
    });
  });
  saveSongLibrary(Array.from(byKey.values()));
}

function librarySearch(query, limit = 8) {
  const q = (query || '').toLowerCase().trim();
  const lib = getSongLibrary();
  if (!q) {
    return [...lib].sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0)).slice(0, limit);
  }
  return lib
    .filter((s) => (s.title || '').toLowerCase().includes(q))
    .sort((a, b) => {
      const aStarts = (a.title || '').toLowerCase().startsWith(q);
      const bStarts = (b.title || '').toLowerCase().startsWith(q);
      if (aStarts !== bStarts) return aStarts ? -1 : 1;
      return (b.lastUsed || 0) - (a.lastUsed || 0);
    })
    .slice(0, limit);
}

function ensureLibrarySeed() {
  if (getSongLibrary().length > 0) return;
  libraryUpsert((SEED_SERVICE.blocks || []).filter((b) => b.kind === 'song'));
}
ensureLibrarySeed();

/* Computes "Sunday · November 23" for the upcoming Sunday — used as the
 * render-time fallback for an unset subtitle so the page always shows
 * something date-like rather than a generic "Order of Service" stub. */
function defaultSubtitle() {
  const d = new Date();
  const daysUntilSunday = (7 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + daysUntilSunday);
  const day = d.toLocaleDateString(undefined, { weekday: 'long' });
  const monthDay = d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  return `${day} · ${monthDay}`;
}

/* ---------- routing ---------- */

function route() {
  const hash = (location.hash || '').replace('#', '');
  const session = getSession();
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));

  if (hash === 'admin') {
    if (session) {
      document.getElementById('admin-view').classList.add('active');
      renderAdmin();
    } else {
      document.getElementById('login-view').classList.add('active');
    }
    return;
  }
  if (hash === 'about') {
    document.getElementById('landing-view').classList.add('active');
    window.scrollTo(0, 0);
    return;
  }
  if (hash === 'kiosk') {
    document.getElementById('kiosk-view').classList.add('active');
    renderKiosk();
    return;
  }
  document.getElementById('worship-view').classList.add('active');
  renderWorship();
}

window.addEventListener('hashchange', route);

/* ---------- escaping ---------- */

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function escAttr(s) { return esc(s).replace(/"/g, '&quot;'); }

/* ---------- public worship view ---------- */

function applyViewState() {
  const view = document.getElementById('worship-view');
  const prefs = getPrefs();
  const service = getService();
  const style = service.style === 'b' ? 'b' : 'a';
  view.classList.toggle('theme-a', style === 'a');
  view.classList.toggle('theme-b', style === 'b');
  view.classList.toggle('dark', !!prefs.dark);
  view.dataset.size = String(prefs.size ?? 1);

  const darkInd = view.querySelector('.dark-indicator');
  if (darkInd) darkInd.textContent = prefs.dark ? '☼' : '☾';
}

function miniLabel(b) {
  if (b.kind === 'song') return b.title;
  if (b.kind === 'scripture') return b.reference;
  return b.title;
}

function renderSong(b, style) {
  const condense = style === 'a';
  let renderedChorus = false;
  const stanzas = (b.stanzas || []).map((st) => {
    if (st.type === 'chorus') {
      if (condense && renderedChorus) {
        return `
          <div class="chorus-repeat" aria-label="Chorus repeats">
            <span class="chorus-repeat-dot"></span>
            <span class="chorus-repeat-label">repeat</span>
          </div>
        `;
      }
      renderedChorus = true;
      return `
        <div class="stanza chorus">
          ${(st.lines || []).map((ln) => `<div>${esc(ln)}</div>`).join('')}
        </div>
      `;
    }
    return `
      <div class="stanza">
        ${(st.lines || []).map((ln) => `<div>${esc(ln)}</div>`).join('')}
      </div>
    `;
  }).join('');
  return `
    <article class="block block-song">
      <div class="song-head">
        <h2 class="song-title">${esc(b.title || 'Untitled')}</h2>
        ${b.attribution ? `<div class="song-attribution">${esc(b.attribution)}</div>` : ''}
      </div>
      <div class="stanzas">${stanzas}</div>
    </article>
  `;
}

function renderScripture(b, style) {
  const version = (b.version || '').trim();
  const versionEl = version
    ? `<div class="scripture-version">${esc(version)}</div>`
    : '';
  if (style === 'a') {
    const rows = (b.verses || []).map((v) => `
      <div class="verse-row">
        <div class="verse-num">${esc(v.n)}</div>
        <div class="verse-text">${esc(v.text)}</div>
      </div>
    `).join('');
    return `
      <article class="block block-scripture">
        <div class="scripture-head">
          <h2 class="scripture-reference">${esc(b.reference || '')}</h2>
          ${versionEl}
        </div>
        <div class="verses">${rows}</div>
      </article>
    `;
  }
  const verses = (b.verses || []).map((v) =>
    `<sup class="verse-num">${esc(v.n)}</sup>${esc(v.text)} `
  ).join('');
  return `
    <article class="block block-scripture">
      <div class="scripture-head">
        <h2 class="scripture-reference">${esc(b.reference || '')}</h2>
        ${versionEl}
      </div>
      <p class="scripture-prose">${verses}</p>
    </article>
  `;
}

function renderNote(b, _style) {
  const paras = (b.body || []).map((p) => `<p>${esc(p)}</p>`).join('');
  return `
    <article class="block block-note">
      <div class="note-card">
        <h3 class="note-title">${esc(b.title || '')}</h3>
        ${paras}
      </div>
    </article>
  `;
}

function renderBlock(b, style) {
  if (b.kind === 'song') return renderSong(b, style);
  if (b.kind === 'scripture') return renderScripture(b, style);
  if (b.kind === 'note') return renderNote(b, style);
  return '';
}

function renderWorship() {
  applyViewState();
  const service = getService();
  const style = service.style === 'b' ? 'b' : 'a';

  // Top bar = product wordmark; H1 = church name (the headline).
  const tbLeft = document.getElementById('topbar-left');
  tbLeft.textContent = "Today’s Worship";

  // Header: H1 = church name, sub-line = subtitle (Style A only).
  const titleEl = document.getElementById('worship-title');
  titleEl.textContent = service.church || '';

  const churchEl = document.getElementById('hdr-church');
  if (style === 'a') {
    churchEl.textContent = (service.subtitle || '').trim() || defaultSubtitle();
  } else {
    churchEl.textContent = '';
  }

  // mini-nav (only displays in style A via CSS, but always populate so toggling works)
  const nav = document.getElementById('mini-nav');
  nav.innerHTML = (service.blocks || []).map((b, i) =>
    `<button class="mini-pill" data-jump="${i}">${esc(miniLabel(b))}</button>`
  ).join('');

  // blocks
  const container = document.getElementById('blocks');
  if (!service.blocks || !service.blocks.length) {
    container.innerHTML = `<div class="empty">Nothing has been added yet.</div>`;
  } else {
    container.innerHTML = service.blocks.map((b) => renderBlock(b, style)).join('');
  }

  // footer (custom text used by both styles; rendered with each variant's treatment)
  const footer = document.getElementById('worship-footer');
  const footerText = (service.footer || '').trim() || 'Soli Deo Gloria';
  if (style === 'a') {
    footer.innerHTML = `<span>${esc(footerText)}</span>`;
  } else {
    footer.innerHTML = `✶ ${esc(footerText)} ✶`;
  }

  setupMiniNavTracking();
}

/* Track active pill on scroll (style A / Modern only — it's the variant with the mini-nav) */
function setupMiniNavTracking() {
  const view = document.getElementById('worship-view');
  if (!view.classList.contains('theme-a')) return;

  const nav = document.getElementById('mini-nav');
  const blocks = Array.from(document.querySelectorAll('#blocks .block'));
  const pills = Array.from(document.querySelectorAll('#mini-nav .mini-pill'));
  if (!blocks.length || !pills.length) return;

  let lastActive = -1;
  const update = () => {
    const top = window.scrollY + 140;
    let idx = 0;
    blocks.forEach((el, i) => { if (el.offsetTop <= top) idx = i; });

    if (idx !== lastActive) {
      pills.forEach((p, i) => p.classList.toggle('active', i === idx));
      // Scroll the active pill into view inside the (horizontally scrolling) nav
      const active = pills[idx];
      if (active && nav) {
        const navRect = nav.getBoundingClientRect();
        const pillRect = active.getBoundingClientRect();
        const padding = 22;
        if (pillRect.left < navRect.left + padding) {
          nav.scrollTo({ left: active.offsetLeft - padding, behavior: 'smooth' });
        } else if (pillRect.right > navRect.right - padding) {
          nav.scrollTo({
            left: active.offsetLeft - nav.clientWidth + active.offsetWidth + padding,
            behavior: 'smooth',
          });
        }
      }
      lastActive = idx;
    }
  };
  update();
  window.removeEventListener('scroll', window.__miniNavTracker);
  window.__miniNavTracker = update;
  window.addEventListener('scroll', update, { passive: true });
}

/* Topbar + mini-nav handlers (delegated, attached once) */
document.addEventListener('click', (e) => {
  const scroll = e.target.closest('[data-scroll]');
  if (scroll) {
    const target = document.getElementById(scroll.dataset.scroll);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return;
  }

  const t = e.target.closest('[data-action], [data-jump]');
  if (!t) return;

  if (t.dataset.jump !== undefined) {
    const i = Number(t.dataset.jump);
    const block = document.querySelectorAll('#blocks .block')[i];
    if (block) window.scrollTo({ top: block.offsetTop - 100, behavior: 'smooth' });
    return;
  }

  const action = t.dataset.action;
  if (action === 'toggle-dark') {
    const p = getPrefs();
    p.dark = !p.dark;
    savePrefs(p);
    applyViewState();
  } else if (action === 'size-up') {
    const p = getPrefs();
    p.size = Math.min(3, (p.size ?? 1) + 1);
    savePrefs(p);
    applyViewState();
  } else if (action === 'size-down') {
    const p = getPrefs();
    p.size = Math.max(0, (p.size ?? 1) - 1);
    savePrefs(p);
    applyViewState();
  } else if (action === 'kiosk-fullscreen') {
    enterKioskMode();
  } else if (action === 'email-link') {
    emailKioskLink();
  } else if (action === 'toggle-panel') {
    togglePanel(t.dataset.panel);
  } else if (action === 'library-delete') {
    libraryDelete(t.dataset.libraryKey);
  } else if (action === 'library-export') {
    exportBackup();
  } else if (action === 'library-import') {
    document.getElementById('library-import-input').click();
  }
});

document.addEventListener('change', (e) => {
  if (e.target && e.target.id === 'library-import-input') {
    const file = e.target.files && e.target.files[0];
    importBackup(file);
    e.target.value = ''; // allow re-selecting the same file
  }
});

/* ---------- admin panels (Settings / Library / Share) ----------
 * One open at a time. Re-clicking the toggle closes the panel. */
function togglePanel(name) {
  const panels = document.querySelectorAll('.admin-panel');
  let opened = false;
  panels.forEach((el) => {
    if (el.dataset.panelName === name) {
      const wasHidden = el.hasAttribute('hidden');
      if (wasHidden) {
        el.removeAttribute('hidden');
        opened = true;
      } else {
        el.setAttribute('hidden', '');
      }
    } else {
      el.setAttribute('hidden', '');
    }
  });
  document.querySelectorAll('.admin-tool').forEach((btn) => {
    btn.classList.toggle('is-active', opened && btn.dataset.panel === name);
  });
  if (opened && name === 'library') renderLibraryList();
  if (opened && name === 'share') renderAdminShare();
}

function renderLibraryList() {
  const el = document.getElementById('library-list');
  if (!el) return;
  const lib = [...getSongLibrary()].sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
  if (!lib.length) {
    el.innerHTML = `<div class="library-empty">No saved songs yet. Add a song below and save — it'll show up here.</div>`;
    return;
  }
  el.innerHTML = lib.map((s) => `
    <div class="library-item">
      <div class="library-item-info">
        <div class="library-item-title">${esc(s.title)}</div>
        ${s.attribution ? `<div class="library-item-meta">${esc(s.attribution)}</div>` : ''}
      </div>
      <button type="button" class="remove-btn" data-action="library-delete" data-library-key="${escAttr(normalizeTitle(s.title))}">Delete</button>
    </div>
  `).join('');
}

function libraryDelete(key) {
  const lib = getSongLibrary().filter((s) => normalizeTitle(s.title) !== key);
  saveSongLibrary(lib);
  renderLibraryList();
}

function exportBackup() {
  const data = {
    app: 'todays-worship',
    version: 1,
    exported: new Date().toISOString(),
    library: getSongLibrary(),
    service: getService(),
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `todays-worship-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let data;
    try {
      data = JSON.parse(reader.result);
    } catch {
      alert("Could not read this file. Make sure it's a backup downloaded from this app.");
      return;
    }
    const incoming = (data && Array.isArray(data.library)) ? data.library : null;
    if (!incoming) {
      alert('No song library found in this file.');
      return;
    }
    const valid = incoming.filter((s) =>
      s && typeof s === 'object' && s.title && Array.isArray(s.stanzas)
    );
    if (!valid.length) {
      alert("This file has no valid songs to restore.");
      return;
    }
    libraryUpsert(valid);
    alert(`Restored ${valid.length} song${valid.length === 1 ? '' : 's'} into your library.`);
    renderLibraryList();
  };
  reader.readAsText(file);
}

/* ---------- login (mock magic link) ---------- */

const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  if (!email) return;
  loginMessage.classList.remove('error');
  loginMessage.textContent = 'Sending magic link…';
  setTimeout(() => {
    setSession({ email, signedInAt: Date.now() });
    loginMessage.textContent = 'Demo: magic link auto-confirmed. Redirecting…';
    setTimeout(() => { location.hash = 'admin'; }, 600);
  }, 700);
});

/* ---------- admin view ----------
 *
 * Editor data shape mirrors the public one. Text conventions in textareas:
 *   - Songs: blank-line separated stanzas. A stanza beginning with [chorus]
 *            on its own line is rendered as a chorus.
 *   - Scripture: one verse per line, starting with the verse number.
 *                e.g. "1 In the year that King Uzziah died..."
 *   - Notes: blank-line separated paragraphs.
 */

const ITEM_TYPES = {
  song: {
    label: 'Song',
    titlePlaceholder: 'Song title',
    metaLabel: 'Attribution (optional)',
    metaPlaceholder: 'e.g. John Newton, 1779',
    bodyLabel: 'Lyrics',
    bodyPlaceholder:
      'Holy, holy, holy! Lord God Almighty!\nEarly in the morning our song shall rise to Thee.\n\n[chorus]\nHoly, holy, holy! Though the darkness hide Thee,\nThough the eye of sinful man Thy glory may not see,',
    bodyHint: 'Blank line = new stanza. Start a stanza with [chorus] to mark it as the chorus.',
  },
  scripture: {
    label: 'Scripture',
    titlePlaceholder: 'e.g. Isaiah 6:1–4',
    metaLabel: 'Version (optional)',
    metaPlaceholder: 'e.g. Christian Standard Bible',
    bodyLabel: 'Verses',
    bodyPlaceholder:
      '1 In the year that King Uzziah died I saw the Lord sitting upon a throne...\n2 Above him stood the seraphim...',
    bodyHint: 'One verse per line. Start each line with the verse number.',
  },
  note: {
    label: 'Note',
    titlePlaceholder: 'e.g. Welcome & Announcements',
    metaLabel: '',
    metaPlaceholder: '',
    bodyLabel: 'Body',
    bodyPlaceholder: 'Anything you want the congregation to read — separate paragraphs with a blank line.',
    bodyHint: 'Blank line = new paragraph.',
  },
};

let draft = { church: '', style: 'a', footer: '', blocks: [] };

function renderAdmin() {
  const session = getSession();
  document.getElementById('signed-in-as').textContent = session ? session.email : '';
  draft = serviceToDraft(getService());
  if (!draft.blocks.length) draft.blocks.push(emptyDraftItem('song'));
  document.getElementById('church-name').value = draft.church || '';
  document.getElementById('subtitle-text').value = draft.subtitle || '';
  document.getElementById('footer-text').value = draft.footer || '';
  paintStylePicker();
  paintEditor();
  renderAdminShare();
}

function paintStylePicker() {
  document.querySelectorAll('#style-picker .style-option').forEach((el) => {
    el.classList.toggle('selected', el.dataset.style === draft.style);
  });
}

/* Convert stored service shape ↔ flat draft (textarea-friendly) */
function serviceToDraft(service) {
  return {
    church: service.church || '',
    style: service.style === 'b' ? 'b' : 'a',
    subtitle: service.subtitle || '',
    footer: service.footer || '',
    blocks: (service.blocks || []).map(blockToDraft),
  };
}

function blockToDraft(b) {
  if (b.kind === 'song') {
    const body = (b.stanzas || []).map((st) => {
      const lines = (st.lines || []).join('\n');
      return st.type === 'chorus' ? `[chorus]\n${lines}` : lines;
    }).join('\n\n');
    return { kind: 'song', title: b.title || '', meta: b.attribution || '', body };
  }
  if (b.kind === 'scripture') {
    const body = (b.verses || []).map((v) => `${v.n} ${v.text}`).join('\n');
    return { kind: 'scripture', title: b.reference || '', meta: b.version || '', body };
  }
  if (b.kind === 'note') {
    const body = (b.body || []).join('\n\n');
    return { kind: 'note', title: b.title || '', meta: '', body };
  }
  return { kind: 'note', title: '', meta: '', body: '' };
}

function draftToBlock(d) {
  if (d.kind === 'song') {
    const stanzaTexts = (d.body || '').split(/\n\s*\n/).map((s) => s.replace(/\s+$/g, ''));
    const stanzas = stanzaTexts
      .filter((s) => s.trim())
      .map((s) => {
        const lines = s.split(/\n/);
        if (/^\s*\[chorus\]\s*$/i.test(lines[0])) {
          return { type: 'chorus', lines: lines.slice(1) };
        }
        return { type: 'verse', lines };
      });
    return {
      kind: 'song',
      title: (d.title || '').trim(),
      attribution: (d.meta || '').trim(),
      stanzas,
    };
  }
  if (d.kind === 'scripture') {
    const verses = (d.body || '').split(/\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      const m = line.match(/^(\d+)\s+(.*)$/);
      if (m) return { n: Number(m[1]), text: m[2] };
      return { n: '', text: line };
    });
    return {
      kind: 'scripture',
      reference: (d.title || '').trim(),
      version: (d.meta || '').trim(),
      verses,
    };
  }
  if (d.kind === 'note') {
    const body = (d.body || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    return { kind: 'note', title: (d.title || '').trim(), body };
  }
  return null;
}

function emptyDraftItem(kind) {
  return { kind, title: '', meta: '', body: '' };
}

function editorEl() { return document.getElementById('song-editor'); }

function paintEditor() {
  editorEl().innerHTML = draft.blocks.map((item, i) => {
    const cfg = ITEM_TYPES[item.kind] || ITEM_TYPES.note;
    const last = i === draft.blocks.length - 1;
    const first = i === 0;
    return `
      <div class="item-card" data-index="${i}">
        <div class="item-card-head">
          <span class="drag-handle" aria-label="Drag to reorder" title="Drag to reorder">⋮⋮</span>
          <span class="item-card-num">${esc(cfg.label)} · ${i + 1}</span>
          <div class="item-card-actions">
            <button type="button" class="icon-btn" data-action="up" data-index="${i}" ${first ? 'disabled' : ''} aria-label="Move up">↑</button>
            <button type="button" class="icon-btn" data-action="down" data-index="${i}" ${last ? 'disabled' : ''} aria-label="Move down">↓</button>
            <button type="button" class="remove-btn" data-action="remove" data-index="${i}">Remove</button>
          </div>
        </div>

        <label for="title-${i}">${item.kind === 'scripture' ? 'Reference' : 'Title'}</label>
        ${item.kind === 'song' ? `
          <div class="title-wrap">
            <input type="text" id="title-${i}" data-field="title" data-index="${i}" data-song-title="1" value="${escAttr(item.title)}" placeholder="${escAttr(cfg.titlePlaceholder)}" autocomplete="off">
            <div class="song-suggest" data-suggest-for="${i}" hidden></div>
          </div>
        ` : `
          <input type="text" id="title-${i}" data-field="title" data-index="${i}" value="${escAttr(item.title)}" placeholder="${escAttr(cfg.titlePlaceholder)}">
        `}

        ${cfg.metaLabel ? `
          <label for="meta-${i}">${esc(cfg.metaLabel)}</label>
          <input type="text" id="meta-${i}" data-field="meta" data-index="${i}" value="${escAttr(item.meta)}" placeholder="${escAttr(cfg.metaPlaceholder)}">
        ` : ''}

        <label for="body-${i}">${esc(cfg.bodyLabel)}</label>
        <textarea id="body-${i}" data-field="body" data-index="${i}" placeholder="${escAttr(cfg.bodyPlaceholder)}">${esc(item.body)}</textarea>
        <div class="field-hint">${esc(cfg.bodyHint)}</div>
      </div>
    `;
  }).join('');
  initSortable();
}

function initSortable() {
  const editor = editorEl();
  if (!editor || typeof Sortable === 'undefined') return;
  if (editor.__sortable) {
    try { editor.__sortable.destroy(); } catch (_) {}
  }
  editor.__sortable = Sortable.create(editor, {
    handle: '.drag-handle',
    animation: 160,
    ghostClass: 'item-card-ghost',
    chosenClass: 'item-card-chosen',
    onEnd: (evt) => {
      if (evt.oldIndex === evt.newIndex || evt.oldIndex == null) return;
      const [moved] = draft.blocks.splice(evt.oldIndex, 1);
      draft.blocks.splice(evt.newIndex, 0, moved);
      paintEditor();
    },
  });
}

document.addEventListener('input', (e) => {
  const t = e.target;
  if (t && t.id === 'church-name') { draft.church = t.value; return; }
  if (t && t.id === 'subtitle-text') { draft.subtitle = t.value; return; }
  if (t && t.id === 'footer-text') { draft.footer = t.value; return; }
  if (!t || !t.dataset || !t.dataset.field) return;
  const i = Number(t.dataset.index);
  draft.blocks[i][t.dataset.field] = t.value;
  if (t.dataset.songTitle) renderSongSuggest(i, t.value);
});

function renderSongSuggest(index, query) {
  const dropdown = document.querySelector(`[data-suggest-for="${index}"]`);
  if (!dropdown) return;
  const matches = librarySearch(query, 8);
  if (!matches.length) {
    dropdown.hidden = true;
    dropdown.innerHTML = '';
    return;
  }
  dropdown.innerHTML = matches.map((s) => `
    <button type="button" class="song-suggest-item" data-suggest-pick="${index}" data-suggest-key="${escAttr(normalizeTitle(s.title))}">
      <div class="song-suggest-title">${esc(s.title)}</div>
      ${s.attribution ? `<div class="song-suggest-meta">${esc(s.attribution)}</div>` : ''}
    </button>
  `).join('');
  dropdown.hidden = false;
}

document.addEventListener('focusin', (e) => {
  const t = e.target;
  if (t && t.dataset && t.dataset.songTitle) {
    renderSongSuggest(Number(t.dataset.index), t.value);
  }
});

document.addEventListener('focusout', (e) => {
  const t = e.target;
  if (t && t.dataset && t.dataset.songTitle) {
    setTimeout(() => {
      const dropdown = document.querySelector(`[data-suggest-for="${t.dataset.index}"]`);
      if (dropdown) dropdown.hidden = true;
    }, 180);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const t = e.target;
  if (t && t.dataset && t.dataset.songTitle) {
    const dropdown = document.querySelector(`[data-suggest-for="${t.dataset.index}"]`);
    if (dropdown) dropdown.hidden = true;
  }
});

/* Use mousedown so we beat the input's focusout (which would hide the
 * dropdown and cancel the click). preventDefault keeps the input focused. */
document.addEventListener('mousedown', (e) => {
  const item = e.target.closest('[data-suggest-pick]');
  if (!item) return;
  e.preventDefault();
  const index = Number(item.dataset.suggestPick);
  const key = item.dataset.suggestKey;
  const song = getSongLibrary().find((s) => normalizeTitle(s.title) === key);
  if (!song) return;
  draft.blocks[index] = blockToDraft({
    kind: 'song',
    title: song.title,
    attribution: song.attribution,
    stanzas: song.stanzas,
  });
  paintEditor();
});

document.addEventListener('click', (e) => {
  const styleOpt = e.target.closest('.style-option');
  if (styleOpt && styleOpt.dataset.style) {
    draft.style = styleOpt.dataset.style;
    paintStylePicker();
    return;
  }

  const t = e.target.closest('[data-action]');
  if (!t) return;
  const action = t.dataset.action;
  const i = t.dataset.index !== undefined ? Number(t.dataset.index) : null;

  if (action === 'remove' && i !== null) {
    draft.blocks.splice(i, 1);
    if (!draft.blocks.length) draft.blocks.push(emptyDraftItem('song'));
    paintEditor();
  } else if (action === 'up' && i !== null && i > 0) {
    [draft.blocks[i - 1], draft.blocks[i]] = [draft.blocks[i], draft.blocks[i - 1]];
    paintEditor();
  } else if (action === 'down' && i !== null && i < draft.blocks.length - 1) {
    [draft.blocks[i + 1], draft.blocks[i]] = [draft.blocks[i], draft.blocks[i + 1]];
    paintEditor();
  } else if (action === 'add') {
    const kind = t.dataset.type || 'song';
    draft.blocks.push(emptyDraftItem(kind));
    paintEditor();
    const last = editorEl().querySelector('.item-card:last-child input');
    if (last) last.focus();
  }
});

const saveBtn = document.getElementById('save-btn');
if (saveBtn) saveBtn.addEventListener('click', () => {
  const blocks = draft.blocks
    .map(draftToBlock)
    .filter((b) => {
      if (!b) return false;
      if (b.kind === 'song') return b.title || b.stanzas.length;
      if (b.kind === 'scripture') return b.reference || b.verses.length;
      if (b.kind === 'note') return b.title || b.body.length;
      return false;
    });
  saveService({
    church: (draft.church || '').trim(),
    style: draft.style === 'b' ? 'b' : 'a',
    subtitle: (draft.subtitle || '').trim(),
    footer: (draft.footer || '').trim(),
    blocks,
  });
  libraryUpsert(blocks.filter((b) => b.kind === 'song'));
  const msg = document.getElementById('save-message');
  msg.textContent = `Saved ${blocks.length} block${blocks.length === 1 ? '' : 's'}.`;
  setTimeout(() => { msg.textContent = ''; }, 2400);
});

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) logoutBtn.addEventListener('click', () => {
  setSession(null);
  location.hash = '';
});

/* ============================================================
   QR / KIOSK / SHARE
   ============================================================ */

/* The URL each church's QR encodes. Today everyone shares "/", but once
 * slug routing lands this becomes origin + "/" + slug — change it in
 * one place and every QR re-encodes correctly. */
function publicUrl() {
  return window.location.origin + '/';
}

function kioskUrl() {
  return window.location.origin + '/#kiosk';
}

function prettyUrl(u) {
  return u.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function renderQR(el, url, pixelSize) {
  if (!el) return;
  if (typeof qrcode !== 'function') {
    el.textContent = '';
    return;
  }
  const qr = qrcode(0, 'M');
  qr.addData(url);
  qr.make();
  el.innerHTML = qr.createSvgTag({ scalable: true, margin: 0 });
  const svg = el.querySelector('svg');
  if (svg) {
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.style.width = pixelSize + 'px';
    svg.style.height = pixelSize + 'px';
    svg.style.display = 'block';
  }
}

function renderKiosk() {
  const service = getService();
  document.getElementById('kiosk-church').textContent = service.church || '';
  const subtitleText = (service.subtitle || '').trim() || defaultSubtitle();
  document.getElementById('kiosk-subtitle').textContent = subtitleText;
  const url = publicUrl();
  document.getElementById('kiosk-url').textContent = prettyUrl(url);
  // Slight delay so the layout settles before sizing the SVG.
  requestAnimationFrame(() => {
    const target = document.getElementById('kiosk-qr');
    const size = Math.min(420, Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.6));
    renderQR(target, url, size);
  });
}

function renderAdminShare() {
  const url = publicUrl();
  document.getElementById('admin-url').textContent = prettyUrl(url);
  renderQR(document.getElementById('admin-qr'), url, 110);
}

/* Wake Lock + Fullscreen for the kiosk display. Both are best-effort —
 * unsupported browsers just skip silently. */
async function enterKioskMode() {
  const root = document.documentElement;
  try {
    if (!document.fullscreenElement && root.requestFullscreen) {
      await root.requestFullscreen();
    }
  } catch (_) { /* user gesture required, etc. — ignore */ }
  try {
    if ('wakeLock' in navigator && !window.__wakeLock) {
      window.__wakeLock = await navigator.wakeLock.request('screen');
      window.__wakeLock.addEventListener('release', () => { window.__wakeLock = null; });
    }
  } catch (_) { /* ignore */ }
  const btn = document.getElementById('kiosk-fs-btn');
  if (btn) btn.textContent = 'Awake · Fullscreen';
}

/* If the screen comes back from being hidden (user switched tabs and
 * returned), re-acquire the wake lock — the spec releases it on hide. */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  const view = document.getElementById('kiosk-view');
  if (view && view.classList.contains('active') && 'wakeLock' in navigator) {
    navigator.wakeLock.request('screen')
      .then((lock) => { window.__wakeLock = lock; })
      .catch(() => {});
  }
});

function emailKioskLink() {
  const service = getService();
  const subject = `Today's Worship · ${service.church || ''}`.trim();
  const body =
    `Open this link on your tablet (or any phone) to display today's QR code for the congregation:\n\n` +
    kioskUrl() + `\n\n` +
    `Anyone who scans the code lands on the worship page:\n` + publicUrl() + `\n\n` +
    `---\n` +
    `Want to show the lyrics on a TV instead?\n\n` +
    `• Chromecast: open ${publicUrl()} in Chrome, then ⋮ → Cast → pick your TV.\n` +
    `• Apple TV: open the link on an iPad, swipe down for Control Center → Screen Mirroring → pick your Apple TV.\n` +
    `• HDMI: plug a laptop, phone, or tablet into the TV with a cable; the worship page appears on screen.`;
  window.location.href =
    `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/* Refresh the worship view when the user returns to the tab.
 *
 * Right now this just re-renders from localStorage (essentially a no-op
 * since nothing changes locally). When the Supabase backend lands, this
 * is the spot for stale-while-revalidate: keep showing the cached service
 * immediately, fetch fresh data in the background, swap it in if the
 * fetch succeeds. Scoped to the public view only — admins shouldn't have
 * their draft blown away if they switch tabs mid-edit. */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  const view = document.getElementById('worship-view');
  if (!view || !view.classList.contains('active')) return;
  renderWorship();
});

/* ---------- boot ---------- */

route();
