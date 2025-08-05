// === CONFIG ===
const SUPABASE_URL = 'https://bvvlqbtwqetltdcvioie.supabase.co/rest/v1';
const SUPABASE_APIKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmxxYnR3cWV0bHRkY3Zpb2llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMjM4MzMsImV4cCI6MjA2OTU5OTgzM30.d-leDFpzc6uxDvq47_FC0Fqh0ztaL11Oozm-z6T9N_M';
const MY_TWEET_URL = 'https://x.com/yourtweet/status/123456789';

// Reserved domains logic
const reserved = [
  { domains: ['0xkaiserkarel', 'kaiserkarel', 'karel'], exception: '0xkaiserkarel' },
  { domains: ['corcoder', 'cor'], exception: 'corcoder' },
  { domains: ['emir beriker', 'e_beriker'], exception: 'e_beriker' },
  { domains: ['shinosuka'], exception: 'shinosuka_eth' }
];

// === ELEMENTS ===
const landingBox = document.getElementById('landing-box');
const congratsBox = document.getElementById('congrats-box');
const statsBox = document.getElementById('stats-box');
const domainEntrySection = document.getElementById('domain-entry-section');
const secureBtn = document.getElementById('secure-btn');
const toast = document.getElementById('toast');
const confettiCanvas = document.getElementById('confetti-canvas');
const congratsTitle = document.getElementById('congrats-title');
const shareBtn = document.getElementById('share-btn');
const tryBtn = document.getElementById('try-btn');
const goBackBtn = document.getElementById('go-back-btn');
const statsDomain = document.getElementById('stats-domain');
const statS0 = document.getElementById('stat-s0');
const statS1 = document.getElementById('stat-s1');
const statLevel = document.getElementById('stat-level');
const statXp = document.getElementById('stat-xp');
const userPfp = document.getElementById('user-pfp');

// === RENDER DOMAIN ENTRY FIELDS ===
function renderDomainEntry() {
  domainEntrySection.innerHTML = `
    <label class="input-label" for="x-username">Your X Username</label>
    <input id="x-username" class="domain-input" autocomplete="off" placeholder="e.g. union_build" maxlength="30" spellcheck="false">
    <label class="input-label" for="union-domain">Your Union Domain</label>
    <div class="domain-entry-row">
      <input id="union-domain" class="domain-input" autocomplete="off" placeholder="yourname" maxlength="24" spellcheck="false">
      <span class="domain-suffix">.union</span>
    </div>
  `;

  // Restrict allowed characters
  document.getElementById('union-domain').addEventListener('input', e => {
    let v = e.target.value;
    v = v.replace(/[^a-zA-Z0-9_]/g, '');
    e.target.value = v;
  });

  document.getElementById('x-username').addEventListener('input', e => {
    let v = e.target.value;
    v = v.replace(/[^\w\d_]/g, '');
    e.target.value = v;
  });
}
renderDomainEntry();

// === TOAST (FOR ERRORS & NOTIFY) ===
function showToast(msg, duration = 2200) {
  toast.innerText = msg;
  toast.style.display = 'block';
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { toast.style.display = 'none'; }, 420);
  }, duration);
}

// === DOMAIN CHECK LOGIC ===
function domainTaken(domain, xUser) {
  domain = (domain || '').toLowerCase();
  xUser = (xUser || '').toLowerCase();

  // Reserved block
  for (const row of reserved) {
    for (const d of row.domains) {
      if (domain === d.toLowerCase()) {
        if (xUser === row.exception.toLowerCase()) return false;
        return true;
      }
    }
  }
  // Check all domains in localStorage
  const all = JSON.parse(localStorage.getItem('union_domains') || '{}');
  if (all[domain]) {
    if (all[domain] === xUser) return false; // If user already owns it, allow re-use
    return true;
  }
  return false;
}

