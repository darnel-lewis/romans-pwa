/* ============================================
   app.js — Navigation, Day Rendering, UI
   ============================================ */

// ---- Content Data for All 16 Days ----

const DAYS = [
  {
    day: 1,
    chapter: 'Romans 1',
    videoId: 'Fdlcthw9Zyo',
    intro: 'Paul opens his letter to Rome by declaring the gospel as the power of God for salvation — and warns that humanity\'s rejection of God leads to broken worship and broken living.',
    reflection: 'Paul says he is "not ashamed of the gospel." What situations in your own life make it hardest to be open about your faith?',
    memoryVerse: {
      type: 'new',
      reference: 'Romans 1:16–17',
      text: '"For I am not ashamed of the gospel, because it is the power of God for salvation to everyone who believes, first to the Jew, and also to the Greek. For in it the righteousness of God is revealed from faith to faith, just as it is written: The righteous will live by faith."'
    }
  },
  {
    day: 2,
    chapter: 'Romans 2',
    videoId: 'qyIZkztBg4o',
    intro: 'Paul turns the mirror on the morally upright — no one escapes God\'s judgment by judging others, because God\'s standard applies to everyone equally.',
    reflection: 'Where in your life are you most tempted to judge others for the very things you struggle with yourself?',
    memoryVerse: {
      type: 'review',
      reference: 'Romans 1:16–17',
      text: '"For I am not ashamed of the gospel, because it is the power of God for salvation to everyone who believes, first to the Jew, and also to the Greek. For in it the righteousness of God is revealed from faith to faith, just as it is written: The righteous will live by faith."'
    }
  },
  {
    day: 3,
    chapter: 'Romans 3',
    videoId: 'BGvGZi051_U',
    intro: 'Paul reaches his devastating conclusion: no one is righteous, not even one. But then he pivots — righteousness comes through faith in Jesus Christ, available to all.',
    reflection: 'How does Paul\'s argument that "all have sinned" (3:23) change the way you see other people — especially those you might consider "worse" than yourself?',
    memoryVerse: {
      type: 'review',
      reference: 'Romans 1:16–17',
      text: '"For I am not ashamed of the gospel, because it is the power of God for salvation to everyone who believes, first to the Jew, and also to the Greek. For in it the righteousness of God is revealed from faith to faith, just as it is written: The righteous will live by faith."'
    }
  },
  {
    day: 4,
    chapter: 'Romans 4',
    videoId: 'idPU3DaIaEQ',
    intro: 'Abraham believed God, and it was credited to him as righteousness — before circumcision, before the law. Paul uses this story to prove that faith, not works, is the basis of our standing with God.',
    reflection: 'Abraham trusted God\'s promise even when the circumstances looked impossible. What promise from God are you finding hardest to trust right now?',
    memoryVerse: null
  },
  {
    day: 5,
    chapter: 'Romans 5',
    videoId: 'LazkYitewY8',
    intro: 'Justified by faith, we have peace with God. Paul traces the story from Adam\'s sin to Christ\'s grace — where sin increased, grace overflowed all the more.',
    reflection: 'Paul says suffering produces endurance, endurance produces character, and character produces hope (5:3–4). Where have you seen this pattern in your own life?',
    memoryVerse: {
      type: 'review',
      reference: 'Romans 1:16–17',
      text: '"For I am not ashamed of the gospel, because it is the power of God for salvation to everyone who believes, first to the Jew, and also to the Greek. For in it the righteousness of God is revealed from faith to faith, just as it is written: The righteous will live by faith."'
    }
  },
  {
    day: 6,
    chapter: 'Romans 6',
    videoId: 'rMJj0zQ8gLo',
    intro: 'Should we keep sinning so grace can increase? Absolutely not. Paul says we died with Christ in baptism — we are now alive to God and free from sin\'s dominion.',
    reflection: 'Paul says we are no longer "slaves to sin" but have become "slaves to righteousness." What does freedom from sin actually look like in your daily life?',
    memoryVerse: {
      type: 'new',
      reference: 'Romans 6:23',
      text: '"For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord."'
    }
  },
  {
    day: 7,
    chapter: 'Romans 7',
    videoId: '4joeXU5zSmA',
    intro: 'Paul describes the inner war that every believer knows: "I do not do the good I want to do, but the evil I do not want to do — this I keep on doing." The law reveals sin but cannot defeat it.',
    reflection: 'Paul\'s honest confession in this chapter — wanting to do good but failing — is one of the most relatable passages in Scripture. Where does this tension show up most in your life?',
    memoryVerse: {
      type: 'review',
      reference: 'Romans 6:23',
      text: '"For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord."'
    }
  },
  {
    day: 8,
    chapter: 'Romans 8',
    videoId: 'xI5sLl7VBPU',
    intro: 'The pinnacle of the letter. No condemnation. The Spirit gives life. All things work together for good. Nothing can separate us from the love of God in Christ Jesus.',
    reflection: 'Romans 8 ends with the declaration that nothing can separate us from God\'s love. Which item in Paul\'s list (trouble, hardship, danger, etc.) feels most real to you right now?',
    memoryVerse: {
      type: 'new',
      reference: 'Romans 8:28',
      text: '"We know that all things work together for the good of those who love God, who are called according to his purpose."'
    }
  },
  {
    day: 9,
    chapter: 'Romans 9',
    videoId: 'hmCj7c93ATE',
    intro: 'Paul wrestles with the hardest question: why has Israel, God\'s chosen people, largely rejected the Messiah? His answer begins with God\'s sovereign freedom to show mercy as he chooses.',
    reflection: 'Paul expresses "great sorrow and unceasing grief" over his people who have not believed. Who in your life do you carry that kind of burden for?',
    memoryVerse: [
      {
        type: 'review',
        reference: 'Romans 1:16–17',
        text: '"For I am not ashamed of the gospel, because it is the power of God for salvation to everyone who believes, first to the Jew, and also to the Greek. For in it the righteousness of God is revealed from faith to faith, just as it is written: The righteous will live by faith."'
      },
      {
        type: 'review',
        reference: 'Romans 6:23',
        text: '"For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord."'
      }
    ]
  },
  {
    day: 10,
    chapter: 'Romans 10',
    videoId: 'dQJAyk5e4GI',
    intro: 'Salvation is near — on your lips and in your heart. Paul declares that everyone who calls on the name of the Lord will be saved, and asks: how can they hear without someone to tell them?',
    reflection: '"How beautiful are the feet of those who bring good news" (10:15). Who brought the good news to you? Have you ever thanked them?',
    memoryVerse: {
      type: 'review',
      reference: 'Romans 8:28',
      text: '"We know that all things work together for the good of those who love God, who are called according to his purpose."'
    }
  },
  {
    day: 11,
    chapter: 'Romans 11',
    videoId: 'fLTBQLgbSCA',
    intro: 'God has not rejected Israel. Paul uses the image of an olive tree — Gentile believers are wild branches grafted in, but the root remains. God\'s mercy will ultimately extend to all.',
    reflection: 'Paul warns against arrogance toward those who have not yet believed (11:18–22). Where might you be guilty of spiritual pride?',
    memoryVerse: [
      {
        type: 'review',
        reference: 'Romans 6:23',
        text: '"For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord."'
      },
      {
        type: 'review',
        reference: 'Romans 8:28',
        text: '"We know that all things work together for the good of those who love God, who are called according to his purpose."'
      }
    ]
  },
  {
    day: 12,
    chapter: 'Romans 12',
    videoId: '_4E024yklM4',
    intro: 'The letter shifts from theology to practice. Paul urges: offer your bodies as living sacrifices. Be transformed by the renewal of your mind. Use your gifts to serve. Love without hypocrisy.',
    reflection: 'Paul says to "not be conformed to this age, but be transformed by the renewing of your mind." What\'s one area of your thinking that you sense God is trying to reshape right now?',
    memoryVerse: {
      type: 'new',
      reference: 'Romans 12:2',
      text: '"Do not be conformed to this age, but be transformed by the renewing of your mind, so that you may discern what is the good, pleasing, and perfect will of God."'
    }
  },
  {
    day: 13,
    chapter: 'Romans 13',
    videoId: '6PBxbooQdoM',
    intro: 'Paul addresses life in society: respect governing authorities, pay what you owe, and above all, love your neighbor. The night is nearly over; the day is near.',
    reflection: '"Love does no wrong to a neighbor. Love, therefore, is the fulfillment of the law" (13:10). Who is a "neighbor" in your life that you\'ve been slow to love well?',
    memoryVerse: {
      type: 'review',
      reference: 'Romans 12:2',
      text: '"Do not be conformed to this age, but be transformed by the renewing of your mind, so that you may discern what is the good, pleasing, and perfect will of God."'
    }
  },
  {
    day: 14,
    chapter: 'Romans 14',
    videoId: 'lAyPop5RvqQ',
    intro: 'Don\'t judge your brother or sister over disputable matters — food, holy days, personal convictions. Each person stands before their own master. Pursue what makes for peace.',
    reflection: 'Where in your community do you see Christians dividing over issues that Paul might call "disputable matters"? How could you help pursue peace?',
    memoryVerse: [
      {
        type: 'review',
        reference: 'Romans 1:16–17',
        text: '"For I am not ashamed of the gospel, because it is the power of God for salvation to everyone who believes, first to the Jew, and also to the Greek. For in it the righteousness of God is revealed from faith to faith, just as it is written: The righteous will live by faith."'
      },
      {
        type: 'review',
        reference: 'Romans 8:28',
        text: '"We know that all things work together for the good of those who love God, who are called according to his purpose."'
      }
    ]
  },
  {
    day: 15,
    chapter: 'Romans 15',
    videoId: 'YVl5eXUMsj0',
    intro: 'The strong should bear with the weak. Christ did not please himself. Paul shares his missionary vision for Spain and asks the Roman church for their partnership and prayers.',
    reflection: 'Paul asks the Roman believers to pray for his mission (15:30–32). Who in your life is doing hard kingdom work and could use your prayers and support right now?',
    memoryVerse: [
      {
        type: 'review',
        reference: 'Romans 6:23',
        text: '"For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord."'
      },
      {
        type: 'review',
        reference: 'Romans 12:2',
        text: '"Do not be conformed to this age, but be transformed by the renewing of your mind, so that you may discern what is the good, pleasing, and perfect will of God."'
      }
    ]
  },
  {
    day: 16,
    chapter: 'Romans 16',
    videoId: 'D78Z5h7b2qM',
    intro: 'Paul closes with personal greetings — a beautiful window into the diverse early church. He names women and men, Jews and Gentiles, coworkers and friends. The gospel creates community.',
    reflection: 'Paul names over 25 people in his closing greetings. Faith is never solo. Who are the people God has placed around you that make your faith possible? Take a moment to thank God for them.',
    memoryVerse: [
      {
        type: 'review',
        reference: 'Romans 1:16–17',
        text: '"For I am not ashamed of the gospel, because it is the power of God for salvation to everyone who believes, first to the Jew, and also to the Greek. For in it the righteousness of God is revealed from faith to faith, just as it is written: The righteous will live by faith."'
      },
      {
        type: 'review',
        reference: 'Romans 6:23',
        text: '"For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord."'
      },
      {
        type: 'review',
        reference: 'Romans 8:28',
        text: '"We know that all things work together for the good of those who love God, who are called according to his purpose."'
      },
      {
        type: 'review',
        reference: 'Romans 12:2',
        text: '"Do not be conformed to this age, but be transformed by the renewing of your mind, so that you may discern what is the good, pleasing, and perfect will of God."'
      }
    ]
  }
];


