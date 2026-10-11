import React, { useState } from 'react';
import { Pill, Heart, Shield, LogOut, Copy, Check, UserCheck, Stethoscope, User } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const [copied, setCopied] = useState(false);

  const handleCopyInvite = () => {
    if (user?.invite_code) {
      navigator.clipboard.writeText(user.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Platform Title */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-sky-500 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white transform transition hover:scale-105">
              <Pill className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">Care<span className="text-teal-600">Dose</span></span>
                <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">Medication & Caregiver Monitoring System</p>
            </div>
          </div>

          {/* User Status & Controls */}
          {user && (
            <div className="flex items-center space-x-3 sm:space-x-4">
              
              {/* Patient Invite Code Badge */}
              {user.role === 'patient' && user.invite_code && (
                <div 
                  onClick={handleCopyInvite}
                  title="Click to copy Invite Code for your Caregiver"
                  className="hidden md:flex items-center space-x-2 bg-slate-100 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-800 px-3 py-1.5 rounded-xl cursor-pointer transition text-xs font-semibold group"
                >
                  <span className="text-slate-500 group-hover:text-teal-600">Code:</span>
                  <code className="font-mono text-slate-900 group-hover:text-teal-900 font-bold">{user.invite_code}</code>
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
                  )}
                </div>
              )}

              {/* User Role Badge & Profile */}
              <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-2xl">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                  user.role === 'caregiver'
                    ? 'bg-sky-100 text-sky-700 border border-sky-200'
                    : 'bg-teal-100 text-teal-700 border border-teal-200'
                }`}>
                  {user.role === 'caregiver' ? <Stethoscope className="w-5 h-5 text-sky-600" /> : <User className="w-5 h-5 text-teal-600" />}
                </div>

                <div className="text-left hidden lg:block">
                  <div className="text-sm font-bold text-slate-900 leading-tight">{user.name}</div>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className={`inline-block w-2 h-2 rounded-full ${user.role === 'caregiver' ? 'bg-sky-500' : 'bg-teal-500'}`}></span>
                    <span className="text-xs font-semibold capitalize text-slate-600">{user.role}</span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-2 rounded-xl text-sm font-semibold transition active:scale-95 shadow-2xs"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