function assignDomain(domain, xUser) {
  let all = JSON.parse(localStorage.getItem('union_domains') || '{}');
  all[domain.toLowerCase()] = xUser.toLowerCase();
  localStorage.setItem('union_domains', JSON.stringify(all));
  // Also store the user's latest .union
  localStorage.setItem('union_last_domain', JSON.stringify({
    domain: domain,
    xUser: xUser
  }));
}

// === CONFETTI EFFECT ===
function launchConfetti(times = 5) {
  const canvas = confettiCanvas;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';

  const ctx = canvas.getContext('2d');
  const colors = ['#A9ECFD', '#fff', '#52C1E6', '#82e3fc'];
  let confetti = [];
  for (let t = 0; t < times; t++) {
    for (let i = 0; i < 56; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -100 - 30,
        w: 7 + Math.random() * 8,
        h: 15 + Math.random() * 18,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: -2 + Math.random() * 4,
        vy: 3 + Math.random() * 4.5,
        alpha: 0.75 + Math.random() * 0.18,
        angle: Math.random() * Math.PI
      });
    }
  }
  let running = true;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach(c => {
      ctx.save();
      ctx.globalAlpha = c.alpha;
      ctx.translate(c.x, c.y);
      ctx.rotate(c.angle);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.w/2, -c.h/2, c.w, c.h);
      ctx.restore();

      c.x += c.vx;
      c.y += c.vy;
      c.angle += 0.03 + Math.random() * 0.02;
      if (c.y > canvas.height + 90) c.alpha = 0;
    });
    confetti = confetti.filter(c => c.alpha > 0);
    if (confetti.length && running) requestAnimationFrame(draw);
    else canvas.style.display = 'none';
  }
  draw();
  setTimeout(() => { running = false; canvas.style.display = 'none'; }, 1400);
}

// === SECURE BUTTON CLICK ===
secureBtn.onclick = function () {
  const xUser = (document.getElementById('x-username').value || '').trim();
  const unionDomain = (document.getElementById('union-domain').value || '').trim();

  // Validate
  if (!xUser || !unionDomain) {
    showToast('Please fill both X username and Union domain.');
    return;
  }
  if (unionDomain.length < 2 || xUser.length < 2) {
    showToast('Minimum 2 characters required.');
    return;
  }
  if (domainTaken(unionDomain, xUser)) {
    showToast('This Union Domain has already been taken, try again');
    return;
  }

  assignDomain(unionDomain, xUser);

  // Show congrats
  landingBox.style.display = 'none';
  launchConfetti(5);
  congratsBox.style.display = 'flex';

  // Set congrats text
  congratsTitle.innerHTML = `Congratulations <span style="color:#A9ECFD">${unionDomain}.union</span> is Yours! 🎉`;

  // Save for sharing/stats
  congratsBox.dataset.domain = unionDomain;
  congratsBox.dataset.xuser = xUser;
};

// === SHARE BUTTON ===
shareBtn.onclick = function () {
  const domain = congratsBox.dataset.domain;
  let tweet =
    `Just secured ${domain}.union on Union Domain Service Model. 🎉\n\n` +
    `Secure yours now: union-domain.vercel.app\n\n` +
    `In future you'll be able to recieve any crypto coin from any blockchain by just entering this. Interop at its peak!\n\n` +
    `${MY_TWEET_URL}`;
  const intent =
    'https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweet);
  window.open(intent, '_blank');
};

// === TRY USE CASE BUTTON ===
tryBtn.onclick = async function () {
  congratsBox.style.display = 'none';
  statsBox.style.display = 'flex';
  // Show loading state
  statsDomain.innerHTML = `<span style="font-size:1.07rem;color:#bbb;">Loading...</span>`;
  statS0.textContent = '';
  statS1.textContent = '';
  statLevel.textContent = '';
  statXp.textContent = '';
  userPfp.src = '';

  // Fetch stats (Supabase logic)
  const domain = congratsBox.dataset.domain;
  const xUser = congratsBox.dataset.xuser;
  await fetchStatsForUser(xUser, domain);
};

// === GO BACK BUTTON ===
goBackBtn.onclick = function () {
  statsBox.style.display = 'none';
  congratsBox.style.display = 'flex';
};

