# 🌐 Real-Time Digital Skill Passport Platform (SkillPassport-Pro)

> A full-stack, real-time web application transforming fragmented student resumes into a unified, dynamically verifiable **Digital Skill Passport**. Features live Recharts skill radar visualizations, immutable QR code resolution, administrative verification audits with cryptographic-style seals, recruiter talent scout filtering, and instantaneous cross-client WebSockets.

---

## 🚀 Key System Features

- **Dynamic Skill Radar**: Real-time aggregation of technical proficiencies across Programming, Web Dev, Databases, AI/ML, and Cloud into interactive Recharts Radar and Bar charts.
- **Permanent Digital QR Code**: Each student receives an immutable passport identifier (`DSP-XXXX`) and permanent QR code that resolves to their public passport (`/passport/:passportId`) without login.
- **Administrative Verification Queue**: University or accreditation admins review uploaded certificate proofs in PDF/PNG/JPG format, approve or reject them with feedback, and stamp digital credentials with instant Socket.IO broadcasts.
- **Recruiter Talent Scout Portal**: Multi-criteria search engine filtering candidates across universities by specific skills (React, Python, Node), degrees, institutions, profile completion match percentages, and verified-only credentials.
- **Zero-Refresh Real-Time Sync**: Changes made in student portals instantly update the public passport and recruiter views over Socket.IO without page refreshing.
- **Security & Hardening**: Bcrypt password hashing, JWT authorization, Helmet HTTP headers, deep NoSQL/script sanitization, API rate limiting, and an ErrorBoundary wrapper.

---

## 🔐 Pre-Seeded Demonstration Accounts

| Role | Email Address | Password | Portal Features |
| :--- | :--- | :--- | :--- |
| **Student** | `student@dsp.edu` | `Student@123` | Full dashboard, Skills radar, Projects, Certificates, QR code, Resume, Profile completion meter |
| **Student (MIT)** | `david@mit.edu` | `Student@123` | B.Tech candidate profile with pre-populated skills and live passport |
| **Recruiter** | `recruiter@techhire.com` | `Recruiter@123` | Candidate talent scout search, skill filter chips, resume downloads, passport inspection |
| **Admin** | `admin@dsp.gov` | `Admin@123` | Verification audit queue, one-click verify stamp, reject with feedback modal |

---

## 🛠️ Quickstart Guide (Local Development)

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **MongoDB**: Optional (If local MongoDB is not running, the application automatically boots an in-memory MongoDB server with zero manual setup required!)

### 2. Setup & Run
Open the workspace directory in VS Code:
```powershell
cd C:\Users\DELL\Desktop\SkillPassport-Pro
```

Install root, backend, and frontend dependencies:
```powershell
npm run install-all
```

Seed initial demonstration users, profiles, and verified credentials:
```powershell
npm run seed
```

Start both backend API (`port 5000`) and frontend Vite development server (`port 5173`):
```powershell
npm run dev
```

Open your browser to:
- **Frontend App**: `http://localhost:5173`
- **Backend API Health Check**: `http://localhost:5000/api/health`

---

## 🐳 Docker Deployment

To launch the full stack with MongoDB, Node.js API, and Nginx reverse proxy in Docker:

```powershell
docker-compose up --build
```

Access:
- **Application Frontend**: `http://localhost`
- **Backend API**: `http://localhost:5000/api/health`
- **MongoDB**: `localhost:27017`

---

## 🧪 Automated Verification Suite

Run the 11-scenario end-to-end verification script:
```powershell
cd backend
node tests/verifyAllScenarios.js
```

Results:
```text
[PASS] Scenario 1: Student Registration & Password Bcrypt Hashing
[PASS] Scenario 2: Profile Creation & Dynamic Completion Calculation
[PASS] Scenario 3: Skills Register & Proficiency Levels for Radar Chart
[PASS] Scenario 4: Project Creation with Tech Stack & Repository Links
[PASS] Scenario 5: Certificate Upload Initialized with PENDING Status
[PASS] Scenario 6: Admin Verification Queue Discovery
[PASS] Scenario 7: Admin Approval & Status Transition to VERIFIED
[PASS] Scenario 8: Socket.IO Room Keying (student_${id}, passport_${passportId})
[PASS] Scenario 9: Public QR Passport Aggregation (/passport/:passportId)
[PASS] Scenario 10: Recruiter Search by Skill ("React.js")
[PASS] Scenario 11: Candidate Card Linkage to Live Digital Skill Passport
================================================================
VERIFICATION RESULTS: 11 PASSED / 0 FAILED
================================================================
```

---

## 🗺️ Roadmap & Phase Completion Audit

- [x] **Phase 1**: Project Architecture, Concurrent Root Scripts, Diagnostics UI.
- [x] **Phase 2**: MongoDB & Mongoose Schemas (User, Profile, Skill, Project, Certificate, Education, Experience, Achievement).
- [x] **Phase 3**: Authentication, Bcrypt Hashing, JWT Tokens, Role-Based Route Guards (`student`, `recruiter`, `admin`).
- [x] **Phase 4**: Student Profile, Dynamic Completion Meter, Responsive Sidebar Layout.
- [x] **Phase 5**: Skills & Projects CRUD, Category Aggregation, Live Recharts Radar Chart.
- [x] **Phase 6**: Certificate Vault, Multer File Uploads (PDF/PNG/JPG), Document Viewer.
- [x] **Phase 7**: Honors & Achievements, Education Timeline, Professional Experience Records.
- [x] **Phase 8**: Admin Verification Control Room, Live Queue, One-Click Verify Stamp, Feedback Rejection.
- [x] **Phase 9**: Public Digital Skill Passport (`/passport/:passportId`), QR Code Generator, Print/PDF Styling.
- [x] **Phase 10**: Recruiter Talent Scout, Multi-Criteria Skill & Degree Filters, Candidate Cards.
- [x] **Phase 11**: Real-Time Socket.IO Synchronization, Global Toast Alerts, Live Audience Counter.
- [x] **Phase 12**: Security Hardening, Helmet Headers, Rate Limiting, Input Sanitization, React Error Boundary, Automated Test Suite.
- [x] **Phase 13**: Production Deployment Configurations (Dockerfiles, Nginx Reverse Proxy, Docker Compose, Render.yaml, Environment Templates).
