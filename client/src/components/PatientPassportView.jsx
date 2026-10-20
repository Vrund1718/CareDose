import React, { useState, useEffect } from 'react';
import { ShieldCheck, Heart, Pill, Calendar, AlertTriangle, Phone, Mail, Printer, CheckCircle2, Clock, User, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { formatIndianDateTime, formatTimeSlot } from '../utils/dateUtils';

export default function PatientPassportView({ passportCode, onBackToApp }) {
  const [passportData, setPassportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPassport();
  }, [passportCode]);

  const loadPassport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.passport.get(passportCode);
      if (res.passport) {
        setPassportData(res.passport);
      } else {
        setError('Passport record not found.');
      }
    } catch (err) {
      console.error('Failed to load public passport:', err);
      setError(err.message || 'Unable to load patient passport.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-4 border border-slate-700 shadow-2xl">
          <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>
            <h3 className="text-white font-bold text-lg">Scanning Medical Passport...</h3>
            <p className="text-xs text-slate-400">Verifying CareDose encrypted health credentials</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !passportData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full text-center space-y-4 border border-rose-500/30 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Emergency Passport Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || 'No active medical profile is associated with this QR code or passport token.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => { window.location.href = '/'; }}
              className="py-2.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition"
            >
              Go to CareDose Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { patient, primary_caregiver, medicines, appointments, verified_at } = passportData;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-10 flex flex-col items-center">
      
      {/* Top Navbar */}
      <div className="w-full max-w-3xl flex items-center justify-between pb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-sky-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-base text-white tracking-tight">CareDose</span>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block -mt-1">Emergency Health Passport</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center space-x-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Card</span>
          </button>

          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="py-2 px-3 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 font-bold text-xs flex items-center space-x-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Passport Card */}
      <div className="w-full max-w-3xl bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-teal-500/30 shadow-2xl shadow-teal-950/40 overflow-hidden">
        
        {/* Passport Header Banner */}
        <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-sky-800 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider border border-white/20">
                  OFFICIAL EMERGENCY PASSPORT
                </span>
                <span className="inline-flex items-center space-x-1 text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>VERIFIED</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{patient.name}</h1>
              <p className="text-teal-100 text-xs mt-1">
                CareDose Patient Code: <strong className="font-mono text-white tracking-wider">{patient.invite_code}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200">Blood Group</span>
              <div className="text-xl sm:text-2xl font-black text-white">{patient.blood_group || 'O+ Positive'}</div>
              <div className="text-[11px] text-teal-100 font-medium">Status: {patient.emergency_status}</div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">

          {/* Emergency Contact & Caregiver Information */}
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
                <User className="w-4 h-4" />
                <span>Primary Emergency Contact (Caregiver)</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                Active Monitor
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <h3 className="text-lg font-black text-white">{primary_caregiver.name}</h3>
                <p className="text-xs text-slate-400">Designated Caregiver & Healthcare Advocate</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`mailto:${primary_caregiver.email}`}
                  className="py-2 px-3.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center space-x-1.5 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-teal-400" />
                  <span>{primary_caregiver.email}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Known Allergies & Clinical Directives */}
          <div className="bg-amber-950/30 rounded-2xl p-5 border border-amber-500/30 text-amber-200 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Critical Health Notes & Directives</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="font-bold text-white block">Medical Conditions:</span>
                <span className="text-slate-300">{(patient.conditions || []).join(' • ')}</span>
              </div>
              <div>
                <span className="font-bold text-white block">Known Allergies:</span>
                <span className="text-rose-300 font-semibold">{(patient.allergies || []).join(' • ')}</span>
              </div>
            </div>
            <p className="text-[11px] text-amber-200/90 pt-1 leading-relaxed border-t border-amber-500/20">
              {patient.emergency_notes}
            </p>
          </div>

          {/* Current Active Prescriptions Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
                <Pill className="w-4 h-4" />
                <span>Active Prescriptions ({medicines.length})</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Daily Schedule</span>
            </div>

            <div className="space-y-2.5">
              {medicines.map((m) => (
                <div key={m.id} className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-base">{m.name}</span>
                      <span className="px-2 py-0.5 rounded-md bg-teal-900/60 text-teal-300 font-mono text-xs border border-teal-700/50">
                        {m.dosage}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{m.frequency}</div>
                  </div>

                  {m.time_slots && m.time_slots.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {m.time_slots.map((slot, idx) => (
                        <span key={idx} className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-teal-300 font-mono text-xs font-bold">
                          <Clock className="w-3 h-3 text-teal-400" />
                          <span>{formatTimeSlot(slot)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Doctor Consultations */}
          {appointments && appointments.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>Attending Physicians & Upcoming Appointments</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {appointments.map((appt, idx) => (
                  <div key={idx} className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 space-y-1">
                    <div className="font-bold text-white text-sm">{appt.doctor_name}</div>
                    <div className="text-xs text-teal-300 font-mono font-semibold">
                      {formatIndianDateTime(appt.date_time)}
                    </div>
                    {appt.notes && <div className="text-[11px] text-slate-400 italic">{appt.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification Timestamp Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
            <div>
              Digital Verification Timestamp:{' '}
              <span className="text-slate-300 font-mono">{formatIndianDateTime(verified_at || new Date())} (IST)</span>
            </div>
            <div>
              Powered by <strong className="text-teal-400">CareDose Health Protection</strong>
            </div>
          </div>

        </div>

      </div>

      <div className="mt-8 text-center text-xs text-slate-500">
        CareDose Digital Health Passport • Scanned via Secure Emergency QR Gateway
      </div>
    </div>
  );
}
