# CareDose — Medication Reminder & Caregiver Monitoring System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey.svg)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-MySQL%20%2F%20SQLite%20Fallback-orange.svg)](https://www.mysql.com/)

**CareDose** is a modern, portfolio-quality 3-tier healthcare platform designed to help patients effortlessly manage daily medications while empowering trusted caregivers to monitor adherence remotely in real time.

---

## 📁 Clean Repository Structure

```text
CareDose/
├── frontend/                   # Frontend (React 19, Vite, Tailwind CSS, Lucide Icons)
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── assets/             # Images and logos
│   │   ├── components/         # Modular React UI components
│   │   │   ├── AdherenceReport.jsx
│   │   │   ├── AppointmentModal.jsx
│   │   │   ├── AuthModal.jsx
│   │   │   ├── CaregiverDashboard.jsx
│   │   │   ├── DoseCard.jsx
│   │   │   ├── MedicineForm.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── PatientDashboard.jsx
│   │   ├── services/           # Frontend API client (services/api.js)
│   │   ├── App.jsx             # Main application state and router
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js          # Vite config with /api reverse proxy to :5000
├── backend/                    # Backend REST API (Node.js, Express, JWT, Bcrypt)
│   ├── config/
│   │   └── db.js               # Multi-engine DB connector (MySQL with auto SQLite fallback)
│   ├── middleware/
│   │   ├── auth.js             # JWT verification & role authorization
│   │   └── validate.js         # Input validation & sanitization
│   ├── routes/
│   │   ├── appointments.js     # Doctor appointment management
│   │   ├── auth.js             # Authentication (register/login/me)
│   │   ├── caregivers.js       # Caregiver-patient linking & alerts
│   │   ├── medicines.js        # Prescription CRUD & stock decrement
│   │   ├── reports.js          # Adherence metrics & analytics
│   │   └── schedules.js        # Daily medication time slots & dose logs
│   ├── .env.example            # Sample environment variables
│   ├── package.json
│   └── server.js               # Express application entrypoint
├── database/                   # Database schemas & seed scripts
│   ├── schema.sql              # MySQL DDL table creation script
│   └── seed.sql                # Default test records & accounts
├── .gitignore                  # Project-wide ignore rules (node_modules, .env, *.db)
├── package.json                # Root package manager (unified dev, build & install scripts)
├── FEATURES.md                 # Detailed functional specifications
└── README.md                   # Project documentation & setup guide
```

---

## 🌟 Key Features

### 👤 1. User Authentication & Role Management
- **Two Distinct Dashboards**: Dedicated interfaces for **Patients** and **Caregivers** tailored to their specific needs.
- **JWT Session Security**: Secure token-based authentication with bcrypt password hashing.
- **Patient Invite Codes**: Patients receive a unique invite code (e.g., `PAT-8842-CD`) to easily link trusted caregivers.

### 💊 2. Medication Management & Automated Daily Schedule
- **Prescription Tracking**: Add, edit, and delete medications with name, dosage, frequency, remaining stock quantity, and refill warning thresholds.
- **Automated Alarm Slots**: Multiple time slot schedules per medicine (e.g., `08:00 AM`, `02:00 PM`, `08:00 PM`).
- **Stock Decrement & Low-Stock Alerts**: Marking a dose as "Taken" automatically decrements medication stock in real-time and triggers low-stock warnings when inventory falls below thresholds.
- **1-Click Refill Action**: Instantly add stock to low medications.

### 🩺 3. Caregiver Remote Monitoring Station
- **Multi-Patient Overview**: Caregivers view linked patients with 30-day compliance percentage badges and active alert indicators.
- **Real-Time Alert Surfaces**: High-visibility warning cards for missed doses today and critical low-stock items across all linked patients.
- **Patient Inspection File**: Full read-only access to inspect any linked patient's daily dose schedule, prescription cabinet, upcoming appointments, and adherence history.

