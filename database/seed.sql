-- Seed Data for CareDose

USE caredose_db;

-- Demo Patient: Eleanor Vance (password: Password123!)
-- Demo Caregiver: Dr. Marcus Vance (password: Password123!)
INSERT INTO users (id, name, email, password_hash, role, invite_code) VALUES
(1, 'Eleanor Vance', 'patient@caredose.com', '$2a$10$wE0vVd4Z.3h3fQvL/BqR3e5P6m5n5k5j5h5g5f5e5d5c5b5a5', 'patient', 'PAT-8842-CD'),
(2, 'Dr. Marcus Vance', 'caregiver@caredose.com', '$2a$10$wE0vVd4Z.3h3fQvL/BqR3e5P6m5n5k5j5h5g5f5e5d5c5b5a5', 'caregiver', NULL)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Link Caregiver and Patient
INSERT INTO caregiver_links (id, patient_id, caregiver_id, status) VALUES
(1, 1, 2, 'active')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Sample Medicines for Eleanor
INSERT INTO medicines (id, patient_id, name, dosage, frequency, stock_qty, refill_threshold) VALUES
(1, 1, 'Lisinopril', '10 mg', 'Twice daily', 14, 10),
(2, 1, 'Metformin', '500 mg', 'Once daily', 3, 5),
(3, 1, 'Atorvastatin', '20 mg', 'Once daily (Night)', 28, 7),
(4, 1, 'Vitamin D3', '1000 IU', 'Once daily (Morning)', 45, 10)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Time slots for Lisinopril (08:00 AM, 08:00 PM), Metformin (09:00 AM), Atorvastatin (09:00 PM), Vitamin D3 (08:30 AM)
INSERT INTO schedules (id, medicine_id, time_slot) VALUES
(1, 1, '08:00'),
(2, 1, '20:00'),
(3, 2, '09:00'),
(4, 3, '21:00'),
(5, 4, '08:30')
ON DUPLICATE KEY UPDATE time_slot=VALUES(time_slot);

-- Appointments for Eleanor
INSERT INTO appointments (id, patient_id, doctor_name, date_time, notes) VALUES
(1, 1, 'Dr. Sarah Jenkins (Cardiologist)', '2026-10-22 10:30:00', 'Routine BP checkup & prescription renewal'),
(2, 1, 'Dr. Robert Chen (Endocrinologist)', '2026-10-28 14:00:00', 'Quarterly HbA1c screening consultation'),
(3, 1, 'Dr. Emily Watson (Optometrist)', '2026-11-05 11:15:00', 'Annual diabetic retinal examination')
ON DUPLICATE KEY UPDATE doctor_name=VALUES(doctor_name);

-- Historical Multi-day Dose Logs for Analytics
INSERT INTO dose_logs (schedule_id, date, status, logged_at) VALUES
(1, '2026-10-14', 'taken', '2026-10-14 08:05:00'),
(2, '2026-10-14', 'taken', '2026-10-14 20:10:00'),
(3, '2026-10-14', 'taken', '2026-10-14 09:12:00'),
(4, '2026-10-14', 'taken', '2026-10-14 21:05:00'),
(1, '2026-10-15', 'taken', '2026-10-15 08:15:00'),
(2, '2026-10-15', 'missed', NULL),
(3, '2026-10-15', 'taken', '2026-10-15 09:04:00'),
(4, '2026-10-15', 'taken', '2026-10-15 21:18:00'),
(1, '2026-10-16', 'taken', '2026-10-16 08:00:00'),
(2, '2026-10-16', 'taken', '2026-10-16 20:01:00'),
(3, '2026-10-16', 'taken', '2026-10-16 09:20:00'),
(4, '2026-10-16', 'taken', '2026-10-16 21:00:00'),
(1, '2026-10-17', 'taken', '2026-10-17 08:22:00'),
(2, '2026-10-17', 'taken', '2026-10-17 20:15:00'),
(3, '2026-10-17', 'missed', NULL),
(4, '2026-10-17', 'taken', '2026-10-17 21:30:00'),
(1, '2026-10-18', 'taken', '2026-10-18 08:05:00'),
(2, '2026-10-18', 'taken', '2026-10-18 20:08:00'),
(3, '2026-10-18', 'taken', '2026-10-18 09:11:00'),
(4, '2026-10-18', 'taken', '2026-10-18 21:02:00'),
(1, '2026-10-19', 'taken', '2026-10-19 08:10:00'),
(2, '2026-10-19', 'taken', '2026-10-19 20:00:00'),
(3, '2026-10-19', 'taken', '2026-10-19 09:05:00'),
(4, '2026-10-19', 'taken', '2026-10-19 21:10:00')
ON DUPLICATE KEY UPDATE status=VALUES(status);
