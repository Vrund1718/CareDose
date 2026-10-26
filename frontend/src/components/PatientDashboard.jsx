import React, { useState, useEffect } from 'react';
import { Pill, Plus, Calendar, Clock, AlertTriangle, CheckCircle2, RefreshCw, Copy, Check, Users, Edit3, Trash2, HeartHandshake, Search } from 'lucide-react';
import { api } from '../services/api';
import DoseCard from './DoseCard';
import MedicineForm from './MedicineForm';
import AppointmentModal from './AppointmentModal';
import AdherenceReport from './AdherenceReport';
import { formatIndianDateTime } from '../utils/dateUtils';

export default function PatientDashboard({ user }) {
  const [doses, setDoses] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [myCaregivers, setMyCaregivers] = useState([]);
  const [reportData, setReportData] = useState(null);

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'taken', 'missed'
  const [medSearch, setMedSearch] = useState('');
  const [medFilter, setMedFilter] = useState('all'); // 'all', 'low-stock'
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  // Modals
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [todayRes, medsRes, apptsRes, reportRes, caregiversRes] = await Promise.all([
        api.schedules.getToday(),
        api.medicines.getAll(),
        api.appointments.getAll(),
        api.reports.getAdherence(),
        api.caregivers.getMyCaregivers().catch(() => ({ caregivers: [] }))
      ]);

      setDoses(todayRes.doses || []);
      setMedicines(medsRes.medicines || []);
      setAppointments(apptsRes.appointments || []);
      setReportData(reportRes || null);
      setMyCaregivers(caregiversRes.caregivers || []);
    } catch (err) {
      console.error('Error loading patient dashboard:', err);
      showNotification('Error refreshing dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg, type = 'success') => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Dose Status Update Handler
  const handleDoseStatusChange = async (doseId, newStatus) => {
    try {
      const res = await api.schedules.updateStatus(doseId, newStatus);
      showNotification(`Dose marked as ${newStatus.toUpperCase()}!`);
      // Re-fetch today schedule and medicines stock
      loadDashboardData();
    } catch (err) {
      showNotification(err.message || 'Failed to update dose status', 'error');
    }
  };

  // Log Extra / 2nd Dose on Demand
  const handleLogAdhocDose = async (medicineId) => {
    try {
      await api.schedules.logAdhoc(medicineId);
      showNotification('Additional dose logged as TAKEN!');
      loadDashboardData();
    } catch (err) {
      showNotification(err.message || 'Failed to log dose', 'error');
    }
  };

  // Quick Refill Stock Handler
  const handleRefillStock = async (medicineId) => {
    try {
      await api.medicines.refill(medicineId, 30);
      showNotification('Refilled +30 doses to stock!');
      loadDashboardData();
    } catch (err) {
      showNotification(err.message || 'Failed to refill stock', 'error');
    }
  };

  // Medicine Save Handler
  const handleSaveMedicine = async (medData) => {
    if (medData.id) {
      await api.medicines.update(medData.id, medData);
      showNotification('Medication updated successfully!');
    } else {
      await api.medicines.create(medData);
      showNotification('New medication added to your schedule!');
    }
    loadDashboardData();
  };

  // Medicine Delete Handler
  const handleDeleteMedicine = async (medId) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        await api.medicines.delete(medId);
        showNotification('Medication removed.');
        loadDashboardData();
      } catch (err) {
        showNotification(err.message || 'Failed to delete medication', 'error');
      }
    }
  };

  // Appointment Save Handler
  const handleSaveAppointment = async (apptData) => {
    await api.appointments.create(apptData);
    showNotification('Doctor appointment scheduled!');
    loadDashboardData();
  };

  // Appointment Delete Handler
  const handleDeleteAppointment = async (apptId) => {
    if (window.confirm('Cancel this appointment?')) {
      try {
        await api.appointments.delete(apptId);
        showNotification('Appointment cancelled.');
        loadDashboardData();
      } catch (err) {
        showNotification(err.message || 'Failed to delete appointment', 'error');
      }
    }
  };

  const copyInviteCode = () => {
    if (user?.invite_code) {
      navigator.clipboard.writeText(user.invite_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  // Low stock medicines
  const lowStockMeds = medicines.filter(m => m.stock_qty <= m.refill_threshold);

  // Filter doses by tab
  const filteredDoses = doses.filter(d => {
    if (activeTab === 'pending') return d.status === 'pending';
    if (activeTab === 'taken') return d.status === 'taken';
    if (activeTab === 'missed') return d.status === 'missed';
    return true;
  });

  // Filter medicines by search query and stock filter
  const filteredMedicines = medicines.filter(m => {
    if (medFilter === 'low-stock' && m.stock_qty > m.refill_threshold) return false;
    if (medSearch.trim()) {
      const q = medSearch.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.dosage.toLowerCase().includes(q) || m.frequency.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-sm font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-teal-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-900/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold tracking-wider uppercase text-teal-100 border border-white/20">
              Patient Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">Good day, {user.name}!</h1>
            <p className="text-teal-100 text-sm max-w-xl">
              You have <strong className="text-white">{doses.filter(d => d.status === 'pending').length}</strong> upcoming dose(s) scheduled for today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => { setEditingMed(null); setIsMedModalOpen(true); }}
              className="py-3 px-5 rounded-2xl bg-white hover:bg-teal-50 text-teal-900 font-bold text-xs sm:text-sm flex items-center space-x-2 transition shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4 text-teal-700 stroke-[3]" />
              <span>Add Medication</span>
            </button>

            <button
              onClick={() => setIsApptModalOpen(true)}
              className="py-3 px-5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 transition active:scale-95"
            >
              <Calendar className="w-4 h-4 text-sky-200" />
              <span>New Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockMeds.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-rose-500 rounded-3xl p-5 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-extrabold text-base">Low Stock Alert ({lowStockMeds.length} items)</h4>
              <p className="text-xs text-amber-100">
                {lowStockMeds.map(m => `${m.name} (${m.stock_qty} left)`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleRefillStock(lowStockMeds[0].id)}
            className="py-2.5 px-4 rounded-xl bg-white text-slate-900 hover:bg-amber-50 font-bold text-xs shrink-0 transition flex items-center justify-center space-x-1.5 shadow-md active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            <span>Refill Stock (+30)</span>
          </button>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Today's Schedule & Medications */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Today's Schedule Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <span>Today's Dose Schedule</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">Log doses taken or missed throughout the day</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                {['all', 'pending', 'taken', 'missed'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`capitalize px-3 py-1.5 rounded-xl transition ${
                      activeTab === tab
                        ? 'bg-white text-slate-900 shadow-xs font-black'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Doses Grid */}
            {filteredDoses.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                <Pill className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-600">No scheduled doses found for this filter.</p>
                <p className="text-xs text-slate-400">Add a medication to automatically generate daily alarm slots.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDoses.map((dose) => (
                  <DoseCard
                    key={dose.dose_id}
                    dose={dose}
                    onStatusChange={handleDoseStatusChange}
                    onRefillClick={handleRefillStock}
                    onLogAdhoc={handleLogAdhocDose}
                  />
                ))}
              </div>
            )}
          </div>

          {/* All Medications Cabinet */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <Pill className="w-5 h-5 text-teal-600" />
                  <span>My Medication Cabinet ({filteredMedicines.length})</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Manage prescription details, frequencies, and stock thresholds</p>
              </div>

              <button
                onClick={() => { setEditingMed(null); setIsMedModalOpen(true); }}
                className="py-2 px-3.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center space-x-1.5 transition self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-teal-700" />
                <span>Add Medicine</span>
              </button>
            </div>

            {/* Quick Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search medications by name or dosage..."
                  value={medSearch}
                  onChange={(e) => setMedSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-teal-500 transition"
                />
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
                <button
                  onClick={() => setMedFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    medFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  All ({medicines.length})
                </button>
                <button
                  onClick={() => setMedFilter('low-stock')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    medFilter === 'low-stock' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Low Stock ({lowStockMeds.length})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMedicines.map((med) => (
                <div key={med.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{med.name}</h4>
                      <div className="text-xs font-medium text-slate-500">{med.dosage} • {med.frequency}</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => { setEditingMed(med); setIsMedModalOpen(true); }}
                        className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMedicine(med.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 font-medium">
                    <span className="text-slate-600">Stock: <strong className="text-slate-900">{med.stock_qty}</strong> doses</span>
                    <div className="flex items-center space-x-2.5">
                      <button
                        onClick={() => handleLogAdhocDose(med.id)}
                        className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
                        title="Log a dose taken now"
                      >
                        + Take Dose
                      </button>
                      <button
                        onClick={() => handleRefillStock(med.id)}
                        className="text-teal-700 hover:text-teal-900 font-bold underline"
                      >
                        Refill +30
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Column: Caregiver Invite, Appointments & Adherence Stats */}
        <div className="space-y-8">
          
          {/* Caregiver Share Code Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-base">Caregiver Connect</h4>
                <p className="text-xs text-slate-400">Share your invite code with your caregiver</p>
              </div>
            </div>

            <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Invite Code</div>
                <div className="text-lg font-mono font-black text-teal-400 tracking-wider">{user.invite_code}</div>
              </div>
              <button
                onClick={copyInviteCode}
                className="py-2 px-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition active:scale-95"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {myCaregivers.length > 0 ? (
              <div className="text-xs text-slate-300 pt-2 border-t border-slate-700">
                <span className="font-semibold text-teal-300">Linked Caregiver:</span>{' '}
                {myCaregivers.map(c => c.name).join(', ')}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No caregiver connected yet. Give them your code so they can monitor your adherence remotely.</p>
            )}
          </div>

          {/* Doctor Appointments Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  <span>Appointments</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Upcoming doctor consultations</p>
              </div>
              <button
                onClick={() => setIsApptModalOpen(true)}
                className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 transition"
                title="Add Appointment"
              >
                <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500 font-medium">
                No upcoming appointments scheduled.
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appt) => (
                  <div key={appt.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 text-sm">{appt.doctor_name}</div>
                      <div className="text-xs text-sky-700 font-semibold font-mono">
                        {formatIndianDateTime(appt.date_time)}
                      </div>
                      {appt.notes && <div className="text-xs text-slate-500 italic">{appt.notes}</div>}
                    </div>
                    <button
                      onClick={() => handleDeleteAppointment(appt.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visual Adherence Summary Widget */}
          <AdherenceReport reportData={reportData} loading={loading} />

        </div>

      </div>

      {/* Modals */}
      <MedicineForm
        isOpen={isMedModalOpen}
        onClose={() => setIsMedModalOpen(false)}
        onSave={handleSaveMedicine}
        initialData={editingMed}
      />

      <AppointmentModal
        isOpen={isApptModalOpen}
        onClose={() => setIsApptModalOpen(false)}
        onSave={handleSaveAppointment}
      />

    </div>
  );
}
