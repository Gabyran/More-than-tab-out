# More Than Tab Out

> 基于 [Tab Out](https://github.com/zarazhangrui/tab-out) 的增强版 Chrome 新标签页扩展。
> 原作者：[Zara](https://x.com/zarazhangrui) · 二创增强：[Gabi](https://github.com/Gabyran)

A Chrome new tab extension built on top of [Tab Out](https://github.com/zarazhangrui/tab-out) with wallpaper support, quick links, and more.
Original by [Zara](https://x.com/zarazhangrui) · Enhanced by [Gabi](https://github.com/Gabyran)

---

## What's New / 新增功能

In addition to all original Tab Out features, this fork adds:

在保留 Tab Out 全部功能的基础上，新增：

### 🖼️ Custom Wallpapers / 自定义壁纸

- **Preset wallpapers** — curated Unsplash photos (mountain, ocean, forest, sunset, night sky, aurora…)
- **Custom URL** — paste any image URL as wallpaper
- **Local upload** — select an image from your device
- **Auto-theming** — card colors automatically adapt to the wallpaper's dominant color
- **Smart text** — text color switches between light/dark based on wallpaper luminance

预设壁纸（精选 Unsplash 风景图）、自定义 URL、本地图片上传。卡片颜色自动跟随壁纸主色调变化，文字颜色根据亮度自动切换深/浅色。

### 🔗 Quick Links Bar / 常用网址栏

- Vertical bookmark bar with favicon + site name + URL
- Add / edit / delete links directly in the UI
- Hover to reveal edit controls
- Data stored in `chrome.storage.local`, fully local

竖排快捷网址栏，显示 favicon + 站名 + URL。支持在界面中直接添加、编辑、删除。数据存在本地，不上传。

### 🧩 Subdomain Merging / 子域名合并

- Tabs from the same parent domain (e.g. `space.bilibili.com` + `www.bilibili.com`) are automatically grouped under one card

同一个主域名下的不同子域名 tab 自动合并为一组（例如 `space.bilibili.com` + `www.bilibili.com` → 一个 Bilibili 卡片）。

---

## Original Features (from Tab Out) / 原有功能

- **See all tabs at a glance** — grouped by domain on a clean grid
- **Homepages group** — Gmail, X, LinkedIn, YouTube, GitHub homepages pulled into one card
- **Close tabs with style** — swoosh sound + confetti burst
- **Duplicate detection** — flags same-page tabs with one-click cleanup
- **Click to jump** — switch to any tab across windows
- **Save for later** — bookmark tabs to a checklist before closing
- **100% local** — no server, no account, no data leaves your machine

---

## Install / 安装

```bash
git clone https://github.com/Gabyran/More-than-tab-out.git
```

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder inside the cloned repo
5. Open a new tab — you're done!

---

## Tech Stack / 技术栈

| Component | Tech |
|-----------|------|
| Extension | Chrome Manifest V3 |
| Storage | `chrome.storage.local` |
| Wallpaper | CSS `background-image` + Canvas color extraction |
| Sound | Web Audio API (synthesized) |
| Animations | CSS transitions + JS confetti |
| Dependencies | Zero — pure HTML/CSS/JS |

---

## Credits / 致谢

- **[Tab Out](https://github.com/zarazhangrui/tab-out)** by [Zara](https://x.com/zarazhangrui) — the original extension with tab management, domain grouping, and the beautiful warm design
- **Wallpaper presets** from [Unsplash](https://unsplash.com)
- **Favicon service** from [Google S2](https://www.google.com/s2/favicons)

This project is a fork. All original tab management logic and design credit goes to Zara. The wallpaper system, quick links bar, and subdomain merging are additions by Gabi.

本项目是 Fork。所有原始的 tab 管理逻辑和设计版权归 Zara 所有。壁纸系统、快捷网址栏和子域名合并功能为 Gabi 新增。

---

## License / 许可证

MIT — same as the original [Tab Out](https://github.com/zarazhangrui/tab-out).
