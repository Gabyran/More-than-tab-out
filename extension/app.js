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
let activeDrawerNav = 'wallpaper';

/* --- Toggle settings drawer --- */
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

/* --- Render settings drawer --- */
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

async function handleAddQuickLink() {
  const name = prompt('Site name:');
  if (!name) return;
  let url = prompt('URL:', 'https://');
  if (!url) return;
  if (!url.startsWith('http')) url = 'https://' + url;
  await addQuickLink(name, url);
  await renderQuickLinks();
  if (settingsDrawerOpen) await renderSettingsDrawer();
  showToast(`Added ${name}`);
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
  item.outerHTML = renderInlineEditForm(linkId, link.name, link.url);
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
  if (settingsDrawerOpen) renderSettingsDrawer();
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
  await updateQuickLink(linkId, name, url);
  await renderQuickLinks();
  if (settingsDrawerOpen) await renderSettingsDrawer();
  showToast(`Updated ${name}`);
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
