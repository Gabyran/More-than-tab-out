# More Than Tab Out

> An enhanced Chrome new tab extension, built on top of [Tab Out](https://github.com/zarazhangrui/tab-out).
> Original by [Zara](https://x.com/zarazhangrui) · Enhanced by [Gabi](https://github.com/Gabyran)

中文 | **[English](./README.md)**

---

## ✨ Features

### 🖼️ Wallpaper System

- **Preset wallpapers** — curated Unsplash photos (mountain, ocean, forest, sunset, aurora…)
- **Custom URL** — paste any image URL as wallpaper
- **Local upload** — select an image from your device
- **Auto-theming** — card colors automatically adapt to the wallpaper's dominant color, text brightness adjusts accordingly

### 🔗 Quick Links Bar

- Shows favicon + site name, click to open
- Click ⚙️ in the top-right to open the settings drawer, manage under the **Quick Links** tab:
  - **Add** — inline form expands at the bottom, fill in name and URL
  - **Edit** — click ✏️ to expand an edit form below the item
  - **Delete** — click ✕ to remove directly
  - **Import bookmarks** — one-click import of all Chrome bookmarks, auto-deduplicated
- Data stored in `chrome.storage.local`, fully local, never uploaded

### 🗂️ Tab Management (inherited from Tab Out)

- **See all tabs at a glance** — grouped by domain on a clean grid
- **Homepages group** — Gmail, X, LinkedIn, YouTube, GitHub homepages pulled into one card
- **Subdomain merging** — tabs from the same parent domain are automatically grouped (e.g. `space.bilibili.com` + `www.bilibili.com` → one Bilibili card)
- **Close with style** — batch close by domain, with swoosh sound + confetti 🎉
- **Duplicate detection** — auto-flags duplicate tabs with one-click cleanup
- **Cross-window jump** — click any tab to switch directly
- **Save for later** — bookmark tabs to a checklist before closing

---

## 📦 Install

### Chrome

```bash
git clone https://github.com/Gabyran/More-than-tab-out.git
```

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder inside the cloned repo
5. Open a new tab — done!

### Microsoft Edge

1. Open `edge://extensions`
2. Enable **Developer mode** (left sidebar)
3. Click **Load unpacked**
4. Select the `extension/` folder
5. Open a new tab — done!

> 💡 You can also download the zip from [Releases](https://github.com/Gabyran/More-than-tab-out/releases) and load the unpacked folder.

### Dia Browser

1. Open `dia://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/` folder
5. Open a new tab — done!

> 💡 Dia is built on Chromium and fully supports Manifest V3 extensions. Installation is identical to Chrome.

---

## 🛠️ Tech Stack

| Component | Tech |
|-----------|------|
| Extension | Chrome / Edge / Dia Manifest V3 |
| Storage | `chrome.storage.local` (fully local) |
| Wallpaper theming | Canvas pixel sampling + luminance analysis |
| Sound | Web Audio API (synthesized, no audio files) |
| Animations | CSS transitions + JS confetti particles |
| Dependencies | Zero — pure HTML / CSS / JS |

### Code Architecture

```
extension/
├── manifest.json     # Extension config (permissions: tabs, storage, bookmarks)
├── index.html        # Page skeleton
├── style.css         # All styles
└── app.js            # Main logic (9 sections)
    ├── 1. UTILITIES      — escapeHtml, time formatting, greeting
    ├── 2. CONSTANTS      — domain map, icons, wallpaper presets, default quick links
    ├── 3. STATE          — runtime state variables
    ├── 4. CHROME APIs    — tabs, bookmarks, storage wrappers
    ├── 5. DOMAIN HELPERS  — title cleanup, friendly domain names, grouping logic
    ├── 6. UI HELPERS     — sound, confetti, toast, animations
    ├── 7. RENDERERS      — cards, tabs, quick links, settings drawer
    ├── 8. EVENT DISPATCH — unified event dispatcher (ACTION_MAP)
    └── 9. INIT           — bootstrap
```

---

## 👥 Contributors

| | Who | What they did |
|---|------|----------|
| 🎨 | [Zara](https://x.com/zarazhangrui) | Original creator of [Tab Out](https://github.com/zarazhangrui/tab-out), tab management and warm design style |
| ✨ | [Gabi](https://github.com/Gabyran) | Wallpaper system, quick links bar, subdomain merging, bookmark import, settings drawer refactor, Dia browser support |

---

## 📄 Credits

- **[Tab Out](https://github.com/zarazhangrui/tab-out)** — original extension, all tab management logic and design credit goes to Zara
- **[Unsplash](https://unsplash.com)** — preset wallpaper image source
- **[Google S2](https://www.google.com/s2/favicons)** — Favicon service

---

## 📝 License

MIT — same as the original [Tab Out](https://github.com/zarazhangrui/tab-out).