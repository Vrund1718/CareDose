import React from 'react';
import { CheckCircle2, XCircle, Clock, Pill, AlertTriangle, RefreshCw, RotateCcw, PlusCircle } from 'lucide-react';
import { formatIndianTime, formatTimeSlot } from '../utils/dateUtils';

export default function DoseCard({ dose, onStatusChange, isCaregiver = false, onRefillClick, onLogAdhoc }) {
  const { dose_id, medicine_id, medicine_name, dosage, frequency, time_slot, status, logged_at, stock_qty, refill_threshold } = dose;

  const isLowStock = stock_qty <= refill_threshold;

  // Determine if slot is past, due now, or upcoming for pending doses
  const getSlotTiming = () => {
    if (status !== 'pending' || !time_slot) return null;
    try {
      const now = new Date();
      // Calculate current IST hours and minutes
      const istTimeStr = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
      const [nowH, nowM] = istTimeStr.split(':').map(Number);
      const [sh, sm] = time_slot.split(':').map(Number);

      const nowTotalMins = nowH * 60 + nowM;
      const slotTotalMins = sh * 60 + sm;
      const diffMins = slotTotalMins - nowTotalMins;

      if (diffMins < -30) return { label: 'Past Due', className: 'bg-amber-100 text-amber-800 border-amber-200' };
      if (diffMins >= -30 && diffMins <= 30) return { label: 'Due Now', className: 'bg-teal-100 text-teal-800 border-teal-200 animate-pulse' };
      return { label: 'Upcoming', className: 'bg-slate-100 text-slate-700 border-slate-200' };
    } catch (e) {
      return null;
    }
  };

  const timing = getSlotTiming();
  const formattedLoggedAt = formatIndianTime(logged_at);

  return (
    <div className={`relative bg-white rounded-2xl border transition-all duration-200 p-5 shadow-sm hover:shadow-md ${
      status === 'taken' 
        ? 'border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/30'
        : status === 'missed'
        ? 'border-rose-200/80 bg-gradient-to-br from-white to-rose-50/30'
        : 'border-slate-200 hover:border-teal-300'
    }`}>
      
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center space-x-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            status === 'taken'
              ? 'bg-emerald-100 text-emerald-700'
              : status === 'missed'
              ? 'bg-rose-100 text-rose-700'
              : 'bg-teal-50 text-teal-700 border border-teal-100'
          }`}>
            <Pill className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div>
            <h4 className="text-lg font-bold text-slate-900 leading-tight">{medicine_name}</h4>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mt-1">
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono">{dosage}</span>
              <span>•</span>
              <span className="text-teal-700 font-bold">{frequency}</span>
            </div>
          </div>
        </div>

        {/* Time Slot Badge */}
        <div className="flex flex-col items-end space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 font-mono">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>{formatTimeSlot(time_slot)}</span>
          </div>
          {timing && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${timing.className}`}>
              {timing.label}
            </span>
          )}
        </div>
      </div>

      {/* Stock Info & Status Badges */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-medium">Stock:</span>
          <span className={`font-bold ${isLowStock ? 'text-rose-600' : 'text-slate-700'}`}>
            {stock_qty} remaining
          </span>

          {isLowStock && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              <span>Low</span>
            </span>
          )}
        </div>

        <div>
          {status === 'taken' && (
            <span className="inline-flex items-center space-x-1.5 text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Taken {formattedLoggedAt ? `(${formattedLoggedAt})` : ''}</span>
            </span>
          )}
          {status === 'missed' && (
            <span className="inline-flex items-center space-x-1.5 text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-lg font-bold">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Missed</span>
            </span>
          )}
          {status === 'pending' && (
            <span className="inline-flex items-center space-x-1 text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg font-semibold">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>Scheduled Today</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons for Patient */}
      {!isCaregiver && (
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          {status === 'pending' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onStatusChange(dose_id, 'taken')}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl font-bold text-xs transition active:scale-95 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as Taken</span>
              </button>

              <button
                onClick={() => onStatusChange(dose_id, 'missed')}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl font-bold text-xs transition active:scale-95 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200"
              >
                <XCircle className="w-4 h-4" />
                <span>Mark Missed</span>
              </button>
            </div>
          )}

          {status === 'taken' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onStatusChange(dose_id, 'pending')}
                title="Undo taken status and restore 1 pill to stock"
                className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Undo (Reset)</span>
              </button>

              {onLogAdhoc && (
                <button
                  onClick={() => onLogAdhoc(medicine_id)}
                  title="Log second or additional dose of this medicine today"
                  className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl font-bold text-xs bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition active:scale-95"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-teal-600" />
                  <span>Log 2nd Dose</span>
                </button>
              )}
            </div>
          )}

          {status === 'missed' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onStatusChange(dose_id, 'taken')}
                className="flex items-center justify-center space-x-2 py-2 px-3 rounded-xl font-bold text-xs transition active:scale-95 bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as Taken</span>
              </button>

              <button
                onClick={() => onStatusChange(dose_id, 'pending')}
                className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Undo Missed</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Refill Button for Patient if Low Stock */}
      {!isCaregiver && isLowStock && onRefillClick && (
        <div className="mt-2.5">
          <button
            onClick={() => onRefillClick(dose.medicine_id)}
            className="w-full py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center space-x-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            <span>Refill Stock (+30 units)</span>
          </button>
        </div>
      )}
    </div>
  );
}
