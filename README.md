# More Than Tab Out

> 基于 [Tab Out](https://github.com/zarazhangrui/tab-out) 的增强版 Chrome 新标签页扩展。
> 原作者：[Zara](https://x.com/zarazhangrui) · 二创增强：[Gabi](https://github.com/Gabyran)

**[English](./README_EN.md)** | 中文

---

## ✨ 功能一览

### 🖼️ 壁纸系统

- **预设壁纸** — 精选 Unsplash 风景图（山脉、海洋、森林、日落、极光…）
- **自定义链接** — 粘贴任意图片 URL 作为壁纸
- **本地上传** — 从设备中选择图片
- **智能配色** — 卡片颜色自动跟随壁纸主色调，文字明暗自适应

### 🔗 快捷网址栏

- 显示网站 favicon + 名称，一键打开
- 点击右上角 ⚙️ 打开设置面板，在 **Quick Links** 标签页管理：
  - **添加** — 底部展开内联表单，填写名称和 URL
  - **编辑** — 点击 ✏️ 在条目下方展开编辑表单
  - **删除** — 点击 ✕ 直接删除
  - **导入书签** — 一键导入 Chrome 所有书签，自动去重
- 数据存储在 `chrome.storage.local`，完全本地，不上传

### 🗂️ 标签页管理（继承自 Tab Out）

- **一览全局** — 所有打开的标签页按域名分组，网格卡片展示
- **首页归组** — Gmail、X、LinkedIn、YouTube、GitHub 首页自动归入同一组
- **子域名合并** — 同一主域名的子域名自动合并（如 `space.bilibili.com` + `www.bilibili.com` → 一个 Bilibili 卡片）
- **一键关闭** — 按域名批量关闭，带音效 + 彩纸动画 🎉
- **重复检测** — 自动标记重复打开的标签页，一键清理
- **跨窗口跳转** — 点击任意标签页直接切换
- **稍后查看** — 把标签页存入清单，关掉以后再看

---

## 📦 安装

### Chrome

```bash
git clone https://github.com/Gabyran/More-than-tab-out.git
```

1. 打开 `chrome://extensions`
2. 开启右上角 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择克隆目录下的 `extension/` 文件夹
5. 打开新标签页 — 完成！

### Microsoft Edge

1. 打开 `edge://extensions`
2. 开启左侧 **开发者模式**
3. 点击 **加载解压缩的扩展**
4. 选择 `extension/` 文件夹
5. 打开新标签页 — 完成！

> 💡 也可以从 [Releases](https://github.com/Gabyran/More-than-tab-out/releases) 下载 zip 包，解压后加载。

---

## 🛠️ 技术栈

| 组件 | 技术 |
|------|------|
| 扩展标准 | Chrome / Edge Manifest V3 |
| 数据存储 | `chrome.storage.local`（完全本地） |
| 壁纸配色 | Canvas 像素采样 + 亮度分析 |
| 音效 | Web Audio API 合成（无音频文件） |
| 动画 | CSS transitions + JS 彩纸粒子 |
| 依赖 | 零依赖 — 纯 HTML / CSS / JS |

### 代码架构

```
extension/
├── manifest.json     # 扩展配置（权限：tabs, storage, bookmarks）
├── index.html        # 页面骨架
├── style.css         # 全部样式
└── app.js            # 主逻辑（9 个分区）
    ├── 1. UTILITIES      — escapeHtml, 时间格式化, 问候语
    ├── 2. CONSTANTS      — 域名映射表, 图标, 壁纸预设, 默认快捷链接
    ├── 3. STATE          — 运行时状态变量
    ├── 4. CHROME APIs    — tabs, bookmarks, storage 封装
    ├── 5. DOMAIN HELPERS  — 标题清理, 友好域名, 分组逻辑
    ├── 6. UI HELPERS     — 音效, 彩纸, Toast, 动画
    ├── 7. RENDERERS      — 卡片, 标签页, 快捷链接, 设置面板
    ├── 8. EVENT DISPATCH — 统一事件分发（ACTION_MAP）
    └── 9. INIT           — 启动流程
```

---

## 👥 贡献者

| | 谁 | 做了什么 |
|---|------|----------|
| 🎨 | [Zara](https://x.com/zarazhangrui) | [Tab Out](https://github.com/zarazhangrui/tab-out) 原作者，标签页管理和温暖设计风格 |
| ✨ | [Gabi](https://github.com/Gabyran) | 壁纸系统、快捷网址栏、子域名合并、书签导入、设置面板重构 |

---

## 📄 致谢

- **[Tab Out](https://github.com/zarazhangrui/tab-out)** — 原始扩展，所有标签页管理逻辑和设计版权归 Zara
- **[Unsplash](https://unsplash.com)** — 预设壁纸图片来源
- **[Google S2](https://www.google.com/s2/favicons)** — Favicon 服务

---

## 📝 许可证

MIT — 与原项目 [Tab Out](https://github.com/zarazhangrui/tab-out) 一致。