### 📅 4. Doctor Appointment Management
- **Chronological Scheduling**: Keep track of upcoming doctor consultations with specialist names, date/time, and preparation notes.

### 📊 5. Visual Adherence Analytics
- **Compliance Tracking**: Weekly (7-day) and Monthly (30-day) adherence percentages built with pure React & CSS progress bars.
- **Daily Trend Bar Chart**: 7-day visual breakdown of taken vs. missed doses per day.
- **Medication Compliance Breakdown**: Per-medicine adherence percentages table.

---

## 🏗️ 3-Tier Architecture & System Diagrams

CareDose strictly implements an enterprise-grade **3-Tier Web Architecture**:

### 1. High-Level Architectural Flow Diagram

```mermaid
graph TD
    subgraph Presentation_Layer["📱 Presentation Layer (Frontend - React 19 + Vite)"]
        UI_Patient["Patient Portal (Dashboard, DoseCard, Cabinet, Appointments)"]
        UI_Caregiver["Caregiver Station (Linked Patients, Live Alerts, Adherence Stats)"]
        UI_Landing["Landing & Auth (Session State, JWT Storage, Invite Codes)"]
        API_Client["API Service Client (services/api.js + Fetch API)"]
    end

    subgraph Application_Layer["⚙️ Application / Logic Layer (Node.js + Express REST API)"]
        GW["Express Gateway / CORS / Security Headers / Rate Limiter"]
        Auth_MW["Auth Middleware (verifyToken & requireRole)"]
        Valid_MW["Validation Middleware (validateMedicine & validateAppointment)"]
        
        subgraph Controllers["Route Handlers (/api/*)"]
            R_Auth["/api/auth (Login, Register, Session)"]
            R_Med["/api/medicines (Prescriptions, Search, Stock Refill)"]
            R_Sched["/api/schedules (Today's Slots, Dose Status)"]
            R_Care["/api/caregivers (Linking, Alerts, Supervision)"]
            R_Appt["/api/appointments (Doctor Consultations)"]
            R_Rep["/api/reports (Weekly/Monthly Analytics)"]
        end
    end

    subgraph Data_Layer["🗄️ Data Layer (Relational Storage)"]
        DB_Adapter["Multi-Engine DB Adapter (config/db.js)<br/>(Auto Fallback & Parameterized Prepared Statements)"]
        MySQL_DB[("Primary Database<br/>MySQL 8.0+")]
        SQLite_DB[("Embedded Fallback<br/>SQLite (Zero-Config)")]
    end

    UI_Patient --> API_Client
    UI_Caregiver --> API_Client
    UI_Landing --> API_Client

    API_Client -- "HTTPS / JSON REST API" --> GW
    GW --> Auth_MW
    GW --> Valid_MW
    Auth_MW --> Controllers
    Valid_MW --> Controllers

    Controllers --> DB_Adapter
    DB_Adapter -.->|"If MySQL active"| MySQL_DB
    DB_Adapter -.->|"If MySQL offline"| SQLite_DB
```

---

### 2. Real-Time Multi-Device Adherence & Alert Flow

```mermaid
sequenceDiagram
    autonumber
    actor Patient as 👤 Patient (Mobile Device)
    participant Server as ⚙️ CareDose Server (Express API)
    participant DB as 🗄️ Relational Database (MySQL / SQLite)
    actor Caregiver as 🩺 Caregiver (Laptop / Desktop)

    Patient->>Server: PATCH /api/doses/:id/status { status: 'taken' }
    Note over Server: verifyToken checks Patient JWT & validates slot
    Server->>DB: UPDATE dose_logs SET status='taken', logged_at=NOW()
    Server->>DB: UPDATE medicines SET stock_qty = stock_qty - 1
    DB-->>Server: Rows affected (Stock auto-decremented)
    Server-->>Patient: 200 OK (Dose logged, Stock updated)

    Note over Caregiver: Remote Caregiver inspects patient
    Caregiver->>Server: GET /api/caregivers/alerts & /reports/adherence
    Server->>DB: Aggregates taken vs. missed doses & remaining stock
    DB-->>Server: Returns live compliance % & active safety alerts
    Server-->>Caregiver: 200 OK (Updated adherence chart & safe status)
```

