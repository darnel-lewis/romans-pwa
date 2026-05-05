/* Today's Worship — demo
 *
 * Self-contained demo: auth and storage are mocked with localStorage so the
 * full flow (sign in → edit → publish → view) works without a backend.
 * Swap the auth/storage helpers for Supabase when ready.
 */

const STORAGE_KEYS = {
  session: 'worship.session',
  items: 'worship.items.v2',
};

const ITEM_TYPES = {
  song: {
    label: 'Song',
    titlePlaceholder: 'Song title',
    metaLabel: 'Artist (optional)',
    metaPlaceholder: 'e.g. Hillsong',
    bodyLabel: 'Lyrics',
    bodyPlaceholder: 'Paste lyrics here. Separate stanzas with a blank line.',
  },
  scripture: {
    label: 'Scripture',
    titlePlaceholder: 'e.g. John 3:16–21',
    metaLabel: 'Translation (optional)',
    metaPlaceholder: 'e.g. ESV',
    bodyLabel: 'Verse text',
    bodyPlaceholder: 'Paste the passage here.',
  },
  note: {
    label: 'Note',
    titlePlaceholder: 'e.g. Welcome & Announcements',
    metaLabel: '',
    metaPlaceholder: '',
    bodyLabel: 'Body',
    bodyPlaceholder: 'Anything you want the congregation to read — announcements, prayer focus, communion instructions.',
  },
};

const SEED_ITEMS = [
  {
    type: 'note',
    title: 'Welcome',
    meta: '',
    body: "Welcome to worship this Sunday. Whether you're here for the first time or the hundredth, we're so glad you're with us.",
  },
  {
    type: 'song',
    title: 'Great Is Thy Faithfulness',
    meta: 'Thomas Chisholm',
    body:
      "Great is Thy faithfulness, O God my Father\n" +
      "There is no shadow of turning with Thee\n" +
      "Thou changest not, Thy compassions, they fail not\n" +
      "As Thou hast been Thou forever wilt be\n\n" +
      "Great is Thy faithfulness! Great is Thy faithfulness!\n" +
      "Morning by morning new mercies I see\n" +
      "All I have needed Thy hand hath provided\n" +
      "Great is Thy faithfulness, Lord, unto me!",
  },
  {
    type: 'scripture',
    title: 'Romans 8:38–39',
    meta: 'ESV',
    body:
      "For I am sure that neither death nor life, nor angels nor rulers, nor things present nor things to come, nor powers, nor height nor depth, nor anything else in all creation, will be able to separate us from the love of God in Christ Jesus our Lord.",
  },
  {
    type: 'song',
    title: 'In Christ Alone',
    meta: 'Stuart Townend & Keith Getty',
    body:
      "In Christ alone my hope is found\n" +
      "He is my light, my strength, my song\n" +
      "This Cornerstone, this solid Ground\n" +
      "Firm through the fiercest drought and storm\n\n" +
      "What heights of love, what depths of peace\n" +
      "When fears are stilled, when strivings cease\n" +
      "My Comforter, my All in All\n" +
      "Here in the love of Christ I stand",
  },
];

/* ---------- storage helpers ---------- */

function getItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.items);
    if (!raw) return SEED_ITEMS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_ITEMS;
  } catch {
    return SEED_ITEMS;
  }
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEYS.items, JSON.stringify(items));
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

  document.getElementById('worship-view').classList.add('active');
  renderWorship();
}

window.addEventListener('hashchange', route);

/* ---------- public worship view ---------- */

function formatToday() {
  const d = new Date();
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function renderBody(text) {
  const stanzas = (text || '').split(/\n\s*\n/);
  return stanzas
    .map((s) => `<div class="stanza">${escapeHtml(s)}</div>`)
    .join('');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, '&quot;');
}

function renderWorship() {
  const dateEl = document.getElementById('today-date');
  if (dateEl) dateEl.textContent = formatToday();

  const items = getItems();
  const container = document.getElementById('songs');

  if (!items.length) {
    container.innerHTML = `<div class="empty">Nothing has been added yet.</div>`;
    return;
  }

  container.innerHTML = items
    .map(
      (item) => `
        <article class="item item-${item.type}">
          <h2 class="item-title">${escapeHtml(item.title || 'Untitled')}</h2>
          ${item.meta ? `<div class="item-meta">${escapeHtml(item.meta)}</div>` : ''}
          <div class="item-body">${renderBody(item.body)}</div>
        </article>
      `,
    )
    .join('');
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
    setTimeout(() => {
      location.hash = 'admin';
    }, 600);
  }, 700);
});

