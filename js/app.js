/* Today's Worship — demo
 *
 * Data shape (per block):
 *   { kind: 'song',      title, attribution, stanzas: [{ type, lines[] }] }
 *   { kind: 'scripture', reference, verses: [{ n, text }] }
 *   { kind: 'note',      title, body: [paragraphs] }
 *
 * Auth and storage are mocked with localStorage so the full flow works
 * without a backend. Swap for Supabase when ready.
 */

const STORAGE_KEYS = {
  session: 'worship.session',
  service: 'worship.service.v3',
  prefs: 'worship.prefs.v1',
};

const SEED_SERVICE = {
  church: 'The Well',
  style: 'b',
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
      kind: 'scripture',
      reference: 'Isaiah 6:1–4',
      verses: [
        { n: 1, text: 'In the year that King Uzziah died I saw the Lord sitting upon a throne, high and lifted up; and the train of his robe filled the temple.' },
        { n: 2, text: 'Above him stood the seraphim. Each had six wings: with two he covered his face, and with two he covered his feet, and with two he flew.' },
        { n: 3, text: 'And one called to another and said: “Holy, holy, holy is the Lord of hosts; the whole earth is full of his glory!”' },
        { n: 4, text: 'And the foundations of the thresholds shook at the voice of him who called, and the house was filled with smoke.' },
      ],
    },
    {
      kind: 'note',
      title: 'A Word Before We Begin',
      body: [
        'This morning we gather not because we have it all together, but because He does. Let the songs we sing become prayers, and the silences between them, listening.',
        'If you are visiting, you belong here. If you are weary, you may rest. If you are joyful, sing loudly enough for the rest of us to remember why we came.',
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

function formatDateA() {
  const d = new Date();
  return d.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

function formatDateB() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const day = d.toLocaleDateString(undefined, { weekday: 'long' });
  return {
    iso: `${yyyy}.${mm}.${dd} / ${day.slice(0, 3).toUpperCase()}`,
    weekday: day,
    pretty: d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }),
  };
}

function miniLabel(b) {
  if (b.kind === 'song') return b.title;
  if (b.kind === 'scripture') return b.reference;
  return b.title;
}

