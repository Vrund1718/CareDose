# CareDose — Feature Specification & System Documentation

**CareDose** is a portfolio-grade, full-stack 3-tier web application built to help patients seamlessly manage daily medications while empowering trusted caregivers to monitor adherence remotely in real time.

---

## 🏛️ System Architecture & Technology Stack

The application strictly adheres to a **3-Tier Web Architecture**:

```
 ┌─────────────────────────────────────────────────────────┐
 │               Presentation Layer (Frontend)             │
 │    React JS (Functional Components, Hooks, JSX)        │
 │    Styled entirely with Tailwind CSS & Lucide Icons     │
 └───────────────────────────┬─────────────────────────────┘
                             │ REST API (Fetch API / JSON)
 ┌───────────────────────────▼─────────────────────────────┐
 │            Application / Logic Layer (Backend)          │
 │    Node.js + Express.js REST API                        │
 │    JWT Authentication & Input Validation Middleware     │
 └───────────────────────────┬─────────────────────────────┘
                             │ Parameterized SQL Queries
 ┌───────────────────────────▼─────────────────────────────┐
 │                Data Layer (Database)                    │
 │    MySQL Relational Schema (users, caregiver_links,     │
 │    medicines, schedules, dose_logs, appointments)       │
 └─────────────────────────────────────────────────────────┘
```

---

## 🌟 Comprehensive Features Breakdown

### 🔑 1. User Authentication & Role-Based Access Control
- **Dual Role System**: Separate accounts and UI experiences for **Patients** and **Caregivers**.
- **JWT Session Security**: Secure JSON Web Token authentication stored in local browser state, verified on protected API routes via `verifyToken` middleware.
- **Password Hardening**: Passwords hashed with `bcryptjs` (salt round 10).
- **Patient Invite System**: Patients automatically receive a unique invite code (e.g., `PAT-8842-CD`) upon registration to link with caregivers.
- **Quick Demo Access**: 1-click demo login buttons for instant live testing (**Demo Patient** and **Demo Caregiver**).

---

### 💊 2. Patient Dashboard & Medication Management (`PatientDashboard.jsx`)
- **Today's Dose Schedule**:
  - Filterable tabs for **All**, **Upcoming/Pending**, **Taken**, and **Missed** doses.
  - Formatted time slot badges (e.g., `08:00 AM`, `02:00 PM`, `08:00 PM`).
- **Interactive Dose Reminders & Logging (`DoseCard.jsx`)**:
  - Patient marks a dose as **Taken** or **Missed**.
  - Automatically records exact execution timestamps (`logged_at`) in MySQL.
  - **Auto-Stock Decrement**: Marking a dose as "Taken" automatically decrements the medicine's remaining stock by 1. Reverting a dose restores the stock level.
- **Medication Cabinet (`MedicineForm.jsx`)**:
  - Add, edit, or delete prescription medicines.
  - Attributes: Medicine Name, Dosage (e.g., `10 mg`), Frequency (e.g., `Twice daily`), Stock Quantity, Refill Threshold, and multiple daily Time Slots.
- **Stock & Refill Reminders**:
  - Auto-surfaces a prominent **Low Stock Warning Banner** when stock quantity falls below the specified threshold.
  - **1-Click Refill**: Quick button to add +30 units to medication stock.
- **Doctor Appointment Reminders (`AppointmentModal.jsx`)**:
  - Add and delete doctor appointments (Doctor name/specialty, date & time, consultation notes).
  - Displayed in a chronologically sorted timeline on the dashboard.
- **Caregiver Link Card**:
  - Shows linked caregivers and provides a 1-click **Copy Invite Code** button.

---

### 🩺 3. Caregiver Remote Monitoring Station (`CaregiverDashboard.jsx`)
- **Multi-Patient Overview Cards**:
  - Lists all linked patients with 30-day compliance percentage badges (e.g. `92% Adherence`), active medication count, missed doses today count, and next appointment preview.
- **Real-Time Active Alert Surface**:
  - Prominently surfaces missed-dose alerts today and critical low-stock warnings across all linked patients.