---

### 3. Technology Stack Breakdown

| Layer | Technologies & Libraries | Key Responsibilities |
| :--- | :--- | :--- |
| **Presentation (Frontend)** | React 19, Vite 8, Tailwind CSS v4, Lucide React | Responsive UI, state management, relative timing tags, compliance charts, and micro-animations |
| **Application (Backend)** | Node.js, Express.js 4.19, CORS, Dotenv | REST API routing, business logic, inventory calculation, schedule auto-generation |
| **Security & Hardening** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, Rate Limiter | JWT session validation, role authorization, bcrypt salt-round 10, brute-force mitigation |
| **Data Layer (Database)** | MySQL 8.0+ (`mysql2/promise`) / SQLite3 (`sqlite3`) | Relational integrity, foreign keys, prepared statements, zero-config embedded fallback |
| **DevOps & Deployment** | Render, Single-Service Static Serving | Automated cloud CI/CD, production builds, single-port fullstack reverse proxy |

---

## 🗄️ Database Schema (`database/schema.sql`)

The database schema comprises 6 relational tables:

```sql
users (id, name, email, password_hash, role ['patient'/'caregiver'], invite_code, created_at)
caregiver_links (id, patient_id, caregiver_id, status ['pending'/'active'], created_at)
medicines (id, patient_id, name, dosage, frequency, stock_qty, refill_threshold, created_at)
schedules (id, medicine_id, time_slot)
dose_logs (id, schedule_id, date, status ['taken'/'missed'/'pending'], logged_at)
appointments (id, patient_id, doctor_name, date_time, notes, created_at)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18 or higher
- **MySQL**: (Optional — if not installed or running, the server automatically uses the built-in embedded SQLite database `backend/caredose_local.db`)

---

### Option A: 1-Command Unified Startup (Recommended)

From the project root:

```bash
# 1. Install all dependencies (root, backend, and frontend)
npm run install:all

# 2. Start both Backend & Frontend concurrently
npm run dev
```

- **Backend API**: runs at [http://localhost:5000](http://localhost:5000)
- **Frontend App**: runs at [http://localhost:3000](http://localhost:3000)

---

### Option B: Separate Terminal Startup

#### 1. Backend Setup (`/backend`)

```bash
cd backend
npm install
npm start
# REST API listening at http://localhost:5000
```

*Optional MySQL configuration in `backend/.env`:*
```env
PORT=5000
JWT_SECRET=caredose_super_secret_jwt_key_2026_healthcare_secure
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=caredose_db
DB_PORT=3306
NODE_ENV=development
```

*(To use MySQL, import `database/schema.sql` and `database/seed.sql`. If MySQL is not running, embedded SQLite activates automatically).*

#### 2. Frontend Setup (`/frontend`)

```bash
cd frontend
npm install
npm run dev
# React app opens at http://localhost:3000
```

---

## 🔑 Pre-seeded Demo Accounts

For instant testing, use the 1-click **Quick Demo Access** buttons on the sign-in page:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@caredose.com` | `Password123!` | Vrund Sutariya (Invite Code: `PAT-8842-CD`) |
| **Caregiver** | `caregiver@caredose.com` | `Password123!` | Vishesh Shah (Linked to Vrund) |

---

## 🔒 Security Hardening
- **Password Hashing**: `bcryptjs` with salt round 10.
- **Parameterized Queries**: All database operations use prepared statements to prevent SQL Injection.
- **Protected REST API Routes**: JWT token verification middleware (`verifyToken`, `requireRole`).
- **Input Validation**: Express validation middleware for registration, login, medicine, and appointment forms.