/* ---------- admin view ---------- */

const editor = () => document.getElementById('song-editor');

let draft = [];

function renderAdmin() {
  const session = getSession();
  document.getElementById('signed-in-as').textContent = session ? session.email : '';
  draft = JSON.parse(JSON.stringify(getItems()));
  if (!draft.length) draft.push(emptyItem('song'));
  paintEditor();
}

function emptyItem(type) {
  return { type, title: '', meta: '', body: '' };
}

function paintEditor() {
  editor().innerHTML = draft
    .map((item, i) => {
      const cfg = ITEM_TYPES[item.type] || ITEM_TYPES.song;
      const last = i === draft.length - 1;
      const first = i === 0;
      return `
        <div class="item-card" data-index="${i}">
          <div class="item-card-head">
            <span class="item-card-num">${cfg.label} · ${i + 1}</span>
            <div class="item-card-actions">
              <button type="button" class="icon-btn" data-action="up" data-index="${i}" ${first ? 'disabled' : ''} aria-label="Move up">↑</button>
              <button type="button" class="icon-btn" data-action="down" data-index="${i}" ${last ? 'disabled' : ''} aria-label="Move down">↓</button>
              <button type="button" class="remove-btn" data-action="remove" data-index="${i}">Remove</button>
            </div>
          </div>

          <label for="title-${i}">Title</label>
          <input type="text" id="title-${i}" data-field="title" data-index="${i}" value="${escapeAttr(item.title)}" placeholder="${escapeAttr(cfg.titlePlaceholder)}">

          ${
            cfg.metaLabel
              ? `
                <label for="meta-${i}">${escapeHtml(cfg.metaLabel)}</label>
                <input type="text" id="meta-${i}" data-field="meta" data-index="${i}" value="${escapeAttr(item.meta)}" placeholder="${escapeAttr(cfg.metaPlaceholder)}">
              `
              : ''
          }

          <label for="body-${i}">${escapeHtml(cfg.bodyLabel)}</label>
          <textarea id="body-${i}" data-field="body" data-index="${i}" placeholder="${escapeAttr(cfg.bodyPlaceholder)}">${escapeHtml(item.body)}</textarea>
        </div>
      `;
    })
    .join('');
}

document.addEventListener('input', (e) => {
  const t = e.target;
  if (!t.dataset || !t.dataset.field) return;
  const i = Number(t.dataset.index);
  draft[i][t.dataset.field] = t.value;
});

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-action]');
  if (!t) return;
  const i = Number(t.dataset.index);
  const action = t.dataset.action;

  if (action === 'remove') {
    draft.splice(i, 1);
    if (!draft.length) draft.push(emptyItem('song'));
    paintEditor();
  } else if (action === 'up' && i > 0) {
    [draft[i - 1], draft[i]] = [draft[i], draft[i - 1]];
    paintEditor();
  } else if (action === 'down' && i < draft.length - 1) {
    [draft[i + 1], draft[i]] = [draft[i], draft[i + 1]];
    paintEditor();
  } else if (action === 'add') {
    const type = t.dataset.type || 'song';
    draft.push(emptyItem(type));
    paintEditor();
    const last = editor().querySelector('.item-card:last-child input');
    if (last) last.focus();
  }
});

document.getElementById('save-btn').addEventListener('click', () => {
  const cleaned = draft
    .map((s) => ({
      type: s.type || 'song',
      title: (s.title || '').trim(),
      meta: (s.meta || '').trim(),
      body: (s.body || '').trim(),
    }))
    .filter((s) => s.title || s.body);

  saveItems(cleaned);
  const msg = document.getElementById('save-message');
  msg.textContent = `Saved ${cleaned.length} item${cleaned.length === 1 ? '' : 's'}.`;
  setTimeout(() => {
    msg.textContent = '';
  }, 2400);
});

document.getElementById('logout-btn').addEventListener('click', () => {
  setSession(null);
  location.hash = '';
});

/* ---------- boot ---------- */

route();
