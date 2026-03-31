# 🔐 Dan Joseph — Portfolio & Password Strength Checker

> BCA Student Portfolio with Modern Web Development Workflow

[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/portfolio/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/portfolio/actions)
[![Live Site](https://img.shields.io/badge/Live-GitHub%20Pages-00e5ff?style=flat)](https://YOUR_USERNAME.github.io/portfolio)

## 🌍 Live Demo
**Frontend:** https://YOUR_USERNAME.github.io/portfolio  
**Backend API:** https://YOUR-APP.onrender.com

---

## 📋 HOD's Modern Web Development Workflow

```
Local Git Repository → GitHub → CI/CD (Testing/Linting) → Hosting (Website + DB) → Web Browser
```

| Step | Tool | Purpose |
|------|------|---------|
| 1 | Git (local) | Version control, track changes |
| 2 | GitHub | Cloud code storage, collaboration |
| 3 | GitHub Actions | Automated testing & deployment |
| 4 | GitHub Pages | Free frontend hosting |
| 5 | Render.com | Backend + PostgreSQL hosting |

---

## 🛠 Tech Stack

**Frontend**
- HTML5, CSS3 (custom, no frameworks)
- Vanilla JavaScript (ES6+)
- Password Strength Checker (real-time)
- Responsive design

**Backend**
- Node.js + Express.js
- PostgreSQL database
- REST API (`POST /api/contact`)

**DevOps**
- Git for version control
- GitHub for code hosting
- GitHub Actions for CI/CD pipeline
- GitHub Pages for frontend deployment
- Render.com for backend + DB hosting

---

## 🔐 Password Strength Checker

The featured project checks passwords against 5 criteria:
- ✅ Minimum 8 characters
- ✅ Uppercase letter (A-Z)
- ✅ Lowercase letter (a-z)
- ✅ Number (0-9)
- ✅ Special character (!@#$...)

Scores from 0–5 with live visual feedback.

---

## 🚀 Local Development

### Frontend
Just open `index.html` in VS Code with the Live Server extension.

### Backend
```bash
cd backend
npm install
node server.js
# Server runs on http://localhost:3000
```

### Environment Variables (for production)
```
DATABASE_URL=postgresql://user:pass@host/dbname
NODE_ENV=production
```

---

## 📁 Project Structure

```
portfolio/
├── index.html              # Main portfolio website
├── styles.css              # All styles
├── script.js               # Password checker + contact form JS
├── .gitignore
├── README.md
├── SETUP_GUIDE.html        # Complete setup instructions
├── .github/
│   └── workflows/
│       └── deploy.yml      # CI/CD pipeline
└── backend/
    ├── server.js           # Node.js + Express API
    └── package.json
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/contact` | Submit contact form |
| GET | `/api/messages` | View all messages |

### POST /api/contact
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Idea",
  "message": "Let's build something together!"
}
```

---

*Made with ❤️ by Dan Joseph — BCA Student*
