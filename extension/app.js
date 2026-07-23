/* ================================================================
   Tab Out — Dashboard App (Pure Extension Edition)

   Architecture:
   1. UTILITIES      — escapeHtml, time formatting, greeting
   2. CONSTANTS      — domains map, icons, wallpapers, defaults
   3. STATE          — mutable runtime state
   4. CHROME APIs    — tabs, bookmarks, storage wrappers
   5. DOMAIN HELPERS  — title cleanup, friendly names, grouping
   6. UI HELPERS     — sound, confetti, toast, animations
   7. RENDERERS      — cards, chips, deferred list, quick links, panel
   8. EVENT DISPATCH — single click listener with action map
   9. INIT           — bootstrap
   ================================================================ */

'use strict';


/* ================================================================
   1. UTILITIES
   ================================================================ */

/**
 * escapeHtml(str)
 *
 * Escapes HTML special characters to prevent XSS when inserting
 * user-generated content (tab titles, bookmark names, URLs) into innerHTML.
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * escapeAttr(str)
 *
 * Escapes for use inside HTML attributes (double-quoted).
 * Same as escapeHtml but also handles newlines.
 */
function escapeAttr(str) {
  return escapeHtml(str).replace(/\n/g, '&#10;');
}

/**
 * timeAgo(dateStr)
 *
 * Converts an ISO date string into a human-friendly relative time.
 */
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const then = new Date(dateStr);
  const now  = new Date();
  const diffMins  = Math.floor((now - then) / 60000);
  const diffHours = Math.floor((now - then) / 3600000);
  const diffDays  = Math.floor((now - then) / 86400000);

  if (diffMins < 1)   return 'just now';
  if (diffMins < 60)  return diffMins + ' min ago';
  if (diffHours < 24) return diffHours + ' hr' + (diffHours !== 1 ? 's' : '') + ' ago';
  if (diffDays === 1) return 'yesterday';
  return diffDays + ' days ago';
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDateDisplay() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}


/* ================================================================
   2. CONSTANTS
   ================================================================ */

const DEFAULT_WALLPAPER = null;

const DEFAULT_QUICK_LINKS = [
  { id: 'default-1', name: 'Gmail',         url: 'https://mail.google.com' },
  { id: 'default-2', name: 'GitHub',        url: 'https://github.com' },
  { id: 'default-3', name: 'X',             url: 'https://x.com' },
  { id: 'default-4', name: '哔哩哔哩',       url: 'https://www.bilibili.com' },
  { id: 'default-5', name: 'Z-Library',     url: 'https://z-library.sk' },
  { id: 'default-6', name: '数字北外',       url: 'https://my.bfsu.edu.cn' },
  { id: 'default-7', name: 'Google Scholar', url: 'https://scholar.google.com' },
  { id: 'default-8', name: 'LinuxDo',       url: 'https://linux.do' },
  { id: 'default-9', name: '影视资源',       url: 'https://www.gying.net' },
];