// ---- App State ----
let currentScreen = 'loading'; // 'loading', 'auth', 'list', 'day'
let currentDay = null;


// ---- Initialization ----

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  showScreen('loading');

  // Listen for auth state changes
  onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
      if (session?.user) {
        currentUser = session.user;
        await ensureUserProfile(currentUser);
        await fetchProgress();
        renderDayList();
        showScreen('list');
      } else if (event === 'INITIAL_SESSION') {
        // No session on load
        showScreen('auth');
      }
    } else if (event === 'SIGNED_OUT') {
      completedDays = [];
      showScreen('auth');
    }
  });

  // Set up login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});


// ---- Screen Management ----

function showScreen(name) {
  currentScreen = name;
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  const screen = document.getElementById(name + '-screen');
  if (screen) {
    screen.classList.add('active');
  }
}


// ---- Auth Handlers ----

async function handleLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById('email-input');
  const msgEl = document.getElementById('auth-message');
  const submitBtn = document.getElementById('login-btn');

  const email = emailInput.value.trim();
  if (!email) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  msgEl.className = 'auth-message';
  msgEl.style.display = 'none';

  try {
    await sendMagicLink(email);
    msgEl.textContent = 'Check your email for a login link. You can close this tab.';
    msgEl.className = 'auth-message success';
    msgEl.style.display = 'block';
  } catch (err) {
    msgEl.textContent = err.message || 'Something went wrong. Please try again.';
    msgEl.className = 'auth-message error';
    msgEl.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Login Link';
  }
}

