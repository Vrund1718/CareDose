import React, { useState, useEffect } from 'react';
import { Stethoscope, UserPlus, AlertCircle, AlertTriangle, CheckCircle2, Clock, Pill, Calendar, Activity, ChevronRight, ArrowLeft, Search, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import DoseCard from './DoseCard';
import AdherenceReport from './AdherenceReport';

export default function CaregiverDashboard({ user }) {
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  
  // Selected Patient Details
  const [patientDetail, setPatientDetail] = useState(null);
  const [patientDoses, setPatientDoses] = useState([]);
  const [patientMeds, setPatientMeds] = useState([]);
  const [patientAppts, setPatientAppts] = useState([]);
  const [patientReport, setPatientReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');

  useEffect(() => {
    loadCaregiverData();
  }, []);

  const loadCaregiverData = async () => {
    setLoading(true);
    try {
      const [patientsRes, alertsRes] = await Promise.all([
        api.caregivers.getPatients(),
        api.caregivers.getAlerts()
      ]);
      setPatients(patientsRes.patients || []);
      setAlerts(alertsRes.alerts || []);
    } catch (err) {
      console.error('Error loading caregiver data:', err);
    } finally {
      setLoading(false);
    }
  };

  const inspectPatient = async (patientId) => {
    setSelectedPatientId(patientId);
    setInspectLoading(true);
    try {
      const [todayRes, medsRes, apptsRes, reportRes] = await Promise.all([
        api.schedules.getToday(patientId),
        api.medicines.getAll(patientId),
        api.appointments.getAll(patientId),
        api.reports.getAdherence(patientId)
      ]);

      const foundPatient = patients.find(p => p.id === patientId);
      setPatientDetail(foundPatient);
      setPatientDoses(todayRes.doses || []);
      setPatientMeds(medsRes.medicines || []);
      setPatientAppts(apptsRes.appointments || []);
      setPatientReport(reportRes || null);
    } catch (err) {
      console.error('Failed to inspect patient details:', err);
    } finally {
      setInspectLoading(false);
    }
  };

  const handleLinkPatient = async (e) => {
    e.preventDefault();
    if (!inviteInput.trim()) return setLinkError('Please enter Invite Code or Patient Email.');

    setLinkError('');
    setLinkSuccess('');
    try {
      const isEmail = inviteInput.includes('@');
      const payload = isEmail ? { patient_email: inviteInput } : { invite_code: inviteInput };

      const res = await api.caregivers.linkPatient(payload);
      setLinkSuccess(res.message);
      setInviteInput('');
      setTimeout(() => setIsLinkModalOpen(false), 2000);
      loadCaregiverData();
    } catch (err) {
      setLinkError(err.message || 'Failed to link with patient.');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Caregiver Hero Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-sky-950/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold tracking-wider uppercase text-sky-200 border border-white/20">
              Caregiver Monitoring Station
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">Welcome, {user.name}</h1>
            <p className="text-sky-100 text-sm max-w-xl">
              You are currently monitoring <strong className="text-white">{patients.length}</strong> linked patient(s). Real-time missed dose alerts are highlighted below.
            </p>
          </div>

          <button
            onClick={() => { setLinkError(''); setLinkSuccess(''); setIsLinkModalOpen(true); }}
            className="py-3 px-5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center space-x-2 transition shadow-lg active:scale-95 shrink-0 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Link New Patient</span>
          </button>
        </div>
      </div>

      {/* Prominent Missed-Dose & Low Stock Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>Attention Required ({alerts.length} Active Alerts)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex items-start space-x-3.5 ${
                  alert.type === 'missed_dose'
                    ? 'bg-rose-50/90 border-rose-200/90 text-rose-900'
                    : 'bg-amber-50/90 border-amber-200/90 text-amber-900'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  alert.type === 'missed_dose' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {alert.type === 'missed_dose' ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">{alert.title}</h4>
                    <button
                      onClick={() => inspectPatient(alert.patient_id)}
                      className="text-xs font-bold underline hover:opacity-80"
                    >
                      View Schedule
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Switcher: Patient Overview List vs Single Patient Inspection */}
      {!selectedPatientId ? (
        
        /* Linked Patients Grid */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">Linked Patients Overview</h2>
            <button
              onClick={loadCaregiverData}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition text-xs font-bold flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {patients.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4">
              <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-700">No linked patients yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Ask your patient for their unique Patient Invite Code (found on their dashboard), then click "Link New Patient".
              </p>
              <button
                onClick={() => setIsLinkModalOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-sky-600 text-white font-bold text-xs"
              >
                Link Patient Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patients.map((p) => (
                <div
                  key={p.id}
                  onClick={() => inspectPatient(p.id)}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-sky-300 transition cursor-pointer flex flex-col justify-between space-y-5 group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition">{p.name}</h3>
                      <div className="text-xs text-slate-500 font-medium">{p.email}</div>
                    </div>

                    {/* Adherence Score Badge */}
                    <div className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${
                      p.adherence_rate >= 80 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {p.adherence_rate}% Adherence
                    </div>
                  </div>

                  {/* Summary Indicators */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-slate-400 font-semibold text-[10px] uppercase">Medicines</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">{p.medicines_count} Active</div>
                    </div>

                    <div className={`p-2.5 rounded-xl border ${p.today_missed_count > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="text-slate-400 font-semibold text-[10px] uppercase">Missed Today</div>
                      <div className="font-bold text-sm mt-0.5">{p.today_missed_count} Doses</div>
                    </div>
                  </div>

                  {/* Footer link trigger */}
                  <div className="flex items-center justify-between text-xs font-bold text-sky-600 pt-2 border-t border-slate-100">
                    <span>Inspect Patient Records</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      ) : (

        /* Detailed Patient Inspection View (Read-Only) */
        <div className="space-y-6">
          <button
            onClick={() => setSelectedPatientId(null)}
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Patients</span>
          </button>

          {inspectLoading ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-500 font-bold">
              Loading patient data...
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Inspection Patient Header */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-sky-600">Patient Inspection File</div>
                  <h2 className="text-2xl font-black text-slate-900">{patientDetail?.name}</h2>
                  <p className="text-xs text-slate-500">{patientDetail?.email} • Invite Code: {patientDetail?.invite_code}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-semibold">30-Day Compliance</div>
                    <div className="text-2xl font-black text-emerald-600">{patientDetail?.adherence_rate}%</div>
                  </div>
                </div>
              </div>

              {/* Patient's Today Schedule */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-sky-600" />
                  <span>Today's Schedule ({patientDetail?.name})</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patientDoses.map((dose) => (
                    <DoseCard
                      key={dose.dose_id}
                      dose={dose}
                      isCaregiver={true}
                    />
                  ))}
                </div>
              </div>

              {/* Patient Adherence Report */}
              <AdherenceReport reportData={patientReport} loading={false} />

            </div>
          )}
        </div>

      )}

      {/* Link Patient Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900">Link Patient</h3>
            <p className="text-xs text-slate-500 mt-1">Enter the Patient Invite Code (e.g. PAT-8842-CD) or Patient Email address.</p>

            {linkError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {linkError}
              </div>
            )}
            {linkSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                {linkSuccess}
              </div>
            )}

            <form onSubmit={handleLinkPatient} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Invite Code / Patient Email</label>
                <input
                  type="text"
                  placeholder="e.g. PAT-8842-CD or patient@caredose.com"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs"
                >
                  Connect Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