function renderSong(b) {
  const stanzas = (b.stanzas || []).map((st) => `
    <div class="stanza ${st.type === 'chorus' ? 'chorus' : ''}">
      ${(st.lines || []).map((ln) => `<div>${esc(ln)}</div>`).join('')}
    </div>
  `).join('');
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

function renderScripture(b) {
  const verses = (b.verses || []).map((v) =>
    `<sup class="verse-num">${esc(v.n)}</sup>${esc(v.text)} `
  ).join('');
  return `
    <article class="block block-scripture">
      <div class="scripture-head">
        <h2 class="scripture-reference">${esc(b.reference || '')}</h2>
      </div>
      <p class="scripture-prose">${verses}</p>
    </article>
  `;
}

function renderNote(b) {
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

function renderBlock(b) {
  if (b.kind === 'song') return renderSong(b);
  if (b.kind === 'scripture') return renderScripture(b);
  if (b.kind === 'note') return renderNote(b);
  return '';
}

function renderWorship() {
  applyViewState();
  const service = getService();
  const style = service.style === 'b' ? 'b' : 'a';

  // top bar left: church name in B, church name in A (was already)
  const tbLeft = document.getElementById('topbar-left');
  tbLeft.textContent = service.church || '';

  // header
  const dateEl = document.getElementById('hdr-date');
  const churchEl = document.getElementById('hdr-church');
  if (style === 'b') {
    const d = formatDateB();
    dateEl.innerHTML = `<span>${esc(d.weekday)}</span><span>${esc(d.pretty)}</span>`;
    churchEl.textContent = 'Order of Service';
  } else {
    dateEl.textContent = formatDateA();
    churchEl.textContent = '';
  }

  // mini-nav (only displays in theme-b via CSS, but always populate so toggling works)
  const nav = document.getElementById('mini-nav');
  nav.innerHTML = (service.blocks || []).map((b, i) =>
    `<button class="mini-pill" data-jump="${i}">${esc(miniLabel(b))}</button>`
  ).join('');

  // blocks
  const container = document.getElementById('blocks');
  if (!service.blocks || !service.blocks.length) {
    container.innerHTML = `<div class="empty">Nothing has been added yet.</div>`;
  } else {
    container.innerHTML = service.blocks.map(renderBlock).join('');
  }

  // footer (custom text used by both styles; rendered with each variant's treatment)
  const footer = document.getElementById('worship-footer');
  const footerText = (service.footer || '').trim() || 'Soli Deo Gloria';
  if (style === 'b') {
    footer.innerHTML = `<span>${esc(footerText)}</span>`;
  } else {
    footer.innerHTML = `✶ ${esc(footerText)} ✶`;
  }

  setupMiniNavTracking();
}

/* Track active pill on scroll for theme B */
function setupMiniNavTracking() {
  const view = document.getElementById('worship-view');
  if (!view.classList.contains('theme-b')) return;

  const blocks = Array.from(document.querySelectorAll('#blocks .block'));
  const pills = Array.from(document.querySelectorAll('#mini-nav .mini-pill'));
  if (!blocks.length || !pills.length) return;

  const update = () => {
    const top = window.scrollY + 140;
    let idx = 0;
    blocks.forEach((el, i) => { if (el.offsetTop <= top) idx = i; });
    pills.forEach((p, i) => p.classList.toggle('active', i === idx));
  };
  update();
  window.removeEventListener('scroll', window.__miniNavTracker);
  window.__miniNavTracker = update;
  window.addEventListener('scroll', update, { passive: true });
}

/* Topbar + mini-nav handlers (delegated, attached once) */
document.addEventListener('click', (e) => {
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
    p.size = Math.min(2, (p.size ?? 1) + 1);
    savePrefs(p);
    applyViewState();
  } else if (action === 'size-down') {
    const p = getPrefs();
    p.size = Math.max(0, (p.size ?? 1) - 1);
    savePrefs(p);
    applyViewState();
  }
});

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
    metaLabel: '',
    metaPlaceholder: '',
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
  document.getElementById('footer-text').value = draft.footer || '';
  paintStylePicker();
  paintEditor();
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
    return { kind: 'scripture', title: b.reference || '', meta: '', body };
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
          <span class="item-card-num">${esc(cfg.label)} · ${i + 1}</span>
          <div class="item-card-actions">
            <button type="button" class="icon-btn" data-action="up" data-index="${i}" ${first ? 'disabled' : ''} aria-label="Move up">↑</button>
            <button type="button" class="icon-btn" data-action="down" data-index="${i}" ${last ? 'disabled' : ''} aria-label="Move down">↓</button>
            <button type="button" class="remove-btn" data-action="remove" data-index="${i}">Remove</button>
          </div>
        </div>

        <label for="title-${i}">${item.kind === 'scripture' ? 'Reference' : 'Title'}</label>
        <input type="text" id="title-${i}" data-field="title" data-index="${i}" value="${escAttr(item.title)}" placeholder="${escAttr(cfg.titlePlaceholder)}">

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
}

document.addEventListener('input', (e) => {
  const t = e.target;
  if (t && t.id === 'church-name') { draft.church = t.value; return; }
  if (t && t.id === 'footer-text') { draft.footer = t.value; return; }
  if (!t || !t.dataset || !t.dataset.field) return;
  const i = Number(t.dataset.index);
  draft.blocks[i][t.dataset.field] = t.value;
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
    footer: (draft.footer || '').trim(),
    blocks,
  });
  const msg = document.getElementById('save-message');
  msg.textContent = `Saved ${blocks.length} block${blocks.length === 1 ? '' : 's'}.`;
  setTimeout(() => { msg.textContent = ''; }, 2400);
});

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) logoutBtn.addEventListener('click', () => {
  setSession(null);
  location.hash = '';
});

/* ---------- boot ---------- */

route();