function handleLogout() {
  signOut();
}


// ---- Day List Rendering ----

function renderDayList() {
  const listEl = document.getElementById('day-list');
  const userNameEl = document.getElementById('user-display-name');
  const progressFill = document.getElementById('progress-fill');
  const progressLabel = document.getElementById('progress-label');

  // Update user display
  if (userNameEl && currentUser) {
    userNameEl.textContent = currentUser.email.split('@')[0];
  }

  // Update progress bar
  const count = getCompletedCount();
  const pct = Math.round((count / 16) * 100);
  if (progressFill) progressFill.style.width = pct + '%';
  if (progressLabel) progressLabel.textContent = count + ' of 16 days completed';

  // Render day items
  if (!listEl) return;
  listEl.innerHTML = '';

  DAYS.forEach(day => {
    const completed = isDayCompleted(day.day);
    const unlocked = isDayUnlocked(day.day);
    const locked = !unlocked;

    const li = document.createElement('li');
    li.className = 'day-item' + (completed ? ' completed' : unlocked ? ' unlocked' : ' locked');

    if (!locked) {
      li.addEventListener('click', () => navigateToDay(day.day));
    }

    li.innerHTML = `
      <div class="day-number">${day.day}</div>
      <div class="day-info">
        <div class="day-title">${day.chapter}</div>
        <div class="day-desc">${locked ? 'Complete previous days to unlock' : day.intro.substring(0, 60) + '...'}</div>
      </div>
      ${completed ? '<span class="day-check">&#10003;</span>' : locked ? '<span class="day-arrow">&#128274;</span>' : '<span class="day-arrow">&#8250;</span>'}
    `;

    listEl.appendChild(li);
  });
}


