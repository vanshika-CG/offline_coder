# 🚀 OfflineCoder

<img width="955" height="397" alt="Screenshot 2026-05-31 200828" src="https://github.com/user-attachments/assets/31f7cc0b-28dd-4edd-aa56-344ea5aa14ea" />

---


# 🚧 Work In Progress

> **OfflineCoder is currently under active development.**

Some features mentioned below are implemented, while others are being actively developed and tested.

### Current Development Status

* ✅ Chrome Extension Problem Scraping
* ✅ React Frontend
* ✅ Express Backend
* ✅ SQLite Storage
* ✅ PWA Setup
* ✅ Offline Caching
* ✅ Problem Library

### In Development

* 🚧 Integrated Code Editor
* 🚧 Judge0 Execution Engine
* 🚧 Submission Tracking
* 🚧 Dynamic Playlists
* 🚧 Revision Analytics
* 🚧 Cloud Sync

### Planned

* 📌 AI Revision Assistant
* 📌 Mobile Application
* 📌 Company-wise Tracking
* 📌 Contest Archive
* 📌 Offline Code Runner

---

# 📖 About

OfflineCoder is a full-stack Progressive Web Application (PWA) ecosystem built for developers preparing for coding interviews, competitive programming, and technical assessments.

The platform allows users to save coding problems from LeetCode and continue practicing them completely offline.

No internet.

No interruptions.

Just coding.

---

# ✨ Key Features

## 🌐 LeetCode Saver Extension

Save coding problems directly from LeetCode.

### Features

* One-click Save Offline button
* Automatic problem extraction
* Constraint detection
* Difficulty identification
* Starter code generation
* Local persistence

---

## 🧠 Smart Problem Analysis

OfflineCoder attempts to analyze problems automatically.

### Detects

* Arrays
* Strings
* Hash Tables
* Trees
* Graphs
* BFS
* DFS
* Dynamic Programming
* Binary Search
* Greedy
* Backtracking

### Extracts

* Constraints
* Examples
* Function Signatures
* Metadata

---

## ⚡ Offline Workspace

### Dashboard

Track:

* Problems Saved
* Problems Solved
* Revision Progress
* Recent Activity

### Library

Search and filter by:

* Difficulty
* Tags
* Status
* Creation Date

### Notes

Add personal notes to every problem.

### Revision Playlists

Create collections such as:

* Blind 75
* Dynamic Programming
* Interview Preparation
* Weekly Revision

---

## 📱 Progressive Web App

OfflineCoder behaves like a native application.

### Benefits

* Installable
* Offline Access
* Fast Loading
* Cached Assets
* Mobile Friendly

---

## 🛡 Backend API

Built using:

```txt
Node.js
Express.js
SQLite
```

### Modules

* Authentication
* Problem Management
* Notes
* Playlists
* User Profiles
* Admin Routes

---

# 🏗 System Architecture

```text
┌────────────────────────────┐
│      LeetCode Website      │
└──────────────┬─────────────┘
               │
               ▼
┌────────────────────────────┐
│ Chrome Extension           │
│ LeetCode Saver 🚀          │
└──────────────┬─────────────┘
               │
               ▼
┌────────────────────────────┐
│ Express Backend API        │
└──────────────┬─────────────┘
               │
               ▼
┌────────────────────────────┐
│ SQLite Database            │
└──────────────┬─────────────┘
               │
               ▼
┌────────────────────────────┐
│ React + PWA Frontend       │
└────────────────────────────┘
```

---

# 🔄 Workflow

## 1. Save

User opens a LeetCode problem.

Extension injects:

```txt
Save Offline 🚀
```

button.

---

## 2. Analyze

Problem data is extracted.

OfflineCoder attempts to:

* Identify tags
* Extract constraints
* Detect difficulty
* Generate templates

---

## 3. Store

Data is saved locally and in SQLite.

---

## 4. Practice

Users can:

* Browse saved questions
* Read notes
* Create playlists
* Solve problems

even without internet access.

---

# 🛠 Tech Stack

| Layer           | Technology      |
| --------------- | --------------- |
| Frontend        | React 18        |
| Build Tool      | Vite            |
| Styling         | Tailwind CSS    |
| Icons           | Lucide React    |
| Backend         | Node.js         |
| Framework       | Express.js      |
| Database        | SQLite          |
| ORM/Driver      | better-sqlite3  |
| Extension       | Manifest V3     |
| Offline Support | Service Workers |

---

# 📂 Project Structure

```bash
OfflineCoder/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── vite.config.js
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── database/
│   └── server.js
│
├── extension/
│   ├── manifest.json
│   ├── content.js
│   ├── popup.html
│   └── popup.js
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/OfflineCoder.git

cd OfflineCoder
```

---

## Backend Setup

```bash
cd backend

npm install

npm start
```

Create:

```env
PORT=3001
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## Install Extension

1. Open:

```txt
chrome://extensions
```

2. Enable Developer Mode

3. Click Load Unpacked

4. Select:

```txt
extension/
```

5. Open LeetCode

6. Start Saving Problems 🚀

---

# 📈 Roadmap

## Version 1.1

* [ ] Monaco Code Editor
* [ ] Local Test Cases
* [ ] Enhanced Search

## Version 1.2

* [ ] Judge0 Integration
* [ ] Submission History
* [ ] Progress Tracking

## Version 2.0

* [ ] AI Assistant
* [ ] Mobile App
* [ ] Cloud Synchronization
* [ ] Contest Management

---

# 🤝 Contributing

Contributions are welcome.

```bash
Fork Repository

Create Feature Branch

Commit Changes

Push Branch

Open Pull Request
```

---

# 🌟 Why OfflineCoder?

Most coding platforms assume internet connectivity.

OfflineCoder focuses on:

✅ Offline Learning

✅ Personal Knowledge Base

✅ Efficient Revision

✅ Coding Interview Preparation

✅ Progressive Web Experience

---

# 📄 License

Distributed under the ISC License.

See LICENSE for details.

---

# 👨‍💻 Author

### Vanshika Jangam

Computer Engineering Student • Full Stack Developer • Open Source Enthusiast

If you like this project, consider giving it a ⭐ on GitHub.
