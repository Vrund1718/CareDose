import React, { useState } from 'react';
import { Pill, Heart, Shield, Lock, Mail, User, AlertCircle, ArrowRight, Stethoscope } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await api.auth.login({ email, password });
      } else {
        data = await api.auth.register({ name, email, password, role });
      }

      if (data.token) {
        localStorage.setItem('caredose_token', data.token);
        onAuthSuccess(data.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoRole) => {
    setError('');
    setLoading(true);
    try {
      const data = await api.auth.login({
        email: demoEmail,
        password: 'Password123!'
      });
      if (data.token) {
        localStorage.setItem('caredose_token', data.token);
        onAuthSuccess(data.user);
      }
    } catch (err) {
      setError('Demo login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* App Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-teal-600 to-sky-500 text-white shadow-xl shadow-teal-500/20 mb-4 transform transition hover:scale-105">
            <Pill className="w-9 h-9 stroke-[2.2]" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Care<span className="text-teal-600">Dose</span></h2>
          <p className="mt-1 text-sm text-slate-500 font-medium">Medication Reminder & Remote Caregiver System</p>
        </div>

        {/* Auth Form Box */}
        <div className="bg-white rounded-3xl p-7 sm:p-8 shadow-xl border border-slate-200/80">
          
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
                isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
                !isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Eleanor Vance"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Account Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('patient')}
                      className={`p-3 rounded-xl border text-left flex items-center space-x-2 transition ${
                        role === 'patient' 
                          ? 'border-teal-500 bg-teal-50/60 text-teal-900 ring-2 ring-teal-500/20' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <User className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-bold">Patient</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('caregiver')}
                      className={`p-3 rounded-xl border text-left flex items-center space-x-2 transition ${
                        role === 'caregiver' 
                          ? 'border-sky-500 bg-sky-50/60 text-sky-900 ring-2 ring-sky-500/20' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Stethoscope className="w-4 h-4 text-sky-600" />
                      <span className="text-xs font-bold">Caregiver</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 text-sm font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition active:scale-95 flex items-center justify-center space-x-2 mt-2"
            >
              <span>{loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 text-center">Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('patient@caredose.com', 'patient')}
                className="py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold flex items-center justify-center space-x-1 transition active:scale-95"
              >
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>Demo Patient</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('caregiver@caredose.com', 'caregiver')}
                className="py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold flex items-center justify-center space-x-1 transition active:scale-95"
              >
                <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                <span>Demo Caregiver</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