// ---- Day Detail Rendering ----

function navigateToDay(dayNumber) {
  const day = DAYS.find(d => d.day === dayNumber);
  if (!day || !isDayUnlocked(dayNumber)) return;

  currentDay = dayNumber;
  renderDayDetail(day);
  showScreen('day');
  window.scrollTo(0, 0);
}

function renderDayDetail(day) {
  const container = document.getElementById('day-content');
  if (!container) return;

  const completed = isDayCompleted(day.day);
  const verses = getMemoryVerseHTML(day);

  container.innerHTML = `
    <a class="back-link" onclick="navigateToList()">&#8249; Back to all days</a>

    <div class="day-header">
      <h2>Day ${day.day}: ${day.chapter}</h2>
      <div class="day-subtitle">Branch Together Reading Plan</div>
    </div>

    <div class="video-container">
      <iframe
        src="https://www.youtube.com/embed/${day.videoId}"
        title="${day.chapter} — Branch Together"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy"
      ></iframe>
    </div>

    <p class="chapter-intro">${day.intro}</p>

    ${verses}

    <div class="reflection-card">
      <div class="reflection-label">Reflect</div>
      <div class="reflection-text">${day.reflection}</div>
    </div>

    ${completed
      ? '<div class="day-completed-banner">&#10003; Day ' + day.day + ' completed</div>'
      : '<button class="btn btn-complete" id="mark-complete-btn" onclick="handleMarkComplete(' + day.day + ')">Mark Day ' + day.day + ' Complete</button>'
    }
  `;
}

