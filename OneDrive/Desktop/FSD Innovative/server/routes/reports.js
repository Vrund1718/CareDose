const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

async function canAccessPatientData(userId, userRole, patientId) {
  if (userRole === 'patient') {
    return userId === Number(patientId);
  }
  if (userRole === 'caregiver') {
    const links = await db.query(
      'SELECT id FROM caregiver_links WHERE caregiver_id = ? AND patient_id = ? AND status = "active"',
      [userId, patientId]
    );
    return links && links.length > 0;
  }
  return false;
}

// GET /api/reports/adherence - Adherence report (Weekly & Monthly stats)
router.get('/adherence', verifyToken, async (req, res) => {
  try {
    let targetPatientId = req.user.id;

    if (req.query.patient_id) {
      targetPatientId = Number(req.query.patient_id);
      const allowed = await canAccessPatientData(req.user.id, req.user.role, targetPatientId);
      if (!allowed) {
        return res.status(403).json({ error: 'Unauthorized to view reports.' });
      }
    } else if (req.user.role === 'caregiver') {
      return res.status(400).json({ error: 'Caregivers must specify patient_id query parameter.' });
    }

    // 1. Calculate 7-day stats
    const d7 = new Date();
    d7.setDate(d7.getDate() - 6);
    const date7Str = d7.toISOString().substring(0, 10);

    const logs7 = await db.query(
      `SELECT dl.status, dl.date, m.name as medicine_name
       FROM dose_logs dl
       JOIN schedules s ON dl.schedule_id = s.id
       JOIN medicines m ON s.medicine_id = m.id
       WHERE m.patient_id = ? AND dl.date >= ?`,
      [targetPatientId, date7Str]
    );

    const weeklyTaken = logs7.filter(l => l.status === 'taken').length;
    const weeklyMissed = logs7.filter(l => l.status === 'missed').length;
    const weeklyPending = logs7.filter(l => l.status === 'pending').length;
    const weeklyTotal = logs7.length;
    const weeklyAdherence = weeklyTotal > 0 ? Math.round((weeklyTaken / weeklyTotal) * 100) : 100;

    // 2. Calculate 30-day stats
    const d30 = new Date();
    d30.setDate(d30.getDate() - 29);
    const date30Str = d30.toISOString().substring(0, 10);

    const logs30 = await db.query(
      `SELECT dl.status, dl.date, m.name as medicine_name
       FROM dose_logs dl
       JOIN schedules s ON dl.schedule_id = s.id
       JOIN medicines m ON s.medicine_id = m.id
       WHERE m.patient_id = ? AND dl.date >= ?`,
      [targetPatientId, date30Str]
    );

    const monthlyTaken = logs30.filter(l => l.status === 'taken').length;
    const monthlyMissed = logs30.filter(l => l.status === 'missed').length;
    const monthlyTotal = logs30.length;
    const monthlyAdherence = monthlyTotal > 0 ? Math.round((monthlyTaken / monthlyTotal) * 100) : 100;

    // 3. Breakdown by Medicine
    const medBreakdown = {};
    for (let l of logs30) {
      if (!medBreakdown[l.medicine_name]) {
        medBreakdown[l.medicine_name] = { taken: 0, missed: 0, total: 0 };
      }
      medBreakdown[l.medicine_name].total += 1;
      if (l.status === 'taken') medBreakdown[l.medicine_name].taken += 1;
      if (l.status === 'missed') medBreakdown[l.medicine_name].missed += 1;
    }

    const medicineStats = Object.keys(medBreakdown).map(name => {
      const item = medBreakdown[name];
      return {
        medicine_name: name,
        taken: item.taken,
        missed: item.missed,
        total: item.total,
        adherence_rate: item.total > 0 ? Math.round((item.taken / item.total) * 100) : 100
      };
    });

    // 4. Daily history breakdown for last 7 days (for chart/bar rendering)
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const dayStr = day.toISOString().substring(0, 10);
      const dayLogs = logs7.filter(l => l.date === dayStr);
      
      const taken = dayLogs.filter(l => l.status === 'taken').length;
      const missed = dayLogs.filter(l => l.status === 'missed').length;
      const total = dayLogs.length;

      dailyTrend.push({
        date: dayStr,
        day_name: day.toLocaleDateString('en-US', { weekday: 'short' }),
        taken,
        missed,
        total,
        rate: total > 0 ? Math.round((taken / total) * 100) : 100
      });
    }

    res.json({
      summary: {
        weekly: {
          taken: weeklyTaken,
          missed: weeklyMissed,
          pending: weeklyPending,
          total: weeklyTotal,
          adherence_rate: weeklyAdherence
        },
        monthly: {
          taken: monthlyTaken,
          missed: monthlyMissed,
          total: monthlyTotal,
          adherence_rate: monthlyAdherence
        }
      },
      medicine_stats: medicineStats,
      daily_trend: dailyTrend
    });
  } catch (err) {
    console.error('Fetch adherence report error:', err);
    res.status(500).json({ error: 'Failed to generate adherence report.' });
  }
});

module.exports = router;
