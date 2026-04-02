<div align="center">

<h1>🏙️ Shaharnaama</h1>
<h3><em>Chronicles of Cities — Explore · Connect · Chat</em></h3>

<p><strong>"हर शहर की अपनी कहानी है — शहरनामा उसे सुनाता है।"</strong><br/>
<em>"Every city has a story — Shaharnaama brings it to life."</em></p>

<br/>

[![Live Demo](https://img.shields.io/badge/Live%20Demo-odyssey--qkji.onrender.com-6D28D9?style=for-the-badge&logo=render&logoColor=white)](https://odyssey-qkji.onrender.com/Hero)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time%20Chat-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io)
[![Gemini](https://img.shields.io/badge/Google-Gemini%202.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

> 🌍 **Discover cities. Share your stories. Connect with fellow explorers — through a live community feed, group chats, and real-time direct messaging.**

<br/>

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Contributors](#-contributors)
- [License](#-license)

---

## 🌆 Overview

**Shaharnaama** is an AI-powered, full-stack web platform that lets explorers discover the stories, culture, and art of cities — and connect with a global community of fellow travellers.

At its heart, Shaharnaama is a **social platform for city lovers**. Users share travel stories through a community feed, chat in real time — one-on-one or inside group rooms — and build connections over shared experiences. Every city page becomes a meeting point: explore, discuss, quiz each other, and climb a shared leaderboard together.

On top of the social layer, the platform integrates **Google Gemini 2.5 Flash** for intelligent city content generation, **multi-API interactive maps** (Mapbox GL, Leaflet, Google Maps) with a Virtual Walk mode, **JWT + Google OAuth 2.0 authentication**, and a fully **gamified points and badge system** — making it a production-grade, feature-rich application.

---

## 🚀 Live Demo

**[https://odyssey-qkji.onrender.com/Hero](https://odyssey-qkji.onrender.com/Hero)**

> ⏱️ Hosted on Render's free tier — may take **30–60 seconds to spin up** on first load.

---

## ✨ Key Features

### 🌐 Community Feed — Share, Connect & Engage

The social backbone of Shaharnaama. Every explorer has a voice.

- Users can **create posts** with images, attach them to a city, and share experiences with the entire community — images are uploaded directly to **Cloudinary via Multer**.
- Posts support **nested comments with replies**, likes, bookmarks, and deletion — all JWT-protected, ensuring only authenticated users can interact.
- The feed is sorted by recency and enriched with **relative timestamps**, author avatars, city tags, and live like / comment counts.
- A **sidebar panel** surfaces live community stats: total posts, active members, total likes, trending cities, and latest activity — giving every page visit a sense of a living, active community.
- Every post and comment earns the author **community points**, which feed into the per-city leaderboard — making participation feel rewarding, not just social.

### 💬 Real-Time Chat — Direct Messages & Group Rooms (Socket.io)

Built for genuine connection between explorers.

- **Direct one-to-one messaging** — users can privately message any other member. Conversations are persisted in MongoDB and loaded on demand, so history is never lost between sessions.
- **Group chat rooms** — users can create or join named groups and chat together in real time. On connection, the Socket.io server automatically joins each user into all of their existing group rooms — no manual re-join needed.
- **Live typing indicators** — when a user is typing, their counterpart sees a real-time signal, making conversations feel alive and immediate.
- **Online presence tracking** via `userSocketMap` — all clients receive a live broadcast whenever a user connects or disconnects. A `lastSeen` timestamp is written to MongoDB on every disconnect, enabling accurate "last active" status.
- WebSocket connections are **JWT-authenticated at the handshake level** — the socket middleware decodes and verifies the token from the HTTP-only cookie before the connection is established, rejecting unauthenticated clients entirely.
- Architecture keeps concerns clean: the **REST API handles message persistence**, Socket.io handles **real-time relay only**.

### 🏆 Gamified Leaderboard, Badges & Explorer Ranks

Turns community participation into friendly competition.

- Every meaningful action earns points: **+10 per post**, **+10 per correct quiz answer**, comment points tracked separately — all stored in a `CityPoints` collection scoped per user per city.
- Leaderboard renders a **top-3 podium** with animated rank icons, and a detailed breakdown bar showing each user's quiz / comment / post point split. Fully **sortable** by total score, quiz performance, or post activity.
- **Six badge tiers** awarded automatically by total point threshold:

  | Points | Badge |
  |--------|-------|
  | 0      | 👤 No Points Yet |
  | 1–19   | 🌱 Newcomer |
  | 20–49  | 🌿 Local Explorer |
  | 50–99  | ⭐ City Adventurer |
  | 100–199| 💎 Elite Traveller |
  | 200+   | 🏆 Legend Explorer |

### 🤖 AI-Powered City Intelligence & Adaptive Quiz Engine

Powered by Google Gemini 2.5 Flash — every city comes alive.

- Dynamically generates **city descriptions**, curated **must-do activity lists**, and **3 adaptive quiz questions** per city on demand — no static content, everything is fresh and context-aware.
- Implements a **12-hour MongoDB cache layer (TTL-based)** — if a city's AI data is fresh in the database, Gemini is never called, reducing API cost and response latency significantly.
- Gemini also serves as a **geocoder fallback**: converts arrays of city names to `lat/lng` coordinates when not found in the local cache, with results persisted for future requests.
- Quiz answers are **graded server-side** (behind a JWT-protected route) — scores are calculated securely, and each correct answer earns **+10 points** added to the user's city leaderboard score.

### 🗺️ Multi-API Interactive Maps & Virtual Walk

Three mapping APIs, one seamless exploration experience.

- **Mapbox GL** powers an **auto-rotating 3D globe** on the homepage, plotting top cities as markers with live visit counts. Rotation pauses on user interaction and auto-resumes after 3 seconds.
- **Virtual Walk mode** — geocodes a city via Geoapify, fetches nearby POIs, builds a **nearest-neighbour walking route** through up to 10 stops. Each stop dynamically fetches a photo from the **Unsplash API**, and the camera flies in with pitch + bearing animation for a 3D immersive fly-through.
- **Personal visited-cities heatmap** — users mark cities as visited; the backend tracks unique visitor counts per city, and a Mapbox heatmap visualises the user's global journey.
- City coordinates are cached in MongoDB via Gemini geocoding — no repeat API calls for the same location.

### 🔐 Multi-Strategy Auth with OTP Email Verification

Secure, flexible, and production-grade authentication.

- **Passport.js** orchestrates three independent strategies: Local (email + password via `passport-local-mongoose`), **Google OAuth 2.0** (`passport-google-oauth20`), and JWT (`passport-jwt`) with dual token extraction — HTTP-only cookie AND `Authorization: Bearer` header.
- Signup requires **email OTP verification** — a 6-digit code is sent via Nodemailer (Gmail SMTP) and stored in MongoDB with a **5-minute TTL expiry**. The account is only created on successful verification.
- JWT is issued on login and stored as an **`HttpOnly`, `Secure`, `SameSite=None` cookie** for secure cross-origin auth. Google OAuth flow also terminates with a cookie-set redirect back to the React frontend.
- All sensitive backend routes use `passport.authenticate("jwt", { session: false })`. The frontend protects pages with a `<ProtectedRoute>` component backed by a `/status` check with `Cache-Control: no-store`.

### 📊 Personal Dashboard, Analytics & Dark Mode

A full profile and stats hub for every user.

- Dashboard aggregates personal stats, quiz history on **Chart.js line & bar charts**, city-point breakdowns per location, and a visited-cities Mapbox map — all fetched in a single `Promise.all` for minimal load time.
- Users can update their name, bio, and default city, and upload a **profile photo streamed directly to Cloudinary** via Multer memory storage — no temporary disk writes.
- Activity tab displays the user's own posts and comments with **in-place deletion** — removing a post also reverses its associated points from `CityPoints`.
- **Dark / light mode toggle** persisted in `localStorage` via React Context (`ThemeContext`), applied as a class on the document root for full Tailwind CSS dark mode compatibility.

---

## 🧱 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19 | Core UI framework |
| **React Router** | v7 | Client-side routing |
| **Tailwind CSS** | 3.4 | Utility-first styling |
| **shadcn/ui** | latest | Accessible component library |
| **DaisyUI** | 5 | Tailwind component plugin |
| **Framer Motion** | 12 | Animations & page transitions |
| **Lucide React** | latest | Icon system |
| **Axios** | 1.12 | HTTP client |
| **Socket.io-client** | 4.8 | Real-time WebSocket client |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | LTS | JavaScript runtime |
| **Express.js** | 4.21 | Web framework & REST API |
| **Socket.io** | 4.8 | Real-time bidirectional communication |
| **Passport.js** | 0.7 | Authentication middleware |
| **passport-local** | 1.0 | Local email/password strategy |
| **passport-google-oauth20** | 2.0 | Google OAuth 2.0 strategy |
| **passport-jwt** | 4.0 | JWT verification strategy |
| **jsonwebtoken** | 9.0 | JWT signing & verification |
| **bcrypt** | 6.0 | Password hashing |
| **Nodemailer** | 8.0 | OTP email delivery via Gmail SMTP |
| **Multer** | 2.0 | Multipart file upload handling |
| **Cloudinary** | 1.41 | Cloud media storage & CDN |

### Database

| Technology | Purpose |
|------------|---------|
| **MongoDB** | Primary NoSQL database |
| **Mongoose** | ODM — schema definition, validation, queries |
| **TTL Indexes** | Auto-expiring OTP tokens & Gemini cache documents |

### AI & External APIs

| API / Service | Purpose |
|---------------|---------|
| **Google Gemini 2.5 Flash** | City content generation, quiz creation, geocoding fallback |
| **Google Maps API** | Places data & map tiles |
| **Mapbox GL** | 3D globe, virtual walk map, personal heatmap |
| **Geoapify** | City-name to coordinates geocoding |
| **Unsplash API** | Live place photos for Virtual Walk mode |

### Mapping Libraries

| Library | Purpose |
|---------|---------|
| **react-map-gl / mapbox-gl** | 3D Mapbox globe & virtual walk |
| **React Leaflet / Leaflet** | Lightweight city detail maps |
| **@react-google-maps/api** | Google Maps integration |
| **geolib** | Geospatial distance calculations |

### Charts & Data Visualisation

| Library | Purpose |
|---------|---------|
| **Chart.js + react-chartjs-2** | Admin dashboard line & bar charts |
| **Recharts** | Community stats & leaderboard visuals |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React 19)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Pages   │  │Components│  │  Contexts│  │  Socket.io    │  │
│  │Hero      │  │Map       │  │UserCtx   │  │  Client       │  │
│  │Community │  │Leaderboard│ │ThemeCtx  │  │(JWT via cookie)│  │
│  │ChatPage  │  │VirtualWalk│ └──────────┘  └───────────────┘  │
│  │Admin     │  │SoundBox  │                                     │
│  └──────────┘  └──────────┘                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / WSS
┌────────────────────────────▼────────────────────────────────────┐
│                    SERVER (Node.js + Express)                    │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐│
│  │  REST Routes │  │  Socket.io   │  │  Passport.js           ││
│  │  /api/users  │  │  Server      │  │  ├─ Local Strategy     ││
│  │  /api/listing│  │  ├─ Direct   │  │  ├─ Google OAuth 2.0   ││
│  │  /api/comm.. │  │  │  Messages │  │  └─ JWT Strategy       ││
│  │  /api/quiz   │  │  ├─ Groups   │  └────────────────────────┘│
│  │  /api/gemini │  │  └─ Presence │                             │
│  └──────┬───────┘  └──────────────┘                             │
│         │                                                        │
│  ┌──────▼──────────────────────────────────────────────────┐   │
│  │                    Controllers                           │   │
│  │  geminiController · Generateinfo · listings · groups    │   │
│  │  messages · user · comments · QuizResult · generateSound│   │
│  └──────┬──────────────────────────────────────────────────┘   │
└─────────┼────────────────────────────────────────────────────────┘
          │
┌─────────▼────────────────────────────────────────────────────────┐
│                     External Services                             │
│  ┌────────────┐ ┌───────────┐ ┌──────────┐ ┌─────────────────┐  │
│  │  MongoDB   │ │  Gemini   │ │Cloudinary│ │  Mapbox /       │  │
│  │  Atlas     │ │  2.5 Flash│ │  CDN     │ │  Geoapify /     │  │
│  │            │ │           │ │          │ │  Unsplash       │  │
│  └────────────┘ └───────────┘ └──────────┘ └─────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Data Flow — AI City Info with Caching

```
User requests city info
        │
        ▼
Check MongoDB cache (CityData collection)
        │
   ┌────┴──────────────────────────┐
   │ Cache hit AND age < 12 hours? │
   └──┬─────────────────────────┬──┘
      │ YES                     │ NO
      ▼                         ▼
Return cached data      Call Gemini 2.5 Flash
                               │
                               ▼
                        Parse JSON response
                               │
                               ▼
                    Upsert into MongoDB cache
                               │
                               ▼
                        Return to client
```

### Real-Time Chat Flow

```
Client A sends message
        │
        ▼
POST /api/messages/send/:id  ──►  Save to MongoDB
        │
        ▼
Socket.io emit "send_message"
        │
        ▼
Server looks up receiverSocketId
in userSocketMap
        │
        ▼
io.to(socketId).emit("receive_message")
        │
        ▼
Client B receives message instantly
```

---

## 📁 Project Structure

```
ODA-main/
├── backend/
│   ├── app.js                    # Express app entry point
│   ├── bin/www                   # HTTP server bootstrap
│   ├── config/
│   │   ├── cloudinary.js         # Cloudinary SDK config
│   │   ├── passport.js           # JWT strategy setup
│   │   ├── socket.js             # Socket.io server + JWT auth middleware
│   │   └── upload.js             # Multer + Cloudinary storage engine
│   ├── controllers/
│   │   ├── Generateinfo.js       # Gemini city info + 12hr cache
│   │   ├── geminiController.js   # Gemini geocoding + DB cache
│   │   ├── generateSound.js      # AI ambient sound generation
│   │   ├── groups.js             # Group creation & messaging
│   │   ├── listings.js           # City listings CRUD
│   │   ├── messages.js           # Direct message logic
│   │   ├── comments.js           # Comment system
│   │   ├── QuizResult.js         # Quiz result retrieval
│   │   └── user.js               # User auth & profile
│   ├── models/
│   │   ├── users.js              # User schema (passport-local-mongoose)
│   │   ├── listings.js           # City listing schema
│   │   ├── Post.js               # Community post schema
│   │   ├── messages.js           # Direct message schema
│   │   ├── Group.js              # Group chat schema
│   │   ├── CityData.js           # Gemini response cache (12hr TTL)
│   │   ├── CityPoints.js         # Per-user per-city points tracker
│   │   ├── quizResult.js         # Quiz attempt records
│   │   ├── otp.js                # OTP with 5-minute TTL expiry
│   │   ├── comment.js            # Comment + reply schema
│   │   ├── Places.js             # POI data schema
│   │   ├── city.js               # Geocoded city coordinate cache
│   │   ├── category.js           # Listing category schema
│   │   └── quiz.js               # Quiz schema
│   ├── routes/
│   │   ├── users.js              # Auth, profile, visit tracking
│   │   ├── community.js          # Posts, likes, comments, points
│   │   ├── listings.js           # City listing endpoints
│   │   ├── message.route.js      # Direct message routes
│   │   ├── group_route.js        # Group management routes
│   │   ├── submitQuiz.js         # Quiz submit + server-side scoring
│   │   ├── GenerateInfo.js       # Gemini city info route
│   │   ├── geminiRoute.js        # Gemini geocoding route
│   │   ├── cityPoints.js         # Leaderboard data routes
│   │   ├── places.js             # POI routes
│   │   ├── sendOTP.js            # OTP dispatch
│   │   ├── upload.js             # File upload route
│   │   ├── generateSound.js      # Sound generation route
│   │   ├── QuizResult.js         # Quiz history route
│   │   └── index.js              # Root route
│   └── utils/
│       └── verifyEmail.js        # Nodemailer OTP sender
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js                # Router + layout shell
        ├── UserContext.js        # Global authenticated user state
        ├── ThemeContext.js       # Dark / light mode context
        ├── components/
        │   ├── Header.js
        │   ├── Footer.js
        │   ├── Map.js            # Auto-rotating Mapbox globe
        │   ├── Leaderboard.js    # Podium + badge tiers
        │   ├── Timeline.js       # City history timeline
        │   ├── SoundBox.js       # AI ambient soundscape player
        │   ├── CityInfo.js       # Gemini city info + quiz UI
        │   ├── CreatePost.jsx    # Community post creation modal
        │   ├── UserVisitedMap.js # Personal visited-cities heatmap
        │   ├── MessageInput.js   # Chat input component
        │   ├── MessageList.js    # Chat message list component
        │   ├── ProtectedRoute.js # Auth route guard
        │   ├── ThemeToggle.js    # Dark / light switch
        │   ├── ScrollToTop.js
        │   ├── Admin/
        │   │   ├── AdminOverview.js
        │   │   ├── AdminAnalytics.js
        │   │   ├── AdminProfile.js
        │   │   ├── AdminActivity.js
        │   │   └── AdminShared.js
        │   └── VirtualWalk/
        │       ├── VirtualWalkMap.js   # Mapbox 3D walk + Unsplash photos
        │       └── InfoPanel.js
        ├── pages/
        │   ├── Hero.js           # Landing / city explore page
        │   ├── Specific.js       # Individual city detail page
        │   ├── Community.jsx     # Social feed + sidebar stats
        │   ├── ChatPage.jsx      # Real-time DM + group chat UI
        │   ├── Admin.js          # Personal dashboard & analytics
        │   ├── Explore.js        # City browsing page
        │   ├── LoginPage.js
        │   ├── SignupPage.js
        │   └── Check.js
        └── utils/
            ├── config.js         # BACKEND_URL config
            └── socket.js         # Socket.io client singleton
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- API keys for: Gemini, Cloudinary, Mapbox, Google Maps, Geoapify, Unsplash

### 1. Clone the Repository

```bash
git clone https://github.com/lucky1426shrma/ODA.git
cd ODA
```

### 2. Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configure Environment Variables

Create `backend/.env` and `frontend/.env` with your API keys and secrets (MongoDB URI, JWT secret, Gemini key, Cloudinary credentials, Google OAuth credentials, Nodemailer config, Mapbox token, Geoapify key, Unsplash key).

### 4. Run the Application

```bash
# Backend (from /backend)
npm start

# Frontend (from /frontend)
npm start
```

Frontend → **`http://localhost:3000`** · Backend → **`http://localhost:5000`**

---

## 👨‍💻 Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/lucky1426shrma">
        <img src="https://github.com/lucky1426shrma.png" width="90px;" alt="Lucky Sharma"/><br/>
        <sub><b>Lucky Sharma</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Rockyoudead8">
        <img src="https://github.com/Rockyoudead8.png" width="90px;" alt="Arpit Goyal"/><br/>
        <sub><b>Arpit Goyal</b></sub>
      </a>
    </td>
  </tr>
</table>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [Lucky Sharma](https://github.com/lucky1426shrma) & [Arpit Goyal](https://github.com/Rockyoudead8)

</div>