function getMemoryVerseHTML(day) {
  if (!day.memoryVerse) return '';

  // Normalize to array
  const verses = Array.isArray(day.memoryVerse) ? day.memoryVerse : [day.memoryVerse];

  return verses.map(v => {
    if (v.type === 'new') {
      return `
        <div class="memory-verse-card">
          <div class="verse-label">&#9733; New Memory Verse</div>
          <div class="verse-reference">${v.reference}</div>
          <div class="verse-text">${v.text}</div>
        </div>
      `;
    } else {
      const cardId = 'review-' + v.reference.replace(/[\s:–]/g, '-');
      return `
        <div class="memory-verse-card review" id="${cardId}">
          <div class="verse-label">Review</div>
          <div class="verse-reference">${v.reference} — Can you recite this?</div>
          <button class="reveal-btn" onclick="revealVerse('${cardId}', this)">Reveal Verse</button>
          <div class="verse-text">${v.text}</div>
        </div>
      `;
    }
  }).join('');
}

function revealVerse(cardId, btn) {
  const card = document.getElementById(cardId);
  if (card) {
    card.classList.add('revealed');
    btn.style.display = 'none';
  }
}


// ---- Completion Handling ----

async function handleMarkComplete(dayNumber) {
  const btn = document.getElementById('mark-complete-btn');
  if (!btn) return;

  btn.disabled = true;
  btn.textContent = 'Saving...';

  const success = await markDayComplete(dayNumber);

  if (success) {
    btn.className = 'btn btn-complete completed';
    btn.textContent = '\u2713 Day ' + dayNumber + ' completed';
    btn.onclick = null;

    // If there's a next day, show a prompt
    if (dayNumber < 16) {
      const nextPrompt = document.createElement('div');
      nextPrompt.style.textAlign = 'center';
      nextPrompt.style.marginTop = '1rem';
      nextPrompt.innerHTML = `
        <a class="btn btn-secondary" onclick="navigateToDay(${dayNumber + 1})" style="cursor:pointer;">
          Continue to Day ${dayNumber + 1} &#8250;
        </a>
      `;
      btn.parentNode.appendChild(nextPrompt);
    } else {
      const congrats = document.createElement('div');
      congrats.style.textAlign = 'center';
      congrats.style.marginTop = '1.5rem';
      congrats.innerHTML = `
        <h3 style="margin-bottom:0.5rem;">You finished Romans!</h3>
        <p style="color:var(--text-muted);">Well done. The gospel is the power of God for salvation to everyone who believes.</p>
      `;
      btn.parentNode.appendChild(congrats);
    }
  } else {
    btn.disabled = false;
    btn.textContent = 'Mark Day ' + dayNumber + ' Complete';
  }
}


// ---- Navigation ----

function navigateToList() {
  currentDay = null;
  renderDayList();
  showScreen('list');
  window.scrollTo(0, 0);
}
