-- Seed Data for CareDose

USE caredose_db;

-- Demo Patient: Eleanor Vance (password: Password123!)
-- Demo Caregiver: Dr. Marcus Vance (password: Password123!)
INSERT INTO users (id, name, email, password_hash, role, invite_code) VALUES
(1, 'Eleanor Vance', 'eleanor@caredose.com', '$2a$10$wE0vVd4Z.3h3fQvL/BqR3e5P6m5n5k5j5h5g5f5e5d5c5b5a5', 'patient', 'PAT-8842-CD'),
(2, 'Dr. Marcus Vance', 'marcus@caredose.com', '$2a$10$wE0vVd4Z.3h3fQvL/BqR3e5P6m5n5k5j5h5g5f5e5d5c5b5a5', 'caregiver', NULL)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Link Caregiver and Patient
INSERT INTO caregiver_links (id, patient_id, caregiver_id, status) VALUES
(1, 1, 2, 'active')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Sample Medicines for Eleanor
INSERT INTO medicines (id, patient_id, name, dosage, frequency, stock_qty, refill_threshold) VALUES
(1, 1, 'Lisinopril', '10 mg', 'Twice daily', 14, 10),
(2, 1, 'Metformin', '500 mg', 'Once daily', 3, 5),
(3, 1, 'Atorvastatin', '20 mg', 'Once daily (Night)', 28, 7)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Time slots for Lisinopril (08:00 AM, 08:00 PM), Metformin (09:00 AM), Atorvastatin (09:00 PM)
INSERT INTO schedules (id, medicine_id, time_slot) VALUES
(1, 1, '08:00'),
(2, 1, '20:00'),
(3, 2, '09:00'),
(4, 3, '21:00')
ON DUPLICATE KEY UPDATE time_slot=VALUES(time_slot);

-- Appointments for Eleanor
INSERT INTO appointments (id, patient_id, doctor_name, date_time, notes) VALUES
(1, 1, 'Dr. Sarah Jenkins (Cardiologist)', '2026-10-02 10:30:00', 'Routine BP checkup & prescription renewal'),
(2, 1, 'Dr. Robert Chen (Endocrinologist)', '2026-10-15 14:00:00', 'HbA1c blood test review')
ON DUPLICATE KEY UPDATE doctor_name=VALUES(doctor_name);
