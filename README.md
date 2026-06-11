<div align="center">

<br />

<img src="https://img.shields.io/badge/InstaTrace-Privacy%20First-DD2A7B?style=for-the-badge&logo=instagram&logoColor=white" alt="InstaTrace" height="40"/>

<br /><br />

# InstaTrace

### A privacy-focused tool for exploring your Instagram connections — 100% offline, 100% local.

<br />

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## ✨ What is InstaTrace?

**InstaTrace** lets you analyze your Instagram data export to understand your connections — who follows you, who you follow, mutual followers, people who don't follow back, and fans — all processed directly in your browser. **Your data never leaves your device.**

---

## 🔍 Features

| Feature | Description |
|---|---|
| 👥 **Followers** | See everyone who follows you |
| 🔁 **Following** | See everyone you follow |
| 🤝 **Mutuals** | Accounts you follow who follow you back |
| ❌ **Don't Follow Back** | Accounts you follow who don't follow you back |
| ⚡ **Fans** | Accounts that follow you but you don't follow back |
| 📅 **Recently Followed** | Latest connection activity with timestamps |
| 📊 **Compare** | Upload two exports and compare changes over time |
| 🔒 **100% Offline** | All parsing happens locally — zero server calls, zero analytics |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (included with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/instatrace.git
cd instatrace

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at **http://localhost:3000**

---

## 📦 How to Get Your Instagram Data Export

1. Open Instagram → **Settings & Privacy**
2. Go to **Your Activity → Download your information**
3. Select **"Download or transfer information"**
4. Choose **"Some of your information"**
5. Under **Connections**, select:
   - Followers and Following
6. Set **Format: JSON** and **Date range: All time**
7. Request download and wait for the email from Instagram
8. Download the `.zip` file and upload it to InstaTrace

> ⚠️ Make sure you select **JSON format** — not HTML. InstaTrace only parses JSON exports.

---

## 📁 Project Structure

```
instatrace/
├── src/
│   ├── components/
│   │   ├── LandingPage.tsx       # Upload & hero section
│   │   ├── Navbar.tsx            # Top navigation bar
│   │   ├── OverviewView.tsx      # Dashboard overview with stats & charts
│   │   ├── DataListView.tsx      # Filterable user list view
│   │   ├── CompareView.tsx       # Export comparison tool
│   │   └── HowToGuide.tsx        # Step-by-step guide section
│   ├── utils/
│   │   └── parser.ts             # ZIP parsing & Instagram JSON extraction logic
│   ├── types.ts                  # TypeScript interfaces
│   ├── App.tsx                   # Root component & state management
│   └── index.css                 # Global styles
├── index.html
├── vite.config.ts
└── package.json
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **TypeScript 5.8** | Type safety |
| **Vite 6** | Build tool & dev server |
| **TailwindCSS 4** | Utility-first styling |
| **JSZip** | Client-side ZIP file parsing |
| **Lucide React** | Icon library |

---

## 🔐 Privacy & Security

- ✅ **Zero server uploads** — your ZIP file is read entirely in the browser
- ✅ **No analytics, no tracking** — no third-party scripts or beacons
- ✅ **No account login required** — InstaTrace never asks for your Instagram credentials
- ✅ **No data storage** — nothing is saved after you close the tab
- ✅ **Open source** — inspect every line of code yourself

---

## 📜 Available Scripts

```bash
npm run dev       # Start development server on port 3000
npm run build     # Build for production
npm run preview   # Preview the production build
npm run lint      # TypeScript type checking
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## ⚠️ Disclaimer

This project is **independent** and is not affiliated with, endorsed by, or sponsored by **Instagram** or **Meta Platforms, Inc.** The Instagram name and logo are trademarks of Meta Platforms, Inc.

---

<div align="center">

Made with ❤️ by [Albin](https://www.albiin.me)

</div>
