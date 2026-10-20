import React from 'react';
import { 
  Pill, Heart, Shield, Clock, Bell, Activity, Users, ArrowRight, 
  CheckCircle2, Sparkles, AlertTriangle, Calendar, ChevronRight, Stethoscope,
  BarChart3, RefreshCw, Zap, Lock
} from 'lucide-react';

export default function LandingPage({ onOpenAuth, onQuickDemo }) {
  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 text-center max-w-5xl mx-auto space-y-8">
        
        {/* Glow ambient background effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-400/20 blur-3xl -z-10 rounded-full pointer-events-none"></div>
        <div className="absolute top-32 right-10 w-72 h-72 bg-sky-400/20 blur-3xl -z-10 rounded-full pointer-events-none"></div>

        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
          <span>CareDose 3-Tier Healthcare Platform</span>
          <span className="bg-teal-200/70 text-teal-900 text-[10px] px-2 py-0.5 rounded-full font-black">2026</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Never miss a dose. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-sky-600 bg-clip-text text-transparent">
              Empower your caregivers.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            The modern medication management ecosystem designed for patients to stay strictly on schedule, while granting trusted family and doctors real-time adherence visibility.
          </p>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onOpenAuth('register')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-teal-600/25 transition transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>Get Started for Free</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            onClick={() => onOpenAuth('login')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-extrabold text-sm sm:text-base shadow-sm transition transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>Sign In to Account</span>
          </button>
        </div>

        {/* 1-Click Instant Demo Pills */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Instant 1-Click Demos:</span>
          <button
            onClick={() => onQuickDemo('patient@caredose.com', 'patient')}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold transition shadow-xs hover:scale-105"
          >
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <span>Vrund Sutariya (Patient)</span>
          </button>
          <button
            onClick={() => onQuickDemo('caregiver@caredose.com', 'caregiver')}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold transition shadow-xs hover:scale-105"
          >
            <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
            <span>Vishesh Shah (Caregiver)</span>
          </button>
        </div>

        {/* Live Interactive Dashboard Preview Card */}
        <div className="pt-8">
          <div className="p-3 sm:p-5 rounded-3xl bg-slate-900/5 backdrop-blur-xl border border-slate-200 shadow-2xl max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm text-left grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Preview 1: Dose Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">8:00 AM • Taken</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Lisinopril</h4>
                  <p className="text-xs text-slate-500 font-medium">10 mg • Twice Daily</p>
                </div>
                <div className="text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100 flex justify-between">
                  <span>Stock remaining:</span>
                  <span className="font-bold text-slate-800">14 doses</span>
                </div>
              </div>

              {/* Preview 2: Adherence Ring */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/60 to-white border border-teal-200/80 shadow-xs space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">30-Day Adherence</span>
                  <Activity className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-slate-900">95.8%</span>
                  <span className="text-xs font-bold text-emerald-600">+4.2% this week</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: '95.8%' }}></div>
                </div>
              </div>

              {/* Preview 3: Caregiver Alert */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/60 to-white border border-amber-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">Caregiver Live Alert</span>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Low Stock Alert</h4>
                  <p className="text-xs text-slate-600 font-medium">Metformin (500mg) below threshold (3 remaining).</p>
                </div>
                <span className="inline-block text-[11px] font-bold text-teal-700">1-Click Refill Available →</span>
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-xs font-black uppercase tracking-widest text-teal-600">Built for Modern Healthcare</h2>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Everything required for compliance and safety</h3>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Seamlessly integrating daily alarms, inventory replenishment, and dual-role access control into a cohesive 3-tier architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold group-hover:scale-110 transition">
              <Clock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Automated Alarm Slots</h4>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Define multiple daily slots (e.g. 08:00 AM, 02:00 PM, 08:00 PM). Today's schedule automatically populates with relative time badges and prompt status tags.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold group-hover:scale-110 transition">
              <Stethoscope className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Caregiver Station</h4>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Caregivers connect using unique patient invite codes. They receive immediate red flag alerts for missed doses and inventory warnings across all linked family members.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-110 transition">
              <RefreshCw className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Stock Decrement & Refill</h4>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Marking a medication as taken automatically decreases remaining inventory in real-time. Configurable refill thresholds warn you before runs out.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-110 transition">
              <BarChart3 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Visual Compliance Analytics</h4>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Interactive 7-day and 30-day compliance tracking with per-medication adherence breakdowns and daily trend charts built with clean CSS and SVG.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:scale-110 transition">
              <Calendar className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Doctor Consultations</h4>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Schedule specialist appointments, keep preparation notes, and review consultation histories to ensure medical follow-ups never slip through the cracks.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold group-hover:scale-110 transition">
              <Lock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Role-Based JWT Security</h4>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Secure token authentication with bcrypt password hashing, input sanitization, and strict patient-caregiver link authorization on all endpoints.
            </p>
          </div>

        </div>
      </section>

      {/* How it works 3-Step Section */}
      <section id="how-it-works" className="max-w-6xl mx-auto p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-black tracking-widest uppercase text-teal-400">Simple 3-Step Workflow</span>
          <h3 className="text-3xl sm:text-4xl font-black">How CareDose Operates</h3>
          <p className="text-sm text-slate-400 font-medium">Intuitive for both seniors and healthcare supervisors</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center font-black text-lg">
              1
            </div>
            <h4 className="text-lg font-bold">Add Prescriptions</h4>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Enter your medication names, dosages, frequencies, and alarm slots. The system generates schedules automatically.
            </p>
          </div>

          <div className="space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-300 flex items-center justify-center font-black text-lg">
              2
            </div>
            <h4 className="text-lg font-bold">Log Daily Doses</h4>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Mark doses as "Taken" with a single click. Your medication stock immediately decreases, and time-stamped logs are stored.
            </p>
          </div>

          <div className="space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-black text-lg">
              3
            </div>
            <h4 className="text-lg font-bold">Caregivers Monitor Live</h4>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Family or doctors connect via your unique invite code. They see live compliance percentages and alerts if doses are missed.
            </p>
          </div>

        </div>

        <div className="pt-4 text-center">
          <button
            onClick={() => onOpenAuth('register')}
            className="px-8 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm transition transform hover:scale-105 active:scale-95 inline-flex items-center space-x-2"
          >
            <span>Create Your Free Account Now</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-12 border-t border-slate-200/80 text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
            <Pill className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-black text-slate-900 text-lg">Care<span className="text-teal-600">Dose</span></span>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          5th Semester Full Stack Development (FSD) Innovative Project • Designed for real-time medication safety.
        </p>
      </footer>

    </div>
  );
}