- **Patient Link Modal**:
  - Caregiver can connect with a patient by entering their **Patient Invite Code** or **Patient Email**.
- **Deep Patient Inspection File (Read-Only)**:
  - Caregivers can click any linked patient to access a comprehensive inspection view showing their daily dose schedule, medicine cabinet, upcoming doctor visits, and full compliance reports.

---

### 📊 4. Adherence Analytics & Visual Reports (`AdherenceReport.jsx`)
- **Weekly & Monthly Compliance Ratings**:
  - 7-Day and 30-Day adherence percentage scores calculated dynamically.
  - Styled visual progress bars indicating adherence health status (*Excellent*, *Good*, *Moderate Risk*, *Needs Attention*).
- **7-Day Daily Trend Visual Bar Chart**:
  - Custom CSS flex-bar chart breaking down daily taken vs. missed doses over the last 7 days.
- **Medication Compliance Breakdown Table**:
  - Detailed table showing total doses scheduled, taken count, missed count, and compliance rate % per medicine.

---

## 🗄️ Database Schema & Relational Tables

Implemented with relational integrity, foreign keys, and cascading deletes:

```sql
-- 1. Users Table
users (id, name, email, password_hash, role ['patient'/'caregiver'], invite_code, created_at)

-- 2. Caregiver Links Table
caregiver_links (id, patient_id, caregiver_id, status ['pending'/'active'], created_at)

-- 3. Medicines Table
medicines (id, patient_id, name, dosage, frequency, stock_qty, refill_threshold, created_at)

-- 4. Schedules Table
schedules (id, medicine_id, time_slot)

-- 5. Dose Logs Table
dose_logs (id, schedule_id, date, status ['taken'/'missed'/'pending'], logged_at)

-- 6. Appointments Table
appointments (id, patient_id, doctor_name, date_time, notes, created_at)
```

---

## 🔌 REST API Structure

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new Patient or Caregiver | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token (Rate-limited) | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/medicines` | Get medicines (Supports `search` & `low_stock` filters) | Yes |
| `POST` | `/api/medicines` | Create medicine with schedules | Yes (Patient) |
| `PUT` | `/api/medicines/:id` | Update medicine & time slots | Yes (Patient) |
| `DELETE` | `/api/medicines/:id` | Delete medicine | Yes (Patient) |
| `POST` | `/api/medicines/:id/refill` | Refill stock quantity (+30) | Yes (Patient) |
| `GET` | `/api/schedules/today` | Fetch today's generated dose schedule | Yes |
| `PATCH` | `/api/doses/:id/status` | Mark dose status (`taken`/`missed`/`pending`) | Yes |
| `POST` | `/api/caregivers/link` | Link caregiver to patient via invite code | Yes (Caregiver) |
| `GET` | `/api/caregivers/patients` | Fetch linked patients with stats | Yes (Caregiver) |
| `GET` | `/api/caregivers/alerts` | Fetch active missed-dose & low-stock alerts | Yes (Caregiver) |
| `GET` | `/api/appointments` | Fetch appointments for patient | Yes |
| `POST` | `/api/appointments` | Schedule new doctor appointment | Yes (Patient) |
| `PUT` | `/api/appointments/:id` | Update doctor appointment or consultation notes | Yes (Patient) |
| `DELETE` | `/api/appointments/:id` | Delete doctor appointment | Yes (Patient) |
| `GET` | `/api/reports/adherence` | Generate weekly & monthly adherence report | Yes |

---

## 🎨 UI/UX & Design Highlights

- **Healthcare Color Palette**: Calming soft teal (`#0d9488`), sky blue (`#0284c7`), and mint tones combined with a warm coral/rose accent (`#f43f5e`) for urgent alerts.
- **Accessibility & Senior Usability**: Large touch targets, high text contrast, clean typographic hierarchy, generous whitespace, clear status badges.
- **Distinct Visual Identities**: Custom hero themes for Patient Portal vs. Caregiver Monitoring Station while sharing a unified design language.
- **Zero Heavy UI Kits**: Built 100% with utility-first Tailwind CSS and Lucide React icons.
