# 🎬 PitchVault

<div align="center">

![PitchVault Banner](https://img.shields.io/badge/PitchVault-Where%20Founders%20Meet%20Capital-c9a84c?style=for-the-badge)

**A platform where startup founders can upload pitch videos to connect with investors worldwide.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)](https://expressjs.com/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Docs](#-api-documentation) • [Screenshots](#-screenshots)

</div>

---

## 🚀 Features

### For Founders
- 📹 **Upload Pitch Videos** - Share your startup story with investors
- 🏢 **Company Profile** - Showcase your company, sector, and funding stage
- 📊 **Track Views** - See how many investors watched your pitch
- ✏️ **Manage Pitches** - Edit, publish/unpublish, or delete your pitches

### For Investors
- 🔍 **Browse Pitches** - Discover startups by sector and funding stage
- 🎯 **Filter & Search** - Find pitches in AI, FinTech, HealthTech, and more
- 📧 **Direct Contact** - Reach out to founders via email

### Platform Features
- 🔐 **Secure Authentication** - JWT-based auth with refresh tokens
- ☁️ **Cloud Storage** - Videos and images stored on Cloudinary
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- ⚡ **Fast & Modern** - Built with Vite for lightning-fast development

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **Vite 7** | Build Tool |
| **React Router 6** | Navigation |
| **Axios** | HTTP Client |
| **CSS3** | Styling (Custom Design System) |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express 4** | Web Framework |
| **MongoDB** | Database |
| **Mongoose 8** | ODM |
| **JWT** | Authentication |
| **Cloudinary** | Media Storage |
| **Multer** | File Upload |
| **Bcrypt** | Password Hashing |

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account

### 1. Clone the repository
```bash
git clone https://github.com/Ammarfrfr/Learning-Backend.git
cd Learning-Backend
```

### 2. Setup Backend
```bash
cd learning-backend-final
npm install
```

Create `.env` file:
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/pitchvault
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your-access-token-secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Start the server:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:8000
```

Start the development server:
```bash
npm run dev
```

### 4. Open in browser
```
Frontend: http://localhost:5173
Backend:  http://localhost:8000
```

---

## 📚 API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/users/register` | Create new account |
| `POST` | `/api/v1/users/login` | Login |
| `POST` | `/api/v1/users/logout` | Logout |
| `POST` | `/api/v1/users/refresh-token` | Refresh access token |
| `GET` | `/api/v1/users/current-user` | Get current user |

### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `PATCH` | `/api/v1/users/update-account` | Update profile |
| `POST` | `/api/v1/users/change-password` | Change password |
| `PATCH` | `/api/v1/users/avatar` | Update avatar |
| `PATCH` | `/api/v1/users/cover-image` | Update cover image |

### Videos/Pitches
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/videos` | Get all pitches |
| `GET` | `/api/v1/videos/:id` | Get single pitch |
| `POST` | `/api/v1/videos` | Upload new pitch |
| `PATCH` | `/api/v1/videos/:id` | Update pitch |
| `DELETE` | `/api/v1/videos/:id` | Delete pitch |
| `GET` | `/api/v1/videos/user/my-videos` | Get user's pitches |
| `PATCH` | `/api/v1/videos/toggle/publish/:id` | Toggle publish status |

---

## 📸 Screenshots

### Home Page
```
┌─────────────────────────────────────────────────────────────┐
│  PitchVault          Browse  How It Works    [Get Started]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     Share Your Vision              │  📹 Live Pitches      │
│     With Investors Worldwide       │  ┌─────────────────┐  │
│                                    │  │ TechStartup AI  │  │
│     [Browse Pitches] [Learn More]  │  │ FinTech Corp    │  │
│                                    │  │ HealthAI Inc    │  │
│     500+ Pitches | 200+ Investors  │  └─────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Browse Pitches
```
┌─────────────────────────────────────────────────────────────┐
│  Discover Innovative Startups                               │
│                                                             │
│  [Search...]  [Sector ▼]  [Stage ▼]  [Sort ▼]              │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 📹       │  │ 📹       │  │ 📹       │  │ 📹       │   │
│  │ AI Pitch │  │ FinTech  │  │ HealthAI │  │ EdTech   │   │
│  │ $500K    │  │ $1M      │  │ $250K    │  │ $2M      │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
pitchvault/
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── api/                 # API configuration
│   │   ├── components/          # Reusable components
│   │   ├── contexts/            # React Context (Auth)
│   │   ├── pages/               # Page components
│   │   └── main.jsx             # Entry point
│   ├── DOCS/                    # Frontend documentation
│   └── package.json
│
├── learning-backend-final/      # Express Backend
│   ├── src/
│   │   ├── controllers/         # Route handlers
│   │   ├── middlewares/         # Auth, file upload
│   │   ├── models/              # Mongoose models
│   │   ├── routes/              # API routes
│   │   ├── utils/               # Helper functions
│   │   └── index.js             # Entry point
│   └── package.json
│
└── README.md
```

---

## 🎨 Design System

| Element | Value |
|---------|-------|
| **Primary Color** | `#0a0a0a` (Black) |
| **Accent Color** | `#c9a84c` (Gold) |
| **Background** | `#f5f0e8` (Cream) |
| **Heading Font** | Instrument Serif |
| **Body Font** | DM Sans |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Ammar Shaikh**

- GitHub: [@Ammarfrfr](https://github.com/Ammarfrfr)

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Made with ❤️ for founders and investors

</div>