const PRESET_WALLPAPERS = [
  { id: 'none',    label: 'None',        url: '' },
  { id: 'mountain',label: 'Mountain',    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80' },
  { id: 'ocean',   label: 'Ocean',       url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80' },
  { id: 'forest',  label: 'Forest',      url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80' },
  { id: 'sunset',  label: 'Sunset',      url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=80' },
  { id: 'night',   label: 'Night Sky',   url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80' },
  { id: 'minimal', label: 'Minimal',     url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80' },
  { id: 'aerial',  label: 'Aerial',      url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&q=80' },
  { id: 'aurora',  label: 'Aurora',      url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80' },
];

const FRIENDLY_DOMAINS = {
  'github.com':           'GitHub',
  'www.github.com':       'GitHub',
  'gist.github.com':      'GitHub Gist',
  'youtube.com':          'YouTube',
  'www.youtube.com':      'YouTube',
  'music.youtube.com':    'YouTube Music',
  'x.com':                'X',
  'www.x.com':            'X',
  'twitter.com':          'X',
  'www.twitter.com':      'X',
  'reddit.com':           'Reddit',
  'www.reddit.com':       'Reddit',
  'old.reddit.com':       'Reddit',
  'substack.com':         'Substack',
  'www.substack.com':     'Substack',
  'medium.com':           'Medium',
  'www.medium.com':       'Medium',
  'linkedin.com':         'LinkedIn',
  'www.linkedin.com':     'LinkedIn',
  'stackoverflow.com':    'Stack Overflow',
  'www.stackoverflow.com':'Stack Overflow',
  'news.ycombinator.com': 'Hacker News',
  'google.com':           'Google',
  'www.google.com':       'Google',
  'mail.google.com':      'Gmail',
  'docs.google.com':      'Google Docs',
  'drive.google.com':     'Google Drive',
  'calendar.google.com':  'Google Calendar',
  'meet.google.com':      'Google Meet',
  'gemini.google.com':    'Gemini',
  'chatgpt.com':          'ChatGPT',
  'www.chatgpt.com':      'ChatGPT',
  'chat.openai.com':      'ChatGPT',
  'claude.ai':            'Claude',
  'www.claude.ai':        'Claude',
  'code.claude.com':      'Claude Code',
  'notion.so':            'Notion',
  'www.notion.so':        'Notion',
  'figma.com':            'Figma',
  'www.figma.com':        'Figma',
  'slack.com':            'Slack',
  'app.slack.com':        'Slack',
  'discord.com':          'Discord',
  'www.discord.com':      'Discord',
  'wikipedia.org':        'Wikipedia',
  'en.wikipedia.org':     'Wikipedia',
  'amazon.com':           'Amazon',
  'www.amazon.com':       'Amazon',
  'netflix.com':          'Netflix',
  'www.netflix.com':      'Netflix',
  'spotify.com':          'Spotify',
  'open.spotify.com':     'Spotify',
  'vercel.com':           'Vercel',
  'www.vercel.com':       'Vercel',
  'npmjs.com':            'npm',
  'www.npmjs.com':        'npm',
  'developer.mozilla.org':'MDN',
  'arxiv.org':            'arXiv',
  'www.arxiv.org':        'arXiv',
  'huggingface.co':       'Hugging Face',
  'www.huggingface.co':   'Hugging Face',
  'producthunt.com':      'Product Hunt',
  'www.producthunt.com':  'Product Hunt',
  'xiaohongshu.com':      'RedNote',
  'www.xiaohongshu.com':  'RedNote',
  'bilibili.com':         'Bilibili',
  'www.bilibili.com':     'Bilibili',
  'space.bilibili.com':   'Bilibili',
  'manga.bilibili.com':   'Bilibili',
  'live.bilibili.com':    'Bilibili',
  'message.bilibili.com': 'Bilibili',
  't.bilibili.com':       'Bilibili',
  'local-files':          'Local Files',
};

const ICONS = {
  tabs:    `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8.25V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V8.25m-18 0V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6v2.25m-18 0h18" /></svg>`,
  close:   `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>`,
  archive: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>`,
  focus:   `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" /></svg>`,
};


/* ================================================================
   3. STATE
   ================================================================ */

let openTabs = [];
let domainGroups = [];
let settingsDrawerOpen = false;
let activeDrawerNav = "wallpaper";


/* ================================================================
   4. CHROME APIs — Tabs, Storage, Bookmarks
   ================================================================ */

/* --- Tabs --- */

async function fetchOpenTabs() {
  try {
    const extensionId = chrome.runtime.id;
    const newtabUrl = `chrome-extension://${extensionId}/index.html`;
    const tabs = await chrome.tabs.query({});
    openTabs = tabs.map(t => ({
      id: t.id, url: t.url, title: t.title,
      windowId: t.windowId, active: t.active,
      isTabOut: t.url === newtabUrl || t.url === 'chrome://newtab/',
    }));
  } catch { openTabs = []; }
}

async function closeTabsByUrls(urls) {
  if (!urls || urls.length === 0) return;
  const targetHostnames = [];
  const exactUrls = new Set();
  for (const u of urls) {
    if (u.startsWith('file://')) exactUrls.add(u);
    else { try { targetHostnames.push(new URL(u).hostname); } catch {} }
  }
  const allTabs = await chrome.tabs.query({});
  const toClose = allTabs.filter(tab => {
    const tabUrl = tab.url || '';
    if (tabUrl.startsWith('file://') && exactUrls.has(tabUrl)) return true;
    try { const h = new URL(tabUrl).hostname; return h && targetHostnames.includes(h); }
    catch { return false; }
  }).map(tab => tab.id);
  if (toClose.length > 0) await chrome.tabs.remove(toClose);
  await fetchOpenTabs();
}

async function closeTabsExact(urls) {
  if (!urls || urls.length === 0) return;
  const urlSet = new Set(urls);
  const allTabs = await chrome.tabs.query({});
  const toClose = allTabs.filter(t => urlSet.has(t.url)).map(t => t.id);
  if (toClose.length > 0) await chrome.tabs.remove(toClose);
  await fetchOpenTabs();
}

async function focusTab(url) {
  if (!url) return;
  const allTabs = await chrome.tabs.query({});
  const currentWindow = await chrome.windows.getCurrent();
  let matches = allTabs.filter(t => t.url === url);
  if (matches.length === 0) {
    try {
      const targetHost = new URL(url).hostname;
      matches = allTabs.filter(t => {
        try { return new URL(t.url).hostname === targetHost; } catch { return false; }
      });
    } catch {}
  }
  if (matches.length === 0) return;
  const match = matches.find(t => t.windowId !== currentWindow.id) || matches[0];
  await chrome.tabs.update(match.id, { active: true });
  await chrome.windows.update(match.windowId, { focused: true });
}

async function closeDuplicateTabs(urls, keepOne = true) {
  const allTabs = await chrome.tabs.query({});
  const toClose = [];
  for (const url of urls) {
    const matching = allTabs.filter(t => t.url === url);
    if (keepOne) {
      const keep = matching.find(t => t.active) || matching[0];
      for (const tab of matching) { if (tab.id !== keep.id) toClose.push(tab.id); }
    } else {
      for (const tab of matching) toClose.push(tab.id);
    }
  }
  if (toClose.length > 0) await chrome.tabs.remove(toClose);
  await fetchOpenTabs();
}

async function closeTabOutDupes() {
  const extensionId = chrome.runtime.id;
  const newtabUrl = `chrome-extension://${extensionId}/index.html`;
  const allTabs = await chrome.tabs.query({});
  const currentWindow = await chrome.windows.getCurrent();
  const tabOutTabs = allTabs.filter(t => t.url === newtabUrl || t.url === 'chrome://newtab/');
  if (tabOutTabs.length <= 1) return;
  const keep = tabOutTabs.find(t => t.active && t.windowId === currentWindow.id)
    || tabOutTabs.find(t => t.active) || tabOutTabs[0];
  const toClose = tabOutTabs.filter(t => t.id !== keep.id).map(t => t.id);
  if (toClose.length > 0) await chrome.tabs.remove(toClose);
  await fetchOpenTabs();
}

/* --- Saved for Later (chrome.storage.local) --- */

async function saveTabForLater(tab) {
  const { deferred = [] } = await chrome.storage.local.get('deferred');
  deferred.push({
    id: Date.now().toString(), url: tab.url, title: tab.title,
    savedAt: new Date().toISOString(), completed: false, dismissed: false,
  });
  await chrome.storage.local.set({ deferred });
}

async function getSavedTabs() {
  const { deferred = [] } = await chrome.storage.local.get('deferred');
  const visible = deferred.filter(t => !t.dismissed);
  return {
    active:   visible.filter(t => !t.completed),
    archived: visible.filter(t => t.completed),
  };
}

async function checkOffSavedTab(id) {
  const { deferred = [] } = await chrome.storage.local.get('deferred');
  const tab = deferred.find(t => t.id === id);
  if (tab) { tab.completed = true; tab.completedAt = new Date().toISOString(); await chrome.storage.local.set({ deferred }); }
}

async function dismissSavedTab(id) {
  const { deferred = [] } = await chrome.storage.local.get('deferred');
  const tab = deferred.find(t => t.id === id);
  if (tab) { tab.dismissed = true; await chrome.storage.local.set({ deferred }); }
}

/* --- Wallpaper (chrome.storage.local) --- */

async function getWallpaper() {
  const { wallpaper } = await chrome.storage.local.get('wallpaper');
  return wallpaper || DEFAULT_WALLPAPER;
}

async function setWallpaper(config) {
  if (config) await chrome.storage.local.set({ wallpaper: config });
  else await chrome.storage.local.remove('wallpaper');
  await applyWallpaper(config);
}

async function applyWallpaper(config) {
  if (!config || !config.value) {
    document.body.style.backgroundImage = '';
    document.body.classList.remove('has-wallpaper');
    document.body.style.removeProperty('--card-tint');
    document.body.style.removeProperty('--card-tint-text');
    return;
  }
  document.body.style.backgroundImage = `url("${config.value}")`;
  document.body.classList.add('has-wallpaper');
  try {
    const color = await extractDominantColor(config.value);
    if (color) {
      const { r, g, b } = color;
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const textAlpha = lum > 0.5 ? '0.85' : '0.95';
      const textR = lum > 0.5 ? '30' : '255';
      const textG = lum > 0.5 ? '26' : '253';
      const textB = lum > 0.5 ? '19' : '249';
      document.body.style.setProperty('--card-tint', `rgba(${r}, ${g}, ${b}, 0.25)`);
      document.body.style.setProperty('--card-tint-text', `rgba(${textR}, ${textG}, ${textB}, ${textAlpha})`);
      document.body.style.setProperty('--card-tint-overlay', `rgba(${r}, ${g}, ${b}, 0.12)`);
      document.body.style.setProperty('--card-tint-blur', lum > 0.5 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.08)');
      document.body.style.setProperty('--card-text-shadow', lum > 0.5 ? 'none' : '0 1px 4px rgba(0,0,0,0.3)');
      document.body.dataset.cardTheme = lum > 0.5 ? 'dark' : 'light';
    }
  } catch (e) { console.warn('[tab-out] Could not extract color:', e); }
}

function extractDominantColor(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 64;
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        let rTotal = 0, gTotal = 0, bTotal = 0, count = 0;
        for (let y = 0; y < size; y += 4) {
          for (let x = 0; x < size; x += 4) {
            const i = (y * size + x) * 4;
            rTotal += data[i]; gTotal += data[i + 1]; bTotal += data[i + 2]; count++;
          }
        }
        resolve({ r: Math.round(rTotal / count), g: Math.round(gTotal / count), b: Math.round(bTotal / count) });
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = src;
    setTimeout(() => resolve(null), 3000);
  });
}

/* --- Quick Links (chrome.storage.local) --- */

async function getQuickLinks() {
  const { quickLinks, quickLinksDefaultsVersion } = await chrome.storage.local.get(['quickLinks', 'quickLinksDefaultsVersion']);
  const CURRENT_VERSION = 'v2';
  if (!quickLinks || quickLinksDefaultsVersion !== CURRENT_VERSION) {
    await chrome.storage.local.set({ quickLinks: DEFAULT_QUICK_LINKS, quickLinksDefaultsVersion: CURRENT_VERSION });
    return DEFAULT_QUICK_LINKS;
  }
  return quickLinks;
}

async function setQuickLinks(links) { await chrome.storage.local.set({ quickLinks: links }); }

async function addQuickLink(name, url) {
  const links = await getQuickLinks();
  links.push({ id: Date.now().toString(), name, url });
  await setQuickLinks(links);
  return links;
}

async function removeQuickLink(id) {
  let links = await getQuickLinks();
  links = links.filter(l => l.id !== id);
  await setQuickLinks(links);
  return links;
}

async function updateQuickLink(id, name, url) {
  const links = await getQuickLinks();
  const link = links.find(l => l.id === id);
  if (link) { link.name = name; link.url = url; await setQuickLinks(links); }
  return links;
}

/* --- Bookmark Import --- */

async function getBookmarks() {
  if (!chrome.bookmarks) return [];
  const tree = await chrome.bookmarks.getTree();
  const results = [];
  function walk(nodes) {
    for (const node of nodes) {
      if (node.url) results.push({ title: node.title || node.url, url: node.url });
      if (node.children) walk(node.children);
    }
  }
  walk(tree);
  return results;
}

async function importBookmarksToQuickLinks() {
  const bookmarks = await getBookmarks();
  const existingLinks = await getQuickLinks();
  const existingUrls = new Set(existingLinks.map(l => normalizeUrl(l.url)));
  const seenUrls = new Set();
  let added = 0, skipped = 0;
  const newLinks = [...existingLinks];

  for (const bm of bookmarks) {
    const url = bm.url;
    if (!url || url.startsWith('javascript:') || url.startsWith('chrome://')) { skipped++; continue; }
    const normalized = normalizeUrl(url);
    if (existingUrls.has(normalized) || seenUrls.has(normalized)) { skipped++; continue; }
    seenUrls.add(normalized);
    let name = bm.title || '';
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, '');
      if (!name || name === url) name = friendlyDomain(hostname);
      else name = cleanTitle(name, hostname);
    } catch { if (!name) name = url; }
    newLinks.push({ id: Date.now().toString() + '-' + added, name: name.slice(0, 40), url });
    added++;
  }
  if (added > 0) await setQuickLinks(newLinks);
  return { added, skipped, total: bookmarks.length };
}

function normalizeUrl(url) {
  try {
    const u = new URL(url);
    return (u.origin + u.pathname).replace(/\/$/, '').toLowerCase() + u.search.toLowerCase();
  } catch { return url.toLowerCase(); }
}


/* ================================================================
   5. DOMAIN & TITLE HELPERS
   ================================================================ */

function friendlyDomain(hostname) {
  if (!hostname) return '';
  if (FRIENDLY_DOMAINS[hostname]) return FRIENDLY_DOMAINS[hostname];
  if (hostname.endsWith('.substack.com') && hostname !== 'substack.com')
    return capitalize(hostname.replace('.substack.com', '')) + "'s Substack";
  if (hostname.endsWith('.github.io'))
    return capitalize(hostname.replace('.github.io', '')) + ' (GitHub Pages)';
  let clean = hostname
    .replace(/^www\./, '')
    .replace(/\.(com|org|net|io|co|ai|dev|app|so|me|xyz|info|us|uk|co\.uk|co\.jp)$/, '');
  return clean.split('.').map(part => capitalize(part)).join(' ');
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function stripTitleNoise(title) {
  if (!title) return '';
  title = title.replace(/^\(\d+\+?\)\s*/, '');
  title = title.replace(/\s*\([\d,]+\+?\)\s*/g, ' ');
  title = title.replace(/\s*[\-\u2010-\u2015]\s*[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, '');
  title = title.replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, '');
  title = title.replace(/\s+on X:\s*/, ': ');
  title = title.replace(/\s*\/\s*X\s*$/, '');
  return title.trim();
}

function cleanTitle(title, hostname) {
  if (!title || !hostname) return title || '';
  const friendly = friendlyDomain(hostname);
  const domain = hostname.replace(/^www\./, '');
  const seps = [' - ', ' | ', ' — ', ' · ', ' – '];
  for (const sep of seps) {
    const idx = title.lastIndexOf(sep);
    if (idx === -1) continue;
    const suffix = title.slice(idx + sep.length).trim();
    const suffixLow = suffix.toLowerCase();
    if (suffixLow === domain.toLowerCase() || suffixLow === friendly.toLowerCase()
      || suffixLow === domain.replace(/\.\w+$/, '').toLowerCase()
      || domain.toLowerCase().includes(suffixLow) || friendly.toLowerCase().includes(suffixLow)) {
      const cleaned = title.slice(0, idx).trim();
      if (cleaned.length >= 5) return cleaned;
    }
  }
  return title;
}

function smartTitle(title, url) {
  if (!url) return title || '';
  let pathname = '', hostname = '';
  try { const u = new URL(url); pathname = u.pathname; hostname = u.hostname; }
  catch { return title || ''; }
  const titleIsUrl = !title || title === url || title.startsWith(hostname) || title.startsWith('http');
  if ((hostname === 'x.com' || hostname === 'twitter.com' || hostname === 'www.x.com') && pathname.includes('/status/')) {
    const username = pathname.split('/')[1];
    if (username) return titleIsUrl ? `Post by @${username}` : title;
  }
  if (hostname === 'github.com' || hostname === 'www.github.com') {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const [owner, repo, ...rest] = parts;
      if (rest[0] === 'issues' && rest[1]) return `${owner}/${repo} Issue #${rest[1]}`;
      if (rest[0] === 'pull' && rest[1]) return `${owner}/${repo} PR #${rest[1]}`;
      if (rest[0] === 'blob' || rest[0] === 'tree') return `${owner}/${repo} — ${rest.slice(2).join('/')}`;
      if (titleIsUrl) return `${owner}/${repo}`;
    }
  }
  if ((hostname === 'www.youtube.com' || hostname === 'youtube.com') && pathname === '/watch') {
    if (titleIsUrl) return 'YouTube Video';
  }
  if ((hostname === 'www.reddit.com' || hostname === 'reddit.com' || hostname === 'old.reddit.com') && pathname.includes('/comments/')) {
    const parts = pathname.split('/').filter(Boolean);
    const subIdx = parts.indexOf('r');
    if (subIdx !== -1 && parts[subIdx + 1] && titleIsUrl) return `r/${parts[subIdx + 1]} post`;
  }
  return title || url;
}

function getRealTabs() {
  return openTabs.filter(t => {
    const url = t.url || '';
    return !url.startsWith('chrome://') && !url.startsWith('chrome-extension://')
      && !url.startsWith('about:') && !url.startsWith('edge://') && !url.startsWith('brave://');
  });
}

function checkTabOutDupes() {
  const tabOutTabs = openTabs.filter(t => t.isTabOut);
  const banner = document.getElementById('tabOutDupeBanner');
  const countEl = document.getElementById('tabOutDupeCount');
  if (!banner) return;
  if (tabOutTabs.length > 1) {
    if (countEl) countEl.textContent = tabOutTabs.length;
    banner.style.display = 'flex';
  } else { banner.style.display = 'none'; }
}


/* ================================================================
   6. UI HELPERS — Sound, Confetti, Toast, Animations
   ================================================================ */

function playCloseSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const t = ctx.currentTime;
    const duration = 0.25;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const pos = i / data.length;
      const env = pos < 0.1 ? pos / 0.1 : Math.pow(1 - (pos - 0.1) / 0.9, 1.5);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.Q.value = 2.0;
    filter.frequency.setValueAtTime(4000, t);
    filter.frequency.exponentialRampToValueAtTime(400, t + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(t);
    setTimeout(() => ctx.close(), 500);
  } catch {}
}

function shootConfetti(x, y) {
  const colors = ['#c8713a','#e8a070','#5a7a62','#8aaa92','#5a6b7a','#8a9baa','#d4b896','#b35a5a'];
  for (let i = 0; i < 17; i++) {
    const el = document.createElement('div');
    const isCircle = Math.random() > 0.5;
    const size = 5 + Math.random() * 6;
    const color = colors[Math.floor(Math.random() * colors.length)];
    el.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${color};border-radius:${isCircle?'50%':'2px'};pointer-events:none;z-index:9999;transform:translate(-50%,-50%);opacity:1;`;
    document.body.appendChild(el);
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 120;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - 80;
    const gravity = 200;
    const startTime = performance.now();
    const dur = 700 + Math.random() * 200;
    function frame(now) {
      const elapsed = (now - startTime) / 1000;
      const progress = elapsed / (dur / 1000);
      if (progress >= 1) { el.remove(); return; }
      const px = vx * elapsed;
      const py = vy * elapsed + 0.5 * gravity * elapsed * elapsed;
      const opacity = progress < 0.5 ? 1 : 1 - (progress - 0.5) * 2;
      const rotate = elapsed * 200 * (isCircle ? 0 : 1);
      el.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px)) rotate(${rotate}deg)`;
      el.style.opacity = opacity;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
}

function animateCardOut(card) {
  if (!card) return;
  const rect = card.getBoundingClientRect();
  shootConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
  card.classList.add('closing');
  setTimeout(() => { card.remove(); checkAndShowEmptyState(); }, 300);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toastText').textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2500);
}

function checkAndShowEmptyState() {
  const missionsEl = document.getElementById('openTabsMissions');
  if (!missionsEl) return;
  const remaining = missionsEl.querySelectorAll('.mission-card:not(.closing)').length;
  if (remaining > 0) return;
  missionsEl.innerHTML = `
    <div class="missions-empty-state">
      <div class="empty-checkmark">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
      <div class="empty-title">Inbox zero, but for tabs.</div>
      <div class="empty-subtitle">You're free.</div>
    </div>`;
  const countEl = document.getElementById('openTabsSectionCount');
  if (countEl) countEl.textContent = '0 domains';
}


/* ================================================================
   7. RENDERERS
   ================================================================ */

/* --- Overflow Chips --- */

function buildOverflowChips(hiddenTabs, urlCounts = {}) {
  const hiddenChips = hiddenTabs.map(tab => {
    const label = cleanTitle(smartTitle(stripTitleNoise(tab.title || ''), tab.url), '');
    const count = urlCounts[tab.url] || 1;
    const dupeTag = count > 1 ? ` <span class="chip-dupe-badge">(${count}x)</span>` : '';
    const chipClass = count > 1 ? ' chip-has-dupes' : '';
    const safeUrl = escapeAttr(tab.url || '');
    const safeTitle = escapeAttr(label);
    let domain = '';
    try { domain = new URL(tab.url).hostname; } catch {}
    const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=16` : '';
    return `<div class="page-chip clickable${chipClass}" data-action="focus-tab" data-tab-url="${safeUrl}" title="${safeTitle}">
      ${faviconUrl ? `<img class="chip-favicon" src="${faviconUrl}" alt="" onerror="this.style.display='none'">` : ''}
      <span class="chip-text">${escapeHtml(label)}</span>${dupeTag}
      <div class="chip-actions">
        <button class="chip-action chip-save" data-action="defer-single-tab" data-tab-url="${safeUrl}" data-tab-title="${safeTitle}" title="Save for later">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg>
        </button>
        <button class="chip-action chip-close" data-action="close-single-tab" data-tab-url="${safeUrl}" title="Close this tab">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>`;
  }).join('');
  return `
    <div class="page-chips-overflow" style="display:none">${hiddenChips}</div>
    <div class="page-chip page-chip-overflow clickable" data-action="expand-chips">
      <span class="chip-text">+${hiddenTabs.length} more</span>
    </div>`;
}

/* --- Domain Card --- */

function renderDomainCard(group) {
  const tabs = group.tabs || [];
  const tabCount = tabs.length;
  const isLanding = group.domain === '__landing-pages__';
  const stableId = 'domain-' + group.domain.replace(/[^a-z0-9]/g, '-');

  const urlCounts = {};
  for (const tab of tabs) urlCounts[tab.url] = (urlCounts[tab.url] || 0) + 1;
  const dupeUrls = Object.entries(urlCounts).filter(([, c]) => c > 1);
  const hasDupes = dupeUrls.length > 0;
  const totalExtras = dupeUrls.reduce((s, [, c]) => s + c - 1, 0);

  const tabBadge = `<span class="open-tabs-badge">${ICONS.tabs}${tabCount} tab${tabCount !== 1 ? 's' : ''} open</span>`;
  const dupeBadge = hasDupes
    ? `<span class="open-tabs-badge" style="color:var(--accent-amber);background:rgba(200,113,58,0.08);">${totalExtras} duplicate${totalExtras !== 1 ? 's' : ''}</span>`
    : '';

  const seen = new Set();
  const uniqueTabs = [];
  for (const tab of tabs) { if (!seen.has(tab.url)) { seen.add(tab.url); uniqueTabs.push(tab); } }
  const visibleTabs = uniqueTabs.slice(0, 8);
  const extraCount = uniqueTabs.length - visibleTabs.length;

  const pageChips = visibleTabs.map(tab => {
    let label = cleanTitle(smartTitle(stripTitleNoise(tab.title || ''), tab.url), group.domain);
    try { const parsed = new URL(tab.url); if (parsed.hostname === 'localhost' && parsed.port) label = `${parsed.port} ${label}`; } catch {}
    const count = urlCounts[tab.url];
    const dupeTag = count > 1 ? ` <span class="chip-dupe-badge">(${count}x)</span>` : '';
    const chipClass = count > 1 ? ' chip-has-dupes' : '';
    const safeUrl = escapeAttr(tab.url || '');
    const safeTitle = escapeAttr(label);
    let domain = '';
    try { domain = new URL(tab.url).hostname; } catch {}
    const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=16` : '';
    return `<div class="page-chip clickable${chipClass}" data-action="focus-tab" data-tab-url="${safeUrl}" title="${safeTitle}">
      ${faviconUrl ? `<img class="chip-favicon" src="${faviconUrl}" alt="" onerror="this.style.display='none'">` : ''}
      <span class="chip-text">${escapeHtml(label)}</span>${dupeTag}
      <div class="chip-actions">
        <button class="chip-action chip-save" data-action="defer-single-tab" data-tab-url="${safeUrl}" data-tab-title="${safeTitle}" title="Save for later">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg>
        </button>
        <button class="chip-action chip-close" data-action="close-single-tab" data-tab-url="${safeUrl}" title="Close this tab">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>`;
  }).join('') + (extraCount > 0 ? buildOverflowChips(uniqueTabs.slice(8), urlCounts) : '');

  let actionsHtml = `<button class="action-btn close-tabs" data-action="close-domain-tabs" data-domain-id="${stableId}">${ICONS.close}Close all ${tabCount} tab${tabCount !== 1 ? 's' : ''}</button>`;
  if (hasDupes) {
    const dupeUrlsEncoded = dupeUrls.map(([url]) => encodeURIComponent(url)).join(',');
    actionsHtml += `<button class="action-btn" data-action="dedup-keep-one" data-dupe-urls="${dupeUrlsEncoded}">Close ${totalExtras} duplicate${totalExtras !== 1 ? 's' : ''}</button>`;
  }

  return `
    <div class="mission-card domain-card ${hasDupes ? 'has-amber-bar' : 'has-neutral-bar'}" data-domain-id="${stableId}">
      <div class="status-bar"></div>
      <div class="mission-content">
        <div class="mission-top">
          <span class="mission-name">${escapeHtml(isLanding ? 'Homepages' : (group.label || friendlyDomain(group.domain)))}</span>
          ${tabBadge}${dupeBadge}
        </div>
        <div class="mission-pages">${pageChips}</div>
        <div class="actions">${actionsHtml}</div>
      </div>
      <div class="mission-meta">
        <div class="mission-page-count">${tabCount}</div>
        <div class="mission-page-label">tabs</div>
      </div>
    </div>`;
}

/* --- Deferred Column --- */

function renderDeferredItem(item) {
  let domain = '';
  try { domain = new URL(item.url).hostname.replace(/^www\./, ''); } catch {}
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
  const ago = timeAgo(item.savedAt);
  const safeUrl = escapeAttr(item.url);
  const safeTitle = escapeAttr(item.title || '');
  return `
    <div class="deferred-item" data-deferred-id="${escapeAttr(item.id)}">
      <input type="checkbox" class="deferred-checkbox" data-action="check-deferred" data-deferred-id="${escapeAttr(item.id)}">
      <div class="deferred-info">
        <a href="${safeUrl}" target="_blank" rel="noopener" class="deferred-title" title="${safeTitle}">
          <img src="${faviconUrl}" alt="" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px" onerror="this.style.display='none'">${escapeHtml(item.title || item.url)}
        </a>
        <div class="deferred-meta"><span>${escapeHtml(domain)}</span><span>${escapeHtml(ago)}</span></div>
      </div>
      <button class="deferred-dismiss" data-action="dismiss-deferred" data-deferred-id="${escapeAttr(item.id)}" title="Dismiss">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
      </button>
    </div>`;
}

function renderArchiveItem(item) {
  const ago = item.completedAt ? timeAgo(item.completedAt) : timeAgo(item.savedAt);
  const safeUrl = escapeAttr(item.url);
  const safeTitle = escapeAttr(item.title || '');
  return `
    <div class="archive-item">
      <a href="${safeUrl}" target="_blank" rel="noopener" class="archive-item-title" title="${safeTitle}">
        ${escapeHtml(item.title || item.url)}
      </a>
      <span class="archive-item-date">${escapeHtml(ago)}</span>
    </div>`;
}

async function renderDeferredColumn() {
  const column = document.getElementById('deferredColumn');
  const list = document.getElementById('deferredList');
  const empty = document.getElementById('deferredEmpty');
  const countEl = document.getElementById('deferredCount');
  const archiveEl = document.getElementById('deferredArchive');
  const archiveCountEl = document.getElementById('archiveCount');
  const archiveList = document.getElementById('archiveList');
  if (!column) return;
  try {
    const { active, archived } = await getSavedTabs();
    if (active.length === 0 && archived.length === 0) { column.style.display = 'none'; return; }
    column.style.display = 'block';
    if (active.length > 0) {
      countEl.textContent = `${active.length} item${active.length !== 1 ? 's' : ''}`;
      list.innerHTML = active.map(item => renderDeferredItem(item)).join('');
      list.style.display = 'block'; empty.style.display = 'none';
    } else { list.style.display = 'none'; countEl.textContent = ''; empty.style.display = 'block'; }
    if (archived.length > 0) {
      archiveCountEl.textContent = `(${archived.length})`;
      archiveList.innerHTML = archived.map(item => renderArchiveItem(item)).join('');
      archiveEl.style.display = 'block';
    } else { archiveEl.style.display = 'none'; }
  } catch (err) {
    console.warn('[tab-out] Could not load saved tabs:', err);
    column.style.display = 'none';
  }
}

/* --- Main Dashboard --- */

async function renderStaticDashboard() {
  const greetingEl = document.getElementById('greeting');
  const dateEl = document.getElementById('dateDisplay');
  if (greetingEl) greetingEl.textContent = getGreeting();
  if (dateEl) dateEl.textContent = getDateDisplay();

  await fetchOpenTabs();
  const realTabs = getRealTabs();

  const LANDING_PAGE_PATTERNS = [
    { hostname: 'mail.google.com', test: (p, h) => !h.includes('#inbox/') && !h.includes('#sent/') && !h.includes('#search/') },
    { hostname: 'x.com', pathExact: ['/home'] },
    { hostname: 'www.linkedin.com', pathExact: ['/'] },
    { hostname: 'github.com', pathExact: ['/'] },
    { hostname: 'www.youtube.com', pathExact: ['/'] },
    ...(typeof LOCAL_LANDING_PAGE_PATTERNS !== 'undefined' ? LOCAL_LANDING_PAGE_PATTERNS : []),
  ];

  function isLandingPage(url) {
    try {
      const parsed = new URL(url);
      return LANDING_PAGE_PATTERNS.some(p => {
        const hostnameMatch = p.hostname ? parsed.hostname === p.hostname : p.hostnameEndsWith ? parsed.hostname.endsWith(p.hostnameEndsWith) : false;
        if (!hostnameMatch) return false;
        if (p.test) return p.test(parsed.pathname, url);
        if (p.pathPrefix) return parsed.pathname.startsWith(p.pathPrefix);
        if (p.pathExact) return p.pathExact.includes(parsed.pathname);
        return parsed.pathname === '/';
      });
    } catch { return false; }
  }

  domainGroups = [];
  const groupMap = {};
  const landingTabs = [];
  const customGroups = typeof LOCAL_CUSTOM_GROUPS !== 'undefined' ? LOCAL_CUSTOM_GROUPS : [];

  function matchCustomGroup(url) {
    try {
      const parsed = new URL(url);
      return customGroups.find(r => {
        const hostMatch = r.hostname ? parsed.hostname === r.hostname : r.hostnameEndsWith ? parsed.hostname.endsWith(r.hostnameEndsWith) : false;
        if (!hostMatch) return false;
        if (r.pathPrefix) return parsed.pathname.startsWith(r.pathPrefix);
        return true;
      }) || null;
    } catch { return null; }
  }

  for (const tab of realTabs) {
    try {
      if (isLandingPage(tab.url)) { landingTabs.push(tab); continue; }
      const customRule = matchCustomGroup(tab.url);
      if (customRule) {
        const key = customRule.groupKey;
        if (!groupMap[key]) groupMap[key] = { domain: key, label: customRule.groupLabel, tabs: [] };
        groupMap[key].tabs.push(tab); continue;
      }
      let hostname;
      if (tab.url && tab.url.startsWith('file://')) hostname = 'local-files';
      else hostname = new URL(tab.url).hostname;
      if (!hostname) continue;
      if (!groupMap[hostname]) groupMap[hostname] = { domain: hostname, tabs: [] };
      groupMap[hostname].tabs.push(tab);
    } catch {}
  }

  if (landingTabs.length > 0) groupMap['__landing-pages__'] = { domain: '__landing-pages__', tabs: landingTabs };

  const landingHostnames = new Set(LANDING_PAGE_PATTERNS.map(p => p.hostname).filter(Boolean));
  const landingSuffixes = LANDING_PAGE_PATTERNS.map(p => p.hostnameEndsWith).filter(Boolean);
  function isLandingDomain(domain) {
    if (landingHostnames.has(domain)) return true;
    return landingSuffixes.some(s => domain.endsWith(s));
  }

  function getParentDomain(hostname) {
    const parts = hostname.split('.');
    if (parts.length <= 2) return hostname;
    const lastTwo = parts.slice(-2).join('.');
    const multiPartTlds = ['com.cn', 'net.cn', 'org.cn', 'co.jp', 'co.uk', 'com.au', 'co.kr'];
    if (multiPartTlds.includes(lastTwo) && parts.length > 3) return parts.slice(-3).join('.');
    return lastTwo;
  }

  const parentMap = {};
  for (const [key, group] of Object.entries(groupMap)) {
    if (key.startsWith('__')) continue;
    if (group.label) continue;
    const parent = getParentDomain(group.domain);
    if (!parentMap[parent]) parentMap[parent] = [];
    parentMap[parent].push({ key, group });
  }

  for (const [parent, groups] of Object.entries(parentMap)) {
    if (groups.length < 2) continue;
    const target = groups[0];
    const mergedTabs = [...target.group.tabs];
    for (let i = 1; i < groups.length; i++) { mergedTabs.push(...groups[i].group.tabs); delete groupMap[groups[i].key]; }
    target.group.domain = parent;
    target.group.tabs = mergedTabs;
    if (target.key !== parent) { delete groupMap[target.key]; groupMap[parent] = target.group; }
  }

  domainGroups = Object.values(groupMap).sort((a, b) => {
    const aIsLanding = a.domain === '__landing-pages__';
    const bIsLanding = b.domain === '__landing-pages__';
    if (aIsLanding !== bIsLanding) return aIsLanding ? -1 : 1;
    const aIsPriority = isLandingDomain(a.domain);
    const bIsPriority = isLandingDomain(b.domain);
    if (aIsPriority !== bIsPriority) return aIsPriority ? -1 : 1;
    return b.tabs.length - a.tabs.length;
  });

  const openTabsSection = document.getElementById('openTabsSection');
  const openTabsMissionsEl = document.getElementById('openTabsMissions');
  const openTabsSectionCount = document.getElementById('openTabsSectionCount');
  const openTabsSectionTitle = document.getElementById('openTabsSectionTitle');

  if (domainGroups.length > 0 && openTabsSection) {
    if (openTabsSectionTitle) openTabsSectionTitle.textContent = 'Open tabs';
    openTabsSectionCount.innerHTML = `${domainGroups.length} domain${domainGroups.length !== 1 ? 's' : ''} &nbsp;&middot;&nbsp; <button class="action-btn close-tabs" data-action="close-all-open-tabs" style="font-size:11px;padding:3px 10px;">${ICONS.close} Close all ${realTabs.length} tabs</button>`;
    openTabsMissionsEl.innerHTML = domainGroups.map(g => renderDomainCard(g)).join('');
    openTabsSection.style.display = 'block';
  } else if (openTabsSection) { openTabsSection.style.display = 'none'; }

  const statTabs = document.getElementById('statTabs');
  if (statTabs) statTabs.textContent = openTabs.length;

  checkTabOutDupes();
  await renderDeferredColumn();
}

/* --- Quick Links Bar --- */

async function renderQuickLinks() {
  const container = document.getElementById('quickLinksBar');
  if (!container) return;
  const links = await getQuickLinks();
  const linksHtml = links.map(link => {
    let faviconUrl = '';
    try { const hostname = new URL(link.url).hostname; faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`; } catch {}
    return `
      <a class="quick-link" href="${escapeAttr(link.url)}" target="_blank" rel="noopener"
         data-link-id="${escapeAttr(link.id)}" data-link-name="${escapeAttr(link.name)}" data-link-url="${escapeAttr(link.url)}"
         title="${escapeAttr(link.name)}">
        <img class="quick-link-favicon" src="${faviconUrl}" alt="" onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex'">
        <span class="quick-link-fallback" style="display:none">${escapeHtml(link.name.charAt(0).toUpperCase())}</span>
        <span class="quick-link-name">${escapeHtml(link.name)}</span>
      </a>`;
  }).join('');
  container.innerHTML = linksHtml;
}

/* --- Settings Panel --- */

async function toggleSettingsDrawer() {
  settingsDrawerOpen = !settingsDrawerOpen;
  const drawer = document.getElementById('settingsDrawer');
  const overlay = document.getElementById('settingsOverlay');
  if (!drawer || !overlay) return;
  if (settingsDrawerOpen) {
    await renderSettingsDrawer();
    drawer.classList.add('open');
    overlay.classList.add('open');
  } else {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
  }
}

function closeSettingsDrawer() {
  settingsDrawerOpen = false;
  const drawer = document.getElementById('settingsDrawer');
  const overlay = document.getElementById('settingsOverlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

function switchDrawerNav(nav) {
  activeDrawerNav = nav;
  document.querySelectorAll('.drawer-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.nav === nav);
  });
  document.querySelectorAll('.drawer-section').forEach(section => {
    section.classList.toggle('active', section.dataset.section === nav);
  });
}

async function renderSettingsDrawer() {
  const body = document.getElementById('drawerBody');
  if (!body) return;
  const current = await getWallpaper();
  const activeId = current?.type === 'preset' ? PRESET_WALLPAPERS.find(p => p.url === current.value)?.id || '' : '';

  const presetsHtml = PRESET_WALLPAPERS.map(p => {
    const isActive = p.id === 'none' ? !current : activeId === p.id;
    const thumbStyle = p.url ? `background-image:url('${p.url}');background-size:cover;background-position:center;` : `background:var(--warm-gray);`;
    return `<div class="wallpaper-preset ${isActive ? 'active' : ''}" data-action="select-wallpaper-preset" data-preset-id="${escapeAttr(p.id)}" data-preset-url="${escapeAttr(p.url)}" style="${thumbStyle}" title="${escapeAttr(p.label)}">${p.id === 'none' ? '<span class="preset-none-label">✕</span>' : ''}</div>`;
  }).join('');

  const wallpaperSection = `
    <div class="drawer-section ${activeDrawerNav === 'wallpaper' ? 'active' : ''}" data-section="wallpaper">
      <label class="drawer-section-label">Presets</label>
      <div class="wallpaper-grid">${presetsHtml}</div>
      <label class="drawer-section-label">Image URL</label>
      <div class="drawer-input-row">
        <input type="text" class="drawer-input" id="wallpaperUrlInput" placeholder="https://images.unsplash.com/..." value="${escapeAttr(current?.type === 'url' ? current.value : '')}">
        <button class="drawer-btn" data-action="set-wallpaper-url">Apply</button>
      </div>
      <label class="drawer-section-label">Upload</label>
      <label class="drawer-upload-btn">
        <input type="file" accept="image/*" id="wallpaperFileInput" style="display:none">Choose file…
      </label>
    </div>`;

  const links = await getQuickLinks();
  const linksHtml = links.length > 0 ? links.map(link => {
    let faviconUrl = '';
    try { faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=16`; } catch {}
    return `
      <div class="drawer-link-item" data-link-id="${escapeAttr(link.id)}" data-link-name="${escapeAttr(link.name)}" data-link-url="${escapeAttr(link.url)}">
        <img src="${faviconUrl}" alt="" class="drawer-link-favicon" onerror="this.style.display='none'">
        <span class="drawer-link-name">${escapeHtml(link.name)}</span>
        <div class="drawer-link-actions">
          <button class="drawer-link-btn" data-action="inline-edit-link" data-link-id="${escapeAttr(link.id)}" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>
          </button>
          <button class="drawer-link-btn danger" data-action="inline-delete-link" data-link-id="${escapeAttr(link.id)}" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>`;
  }).join('') : '<div class="drawer-links-empty">No quick links yet.</div>';

  const linksSection = `
    <div class="drawer-section ${activeDrawerNav === 'links' ? 'active' : ''}" data-section="links">
      <div class="drawer-links-list" id="drawerLinksList">${linksHtml}</div>
      <div class="drawer-links-actions">
        <button class="drawer-btn" data-action="add-quick-link">+ Add link</button>
        <button class="drawer-btn drawer-btn-secondary" data-action="import-bookmarks">Import bookmarks</button>
      </div>
    </div>`;

  body.innerHTML = wallpaperSection + linksSection;

  document.querySelectorAll('.drawer-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.nav === activeDrawerNav);
  });
  document.querySelectorAll('.drawer-section').forEach(section => {
    section.classList.toggle('active', section.dataset.section === activeDrawerNav);
  });
}

function renderInlineEditForm(linkId, currentName, currentUrl) {
  return `
    <div class="drawer-link-edit-form" data-edit-id="${escapeAttr(linkId)}">
      <div class="edit-field">
        <label>Name</label>
        <input type="text" class="edit-name" value="${escapeAttr(currentName)}" placeholder="Site name">
      </div>
      <div class="edit-field">
        <label>URL</label>
        <input type="text" class="edit-url" value="${escapeAttr(currentUrl)}" placeholder="https://...">
      </div>
      <div class="edit-actions">
        <button class="drawer-btn drawer-btn-secondary" data-action="cancel-inline-edit" data-link-id="${escapeAttr(linkId)}">Cancel</button>
        <button class="drawer-btn" data-action="save-inline-edit" data-link-id="${escapeAttr(linkId)}">Save</button>
      </div>
    </div>`;
}


/* ================================================================
   8. EVENT DISPATCH — Single unified click listener
   ================================================================ */

/* --- Action handler functions --- */

async function handleCloseTaboutDupes() {
  await closeTabOutDupes();
  playCloseSound();
  const banner = document.getElementById('tabOutDupeBanner');
  if (banner) { banner.style.transition = 'opacity 0.4s'; banner.style.opacity = '0'; setTimeout(() => { banner.style.display = 'none'; banner.style.opacity = '1'; }, 400); }
  showToast('Closed extra Tab Out tabs');
}

function handleExpandChips(actionEl) {
  const overflowContainer = actionEl.parentElement.querySelector('.page-chips-overflow');
  if (overflowContainer) { overflowContainer.style.display = 'contents'; actionEl.remove(); }
}

async function handleFocusTab(actionEl) {
  const tabUrl = actionEl.dataset.tabUrl;
  if (tabUrl) await focusTab(tabUrl);
}

async function handleCloseSingleTab(actionEl, e) {
  e.stopPropagation();
  const tabUrl = actionEl.dataset.tabUrl;
  if (!tabUrl) return;
  const allTabs = await chrome.tabs.query({});
  const match = allTabs.find(t => t.url === tabUrl);
  if (match) await chrome.tabs.remove(match.id);
  await fetchOpenTabs();
  playCloseSound();
  const chip = actionEl.closest('.page-chip');
  if (chip) {
    const rect = chip.getBoundingClientRect();
    shootConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    chip.style.transition = 'opacity 0.2s, transform 0.2s';
    chip.style.opacity = '0'; chip.style.transform = 'scale(0.8)';
    setTimeout(() => {
      chip.remove();
      const parentCard = document.querySelector('.mission-card:has(.mission-pages:empty)');
      if (parentCard) animateCardOut(parentCard);
      document.querySelectorAll('.mission-card').forEach(c => {
        if (c.querySelectorAll('.page-chip[data-action="focus-tab"]').length === 0) animateCardOut(c);
      });
    }, 200);
  }
  const statTabs = document.getElementById('statTabs');
  if (statTabs) statTabs.textContent = openTabs.length;
  showToast('Tab closed');
}

async function handleDeferSingleTab(actionEl, e) {
  e.stopPropagation();
  const tabUrl = actionEl.dataset.tabUrl;
  const tabTitle = actionEl.dataset.tabTitle || tabUrl;
  if (!tabUrl) return;
  try { await saveTabForLater({ url: tabUrl, title: tabTitle }); }
  catch (err) { console.error('[tab-out] Failed to save tab:', err); showToast('Failed to save tab'); return; }
  const allTabs = await chrome.tabs.query({});
  const match = allTabs.find(t => t.url === tabUrl);
  if (match) await chrome.tabs.remove(match.id);
  await fetchOpenTabs();
  const chip = actionEl.closest('.page-chip');
  if (chip) {
    chip.style.transition = 'opacity 0.2s, transform 0.2s';
    chip.style.opacity = '0'; chip.style.transform = 'scale(0.8)';
    setTimeout(() => chip.remove(), 200);
  }
  showToast('Saved for later');
  await renderDeferredColumn();
}

async function handleCheckDeferred(actionEl) {
  const id = actionEl.dataset.deferredId;
  if (!id) return;
  await checkOffSavedTab(id);
  const item = actionEl.closest('.deferred-item');
  if (item) {
    item.classList.add('checked');
    setTimeout(() => { item.classList.add('removing'); setTimeout(() => { item.remove(); renderDeferredColumn(); }, 300); }, 800);
  }
}

async function handleDismissDeferred(actionEl) {
  const id = actionEl.dataset.deferredId;
  if (!id) return;
  await dismissSavedTab(id);
  const item = actionEl.closest('.deferred-item');
  if (item) { item.classList.add('removing'); setTimeout(() => { item.remove(); renderDeferredColumn(); }, 300); }
}

async function handleCloseDomainTabs(actionEl) {
  const card = actionEl.closest('.mission-card');
  const domainId = actionEl.dataset.domainId;
  const group = domainGroups.find(g => 'domain-' + g.domain.replace(/[^a-z0-9]/g, '-') === domainId);
  if (!group) return;
  const urls = group.tabs.map(t => t.url);
  const useExact = group.domain === '__landing-pages__' || !!group.label;
  if (useExact) await closeTabsExact(urls);
  else await closeTabsByUrls(urls);
  if (card) { playCloseSound(); animateCardOut(card); }
  const idx = domainGroups.indexOf(group);
  if (idx !== -1) domainGroups.splice(idx, 1);
  const groupLabel = group.domain === '__landing-pages__' ? 'Homepages' : (group.label || friendlyDomain(group.domain));
  showToast(`Closed ${urls.length} tab${urls.length !== 1 ? 's' : ''} from ${groupLabel}`);
  const statTabs = document.getElementById('statTabs');
  if (statTabs) statTabs.textContent = openTabs.length;
}

async function handleDedupKeepOne(actionEl) {
  const card = actionEl.closest('.mission-card');
  const urlsEncoded = actionEl.dataset.dupeUrls || '';
  const urls = urlsEncoded.split(',').map(u => decodeURIComponent(u)).filter(Boolean);
  if (urls.length === 0) return;
  await closeDuplicateTabs(urls, true);
  playCloseSound();
  actionEl.style.transition = 'opacity 0.2s'; actionEl.style.opacity = '0';
  setTimeout(() => actionEl.remove(), 200);
  if (card) {
    card.querySelectorAll('.chip-dupe-badge').forEach(b => { b.style.transition = 'opacity 0.2s'; b.style.opacity = '0'; setTimeout(() => b.remove(), 200); });
    card.querySelectorAll('.open-tabs-badge').forEach(badge => {
      if (badge.textContent.includes('duplicate')) { badge.style.transition = 'opacity 0.2s'; badge.style.opacity = '0'; setTimeout(() => badge.remove(), 200); }
    });
    card.classList.remove('has-amber-bar'); card.classList.add('has-neutral-bar');
  }
  showToast('Closed duplicates, kept one copy each');
}

async function handleCloseAllOpenTabs() {
  const allUrls = openTabs.filter(t => t.url && !t.url.startsWith('chrome') && !t.url.startsWith('about:')).map(t => t.url);
  await closeTabsByUrls(allUrls);
  playCloseSound();
  document.querySelectorAll('#openTabsMissions .mission-card').forEach(c => {
    shootConfetti(c.getBoundingClientRect().left + c.offsetWidth / 2, c.getBoundingClientRect().top + c.offsetHeight / 2);
    animateCardOut(c);
  });
  showToast('All tabs closed. Fresh start.');
}

async function handleSelectWallpaperPreset(actionEl) {
  const presetId = actionEl.dataset.presetId;
  if (presetId === 'none') { await setWallpaper(null); showToast('Wallpaper removed'); }
  else { await setWallpaper({ type: 'preset', value: actionEl.dataset.presetUrl }); showToast('Wallpaper applied'); }
  await renderSettingsDrawer();
}

async function handleSetWallpaperUrl() {
  const input = document.getElementById('wallpaperUrlInput');
  const url = input?.value?.trim();
  if (!url) { await setWallpaper(null); showToast('Wallpaper removed'); }
  else { await setWallpaper({ type: 'url', value: url }); showToast('Wallpaper applied'); }
  await renderSettingsDrawer();
}

function handleCloseSettingsDrawer() {
  closeSettingsDrawer();
}

function handleAddQuickLink() {
  const list = document.getElementById('drawerLinksList');
  if (!list) return;
  // Remove any existing add form
  const existing = list.querySelector('.drawer-link-edit-form[data-edit-id="new"]');
  if (existing) existing.remove();
  // Append form at the end of the list
  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderInlineEditForm('new', '', 'https://');
  const formEl = wrapper.firstElementChild;
  list.appendChild(formEl);
  // Scroll to bottom + focus
  setTimeout(() => {
    formEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const nameInput = formEl.querySelector('.edit-name');
    if (nameInput) nameInput.focus();
  }, 100);
}

async function handleImportBookmarks() {
  if (!chrome.bookmarks) { showToast('Bookmarks API not available'); return; }
  const result = await importBookmarksToQuickLinks();
  if (result.added > 0) {
    await renderQuickLinks();
    if (settingsDrawerOpen) await renderSettingsDrawer();
    showToast(`Imported ${result.added} bookmarks (${result.skipped} duplicates skipped)`);
  } else { showToast(`No new bookmarks to import (${result.skipped} duplicates)`); }
}

async function handleInlineEditLink(actionEl) {
  const linkId = actionEl.dataset.linkId;
  const links = await getQuickLinks();
  const link = links.find(l => l.id === linkId);
  if (!link) return;
  const item = actionEl.closest('.drawer-link-item');
  if (!item) return;
  // Hide the item and insert form after it
  item.style.display = 'none';
  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderInlineEditForm(linkId, link.name, link.url);
  const formEl = wrapper.firstElementChild;
  item.after(formEl);
  setTimeout(() => {
    formEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const nameInput = formEl.querySelector('.edit-name');
    if (nameInput) nameInput.focus();
  }, 100);
}

async function handleInlineDeleteLink(actionEl) {
  const linkId = actionEl.dataset.linkId;
  const links = await getQuickLinks();
  const link = links.find(l => l.id === linkId);
  if (!link) return;
  await removeQuickLink(linkId);
  await renderQuickLinks();
  if (settingsDrawerOpen) await renderSettingsDrawer();
  showToast(`Removed ${link.name}`);
}

function handleCancelInlineEdit(actionEl) {
  const form = actionEl.closest('.drawer-link-edit-form');
  if (!form) return;
  const linkId = form.dataset.editId;
  // Remove the form
  form.remove();
  if (linkId === 'new') return;
  // Restore the hidden item
  const item = document.querySelector(`.drawer-link-item[data-link-id="${linkId}"]`);
  if (item) item.style.display = '';
}

async function handleSaveInlineEdit(actionEl) {
  const linkId = actionEl.dataset.linkId;
  const form = actionEl.closest('.drawer-link-edit-form');
  if (!form) return;
  const nameInput = form.querySelector('.edit-name');
  const urlInput = form.querySelector('.edit-url');
  if (!nameInput || !urlInput) return;
  const name = nameInput.value.trim();
  let url = urlInput.value.trim();
  if (!name || !url) return;
  if (!url.startsWith('http')) url = 'https://' + url;
  if (linkId === 'new') {
    await addQuickLink(name, url);
    showToast(`Added ${name}`);
  } else {
    await updateQuickLink(linkId, name, url);
    showToast(`Updated ${name}`);
  }
  await renderQuickLinks();
  if (settingsDrawerOpen) await renderSettingsDrawer();
}

/* --- Action map: data-action → handler --- */
const ACTION_MAP = {
  'close-tabout-dupes':     (el, e) => handleCloseTaboutDupes(),
  'expand-chips':           (el, e) => handleExpandChips(el),
  'focus-tab':              (el, e) => handleFocusTab(el),
  'close-single-tab':      (el, e) => handleCloseSingleTab(el, e),
  'defer-single-tab':       (el, e) => handleDeferSingleTab(el, e),
  'check-deferred':         (el, e) => handleCheckDeferred(el),
  'dismiss-deferred':       (el, e) => handleDismissDeferred(el),
  'close-domain-tabs':      (el, e) => handleCloseDomainTabs(el),
  'dedup-keep-one':         (el, e) => handleDedupKeepOne(el),
  'close-all-open-tabs':    (el, e) => handleCloseAllOpenTabs(),
  'select-wallpaper-preset':(el, e) => handleSelectWallpaperPreset(el),
  'set-wallpaper-url':      (el, e) => handleSetWallpaperUrl(),
  'close-settings-drawer':  (el, e) => handleCloseSettingsDrawer(),
  'add-quick-link':         (el, e) => handleAddQuickLink(),
  'import-bookmarks':       (el, e) => handleImportBookmarks(),
  'inline-edit-link':     (el, e) => handleInlineEditLink(el),
  'inline-delete-link':   (el, e) => handleInlineDeleteLink(el),
  'cancel-inline-edit':   (el, e) => handleCancelInlineEdit(el),
  'save-inline-edit':     (el, e) => handleSaveInlineEdit(el),
};

/* --- Single unified click listener --- */
document.addEventListener('click', async (e) => {
  // 1. Check data-action elements first
  const actionEl = e.target.closest('[data-action]');
  if (actionEl) {
    const action = actionEl.dataset.action;
    const handler = ACTION_MAP[action];
    if (handler) { await handler(actionEl, e); return; }
  }

  // 2. Archive toggle
  const toggle = e.target.closest('#archiveToggle');
  if (toggle) {
    toggle.classList.toggle('open');
    const body = document.getElementById('archiveBody');
    if (body) body.style.display = body.style.display === 'none' ? 'block' : 'none';
    return;
  }

  // 3. Settings gear button
  const settingsBtn = e.target.closest('#settingsBtn');
  if (settingsBtn) {
    e.stopPropagation();
    await toggleSettingsDrawer();
    return;
  }

  // 4. Drawer nav tabs
  const navItem = e.target.closest('.drawer-nav-item');
  if (navItem) {
    switchDrawerNav(navItem.dataset.nav);
    return;
  }

  // 5. Close drawer when clicking overlay
  if (settingsDrawerOpen) {
    const drawer = document.getElementById('settingsDrawer');
    const overlay = e.target.closest('.settings-overlay');
    if (overlay) {
      closeSettingsDrawer();
      return;
    }
    if (drawer && !drawer.contains(e.target) && !settingsBtn?.contains(e.target)) {
      closeSettingsDrawer();
    }
  }
});

/* --- Archive search (input event, not click) --- */
document.addEventListener('input', async (e) => {
  if (e.target.id !== 'archiveSearch') return;
  const q = e.target.value.trim().toLowerCase();
  const archiveList = document.getElementById('archiveList');
  if (!archiveList) return;
  try {
    const { archived } = await getSavedTabs();
    if (q.length < 2) { archiveList.innerHTML = archived.map(item => renderArchiveItem(item)).join(''); return; }
    const results = archived.filter(item => (item.title || '').toLowerCase().includes(q) || (item.url || '').toLowerCase().includes(q));
    archiveList.innerHTML = results.map(item => renderArchiveItem(item)).join('') || '<div style="font-size:12px;color:var(--muted);padding:8px 0">No results</div>';
  } catch (err) { console.warn('[tab-out] Archive search failed:', err); }
});

/* --- Wallpaper file upload (change event, not click) --- */
document.addEventListener('change', async (e) => {
  if (e.target.id !== 'wallpaperFileInput') return;
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    await setWallpaper({ type: 'upload', value: reader.result });
    showToast('Wallpaper applied');
    await renderSettingsDrawer();
  };
  reader.readAsDataURL(file);
});


/* ================================================================
   9. INIT
   ================================================================ */

async function initWallpaper() {
  let config = await getWallpaper();
  if (!config) {
    config = { type: 'preset', value: PRESET_WALLPAPERS[1].url };
    await chrome.storage.local.set({ wallpaper: config });
  }
  await applyWallpaper(config);
}

async function renderDashboard() {
  await initWallpaper();
  await renderQuickLinks();
  await renderStaticDashboard();
}

renderDashboard();