// === FETCH USER STATS (SUPABASE, LIKE YOUR SCRIPT) ===
async function fetchStatsForUser(username, domain) {
  let user = null;
  let url, response, users;

  // 1. display_name ilike (exact)
  url = `${SUPABASE_URL}/leaderboard_full_0208?display_name=ilike.${username}`;
  response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_APIKEY,
      'Authorization': `Bearer ${SUPABASE_APIKEY}`,
      'Content-Type': 'application/json',
    }
  });
  if (response.ok) {
    users = await response.json();
    if (users && users.length > 0) {
      user = users.find(u => (u.display_name || '').toLowerCase() === username.toLowerCase()) || null;
    }
  }
  // 2. username ilike (exact)
  if (!user) {
    url = `${SUPABASE_URL}/leaderboard_full_0208?username=ilike.${username}`;
    response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_APIKEY,
        'Authorization': `Bearer ${SUPABASE_APIKEY}`,
        'Content-Type': 'application/json',
      }
    });
    if (response.ok) {
      users = await response.json();
      if (users && users.length > 0) {
        user = users.find(u => (u.username || '').toLowerCase() === username.toLowerCase()) || null;
      }
    }
  }
  // 3. display_name ilike (partial)
  if (!user) {
    url = `${SUPABASE_URL}/leaderboard_full_0208?display_name=ilike.%${username}%`;
    response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_APIKEY,
        'Authorization': `Bearer ${SUPABASE_APIKEY}`,
        'Content-Type': 'application/json',
      }
    });
    if (response.ok) {
      users = await response.json();
      if (users && users.length > 0) {
        user = users[0];
      }
    }
  }
  // 4. username ilike (partial)
  if (!user) {
    url = `${SUPABASE_URL}/leaderboard_full_0208?username=ilike.%${username}%`;
    response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_APIKEY,
        'Authorization': `Bearer ${SUPABASE_APIKEY}`,
        'Content-Type': 'application/json',
      }
    });
    if (response.ok) {
      users = await response.json();
      if (users && users.length > 0) {
        user = users[0];
      }
    }
  }

  // If user not found
  if (!user) {
    statsDomain.innerHTML = `<span style="color:#ff4f6d;">User not found on Union Testnet</span>`;
    userPfp.src = '';
    statS0.textContent = '-';
    statS1.textContent = '-';
    statLevel.textContent = '-';
    statXp.textContent = '-';
    return;
  }

  // Mindshare S1
  let usernameOrDisplay = user.username || user.display_name;
  let mindshare_s1 = '-';
  let yapsUrl = `${SUPABASE_URL}/yaps_season_one?username=eq.${encodeURIComponent(usernameOrDisplay)}`;
  let yapsRes = await fetch(yapsUrl, {
    headers: {
      'apikey': SUPABASE_APIKEY,
      'Authorization': `Bearer ${SUPABASE_APIKEY}`,
      'Content-Type': 'application/json',
    }
  });
  let yapsData = yapsRes.ok ? await yapsRes.json() : [];
  if (!yapsData.length) {
    yapsUrl = `${SUPABASE_URL}/yaps_season_one?username=ilike.%25${usernameOrDisplay}%25`;
    yapsRes = await fetch(yapsUrl, {
      headers: {
        'apikey': SUPABASE_APIKEY,
        'Authorization': `Bearer ${SUPABASE_APIKEY}`,
        'Content-Type': 'application/json',
      }
    });
    yapsData = yapsRes.ok ? await yapsRes.json() : [];
  }
  if (yapsData.length) {
    let found = yapsData.find(d => (d.username || '').toLowerCase() === usernameOrDisplay.toLowerCase()) || yapsData[0];
    let mindshareVal = null;
    if (found && found.jsonInput) {
      try {
        const json = typeof found.jsonInput === 'string' ? JSON.parse(found.jsonInput) : found.jsonInput;
        if (json.mindshare !== undefined && json.mindshare !== null) {
          mindshareVal = json.mindshare;
        }
      } catch (e) { }
    }
    if (typeof mindshareVal === 'string') {
      mindshareVal = mindshareVal.replace('%', '').trim();
    }
    if (mindshareVal !== null && !isNaN(mindshareVal)) {
      let num = parseFloat(mindshareVal);
      mindshare_s1 = (num < 1) ? (num * 100).toFixed(2) : num.toFixed(2);
    } else if (mindshareVal !== null) {
      let num = parseFloat(String(mindshareVal).replace(',', '.'));
      if (!isNaN(num)) {
        mindshare_s1 = (num < 1) ? (num * 100).toFixed(2) : num.toFixed(2);
      }
    }
  }

  // Mindshare S0
  let mindshare_s0 = '-';
  let yapsZeroUrl = `${SUPABASE_URL}/yaps_season_zero?username=eq.${encodeURIComponent(usernameOrDisplay)}`;
  let yapsZeroRes = await fetch(yapsZeroUrl, {
    headers: {
      'apikey': SUPABASE_APIKEY,
      'Authorization': `Bearer ${SUPABASE_APIKEY}`,
      'Content-Type': 'application/json',
    }
  });
  let yapsZeroData = yapsZeroRes.ok ? await yapsZeroRes.json() : [];
  if (!yapsZeroData.length) {
    yapsZeroUrl = `${SUPABASE_URL}/yaps_season_zero?username=ilike.%25${usernameOrDisplay}%25`;
    yapsZeroRes = await fetch(yapsZeroUrl, {
      headers: {
        'apikey': SUPABASE_APIKEY,
        'Authorization': `Bearer ${SUPABASE_APIKEY}`,
        'Content-Type': 'application/json',
      }
    });
    yapsZeroData = yapsZeroRes.ok ? await yapsZeroRes.json() : [];
  }
  if (yapsZeroData.length) {
    let found0 = yapsZeroData.find(d => (d.username || '').toLowerCase() === usernameOrDisplay.toLowerCase()) || yapsZeroData[0];
    let mindshareVal0 = null;
    if (found0 && found0.jsonInput) {
      try {
        const json = typeof found0.jsonInput === 'string' ? JSON.parse(found0.jsonInput) : found0.jsonInput;
        if (json.mindshare !== undefined && json.mindshare !== null) {
          mindshareVal0 = json.mindshare;
        }
      } catch (e) { }
    }
    if (typeof mindshareVal0 === 'string') {
      mindshareVal0 = mindshareVal0.replace('%', '').trim();
    }
    if (mindshareVal0 !== null && !isNaN(mindshareVal0)) {
      let num0 = parseFloat(mindshareVal0);
      mindshare_s0 = num0.toFixed(2);
    } else if (mindshareVal0 !== null) {
      let num0 = parseFloat(String(mindshareVal0).replace(',', '.'));
      if (!isNaN(num0)) {
        mindshare_s0 = num0.toFixed(2);
      }
    }
  }

  // User info
  let pfp = user.pfp;
  let total_xp = user.total_xp;
  let level = user.level;
  let title = user.title;
  if (user.jsonInput) {
    try {
      const json = typeof user.jsonInput === 'string' ? JSON.parse(user.jsonInput) : user.jsonInput;
      pfp = json.pfp || pfp;
      total_xp = json.total_xp || total_xp;
      level = json.level || level;
      title = json.title || title;
    } catch (e) {}
  }

  // Display to UI
  statsDomain.textContent = `${domain}.union`;
  userPfp.src = pfp ? pfp : 'https://cdn.stamp.fyi/avatar/' + (usernameOrDisplay ? encodeURIComponent(usernameOrDisplay) : 'union');
  statS0.textContent = mindshare_s0 !== undefined ? mindshare_s0 + '%' : '-';
  statS1.textContent = mindshare_s1 !== undefined ? mindshare_s1 + '%' : '-';
  statLevel.textContent = (level !== undefined && level !== null) ? level : '-';
  statXp.textContent = (total_xp !== undefined && total_xp !== null) ? total_xp : '-';
        }
