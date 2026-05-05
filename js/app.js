/* Today's Worship — demo
 *
 * This is a self-contained demo. Auth and storage are mocked with localStorage
 * so you can try the full flow (sign in → edit → publish → view) without a
 * backend. Swap the auth/storage helpers for Supabase when ready.
 */

const STORAGE_KEYS = {
  session: 'worship.session',
  songs: 'worship.songs',
};

const SEED_SONGS = [
  {
    title: 'Great Is Thy Faithfulness',
    artist: 'Thomas Chisholm',
    lyrics:
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
    title: 'In Christ Alone',
    artist: 'Stuart Townend & Keith Getty',
    lyrics:
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

function getSongs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.songs);
    if (!raw) return SEED_SONGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_SONGS;
  } catch {
    return SEED_SONGS;
  }
}

function saveSongs(songs) {
  localStorage.setItem(STORAGE_KEYS.songs, JSON.stringify(songs));
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

function renderLyrics(text) {
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

function renderWorship() {
  const dateEl = document.getElementById('today-date');
  if (dateEl) dateEl.textContent = formatToday();

  const songs = getSongs();
  const container = document.getElementById('songs');

  if (!songs.length) {
    container.innerHTML = `<div class="empty">No songs added yet.</div>`;
    return;
  }

  container.innerHTML = songs
    .map(
      (song) => `
        <article class="song">
          <h2 class="song-title">${escapeHtml(song.title || 'Untitled')}</h2>
          ${song.artist ? `<div class="song-meta">${escapeHtml(song.artist)}</div>` : ''}
          <div class="song-lyrics">${renderLyrics(song.lyrics)}</div>
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

  // In production: call supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: ... } })
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
  draft = JSON.parse(JSON.stringify(getSongs()));
  if (!draft.length) draft.push(emptySong());
  paintEditor();
}

function emptySong() {
  return { title: '', artist: '', lyrics: '' };
}

function paintEditor() {
  editor().innerHTML = draft
    .map(
      (song, i) => `
        <div class="song-card" data-index="${i}">
          <div class="song-card-head">
            <span class="song-card-num">Song ${i + 1}</span>
            <button type="button" class="remove-btn" data-action="remove" data-index="${i}">Remove</button>
          </div>
          <label for="title-${i}">Title</label>
          <input type="text" id="title-${i}" data-field="title" data-index="${i}" value="${escapeAttr(song.title)}" placeholder="Song title">

          <label for="artist-${i}">Artist (optional)</label>
          <input type="text" id="artist-${i}" data-field="artist" data-index="${i}" value="${escapeAttr(song.artist)}" placeholder="e.g. Hillsong">

          <label for="lyrics-${i}">Lyrics</label>
          <textarea id="lyrics-${i}" data-field="lyrics" data-index="${i}" placeholder="Paste lyrics here. Separate stanzas with a blank line.">${escapeHtml(song.lyrics)}</textarea>
        </div>
      `,
    )
    .join('');
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, '&quot;');
}

document.addEventListener('input', (e) => {
  const t = e.target;
  if (!t.dataset || !t.dataset.field) return;
  const i = Number(t.dataset.index);
  draft[i][t.dataset.field] = t.value;
});

document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.dataset && t.dataset.action === 'remove') {
    const i = Number(t.dataset.index);
    draft.splice(i, 1);
    if (!draft.length) draft.push(emptySong());
    paintEditor();
  }
});

document.getElementById('add-song-btn').addEventListener('click', () => {
  draft.push(emptySong());
  paintEditor();
  const last = editor().querySelector('.song-card:last-child input');
  if (last) last.focus();
});

document.getElementById('save-btn').addEventListener('click', () => {
  const cleaned = draft
    .map((s) => ({
      title: (s.title || '').trim(),
      artist: (s.artist || '').trim(),
      lyrics: (s.lyrics || '').trim(),
    }))
    .filter((s) => s.title || s.lyrics);

  saveSongs(cleaned);
  const msg = document.getElementById('save-message');
  msg.textContent = `Saved ${cleaned.length} song${cleaned.length === 1 ? '' : 's'}.`;
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
