# 🏏 CricketCraze

An interactive full-stack cricket trivia quiz application. CricketCraze tests your knowledge of cricket facts, records, and history through a sleek, responsive interface with real-time progress tracking.

---

## 🚀 Features

- **Multiple Difficulty Levels**: Easy, Medium, and Hard question sets tailored for every fan.
- **Timed Questions**: Intense 10-second countdown per question to keep you on your toes.
- **Real-time Scoring**: Instant feedback on correct/incorrect answers with custom audio effects.
- **Progress Tracking**: Securely save your quiz scores and history to your profile.
- **Authentication**: Secure login/signup powered by Firebase Authentication.
- **Theme Toggle**: Stunning Dark and Light mode support with preference persistence.
- **Responsive Design**: Fluid experience across Mobile, Tablet, and Desktop.

---

## 🏗️ Project Architecture

CricketCraze follows a modern **Client-Server architecture** with a clear separation of concerns:

- **Frontend**: A vanilla JavaScript SPA (Single Page Application) that handles the game logic, UI rendering, and direct Firebase Auth integration.
- **Backend**: A Node.js/Express server that acts as a secure data layer, managing user progress and interacting with Firestore.
- **Database**: Google Cloud Firestore for scalable, real-time data storage.

---

## 🛠️ Tech Stack

### Frontend
- **HTML5 & CSS3**: Semantic structure and premium glassmorphic design.
- **JavaScript (ES6+)**: Custom game engine and sound synthesis.
- **Firebase Auth**: Client-side identity management.
- **Web Audio API**: Dynamic sound effects without external assets.

### Backend
- **Node.js & Express**: High-performance RESTful API.
- **Firebase Admin SDK**: Secure server-side access to Firestore and Auth verification.
- **CORS**: Configured for secure cross-origin communication.

---

## 📡 RESTful API (Backend Integration)

Yes, CricketCraze uses a **RESTful API** for handling sensitive operations like progress tracking. The backend exposes several endpoints:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/progress` | Fetch current user's quiz history | 🔒 Yes |
| `POST` | `/api/progress` | Save a new quiz result | 🔒 Yes |
| `GET` | `/api/test/protected` | Connectivity and security test | 🔒 Yes |

> [!NOTE]  
> All protected routes require a valid Firebase ID Token passed in the `Authorization: Bearer <token>` header.

---

## 📂 Project Structure

### Frontend (`CricketCraze/`)
```text
├── index.html        # Main entry point & UI structure
├── style.css         # Premium styles & Dark mode tokens
├── script.js         # Core Game Logic & API Integration
├── auth.js           # Firebase Auth Handlers
├── firebase.js       # Firebase Configuration
├── questions.json    # Local question database
└── history.html      # Progress dashboard
```

### Backend (`CricketCraze-Backend/`)
```text
├── server.js         # Express server entry point
├── config/           # Firebase Service Account Config
├── middleware/       # Auth token verification middleware
└── routes/           # API route definitions
```

---

## ⚙️ Getting Started

### 1. Frontend Setup
1. Clone the repo: `git clone https://github.com/AKSH-NAIK/CricketCraze.git`
2. Open `index.html` in your browser or serve via `npx serve`.

### 2. Backend Setup (Optional for local development)
1. Repository: [CricketCraze-Backend](https://github.com/AKSH-NAIK/CricketCraze-Backend)
2. Follow the instructions in the backend README to set up `serviceAccountKey.json`.
3. Run `npm start` to host the API on `http://localhost:5000`.

---

## 📄 License
This project is licensed under the MIT License.

## 👤 Author
**Aksh Naik**  
GitHub: [@AKSH-NAIK](https://github.com/AKSH-NAIK)
