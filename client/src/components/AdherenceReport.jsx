import React from 'react';
import { Activity, CheckCircle2, XCircle, TrendingUp, ShieldCheck, Award } from 'lucide-react';

export default function AdherenceReport({ reportData, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded-lg w-1/3"></div>
        <div className="h-20 bg-slate-100 rounded-2xl"></div>
        <div className="h-40 bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  if (!reportData || !reportData.summary) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center text-slate-500 text-sm">
        No adherence data available yet. Start logging doses!
      </div>
    );
  }

  const { summary, medicine_stats = [], daily_trend = [] } = reportData;
  const weeklyRate = summary.weekly?.adherence_rate || 0;
  const monthlyRate = summary.monthly?.adherence_rate || 0;

  // Grade badge based on weekly rate
  const getGrade = (rate) => {
    if (rate >= 90) return { label: 'Excellent Adherence', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (rate >= 75) return { label: 'Good Adherence', color: 'bg-teal-100 text-teal-800 border-teal-300' };
    if (rate >= 50) return { label: 'Moderate Risk', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { label: 'Needs Attention', color: 'bg-rose-100 text-rose-800 border-rose-300' };
  };

  const grade = getGrade(weeklyRate);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-sky-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
            <Activity className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Medication Adherence Summary</h3>
            <p className="text-xs text-slate-500 font-medium">Weekly & Monthly tracking insights</p>
          </div>
        </div>

        <div className={`px-3.5 py-1.5 rounded-full border text-xs font-bold inline-flex items-center space-x-1.5 self-start sm:self-auto ${grade.color}`}>
          <Award className="w-4 h-4" />
          <span>{grade.label}</span>
        </div>
      </div>

      {/* Main Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Weekly Score Card */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-2xl p-5 shadow-md shadow-teal-600/15 relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-100 mb-1">7-Day Adherence</div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black">{weeklyRate}%</span>
              <span className="text-xs text-teal-100 font-medium">doses taken</span>
            </div>

            {/* Custom Styled Progress Bar */}
            <div className="w-full bg-teal-900/40 rounded-full h-3 mt-4 p-0.5 overflow-hidden">
              <div 
                className="bg-white rounded-full h-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(0, weeklyRate))}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center mt-3 text-xs text-teal-100 font-semibold">
              <span>Taken: {summary.weekly.taken}</span>
              <span>Missed: {summary.weekly.missed}</span>
              <span>Total: {summary.weekly.total}</span>
            </div>
          </div>
        </div>

        {/* Monthly Score Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">30-Day Adherence</div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black text-sky-400">{monthlyRate}%</span>
              <span className="text-xs text-slate-400 font-medium">overall compliance</span>
            </div>

            {/* Custom Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-3 mt-4 p-0.5 overflow-hidden">
              <div 
                className="bg-sky-400 rounded-full h-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(0, monthlyRate))}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center mt-3 text-xs text-slate-400 font-semibold">
              <span className="text-emerald-400">Taken: {summary.monthly.taken}</span>
              <span className="text-rose-400">Missed: {summary.monthly.missed}</span>
              <span>Total: {summary.monthly.total}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 7-Day Trend Visual Bars */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
          <TrendingUp className="w-4 h-4 text-teal-600" />
          <span>Last 7 Days Daily Breakdown</span>
        </h4>

        <div className="grid grid-cols-7 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          {daily_trend.map((day, idx) => {
            const hasData = day.total > 0;
            const takenPct = hasData ? Math.round((day.taken / day.total) * 100) : 0;
            const missedPct = hasData ? Math.round((day.missed / day.total) * 100) : 0;

            return (
              <div key={idx} className="flex flex-col items-center space-y-2">
                
                {/* Bar Container */}
                <div className="w-full h-24 bg-white rounded-xl border border-slate-200 p-1 flex flex-col justify-end overflow-hidden relative">
                  {hasData ? (
                    <div className="w-full flex flex-col justify-end h-full">
                      {day.missed > 0 && (
                        <div 
                          className="w-full bg-rose-500 rounded-t-sm transition-all" 
                          style={{ height: `${missedPct}%` }}
                          title={`${day.missed} missed`}
                        ></div>
                      )}
                      {day.taken > 0 && (
                        <div 
                          className="w-full bg-teal-500 rounded-b-sm transition-all" 
                          style={{ height: `${takenPct}%` }}
                          title={`${day.taken} taken`}
                        ></div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-medium">
                      No logs
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-xs font-bold text-slate-800">{day.day_name}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">{hasData ? `${day.taken}/${day.total}` : '-'}</div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown by Medication Table */}
      {medicine_stats.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Adherence by Medication
          </h4>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Medicine</th>
                  <th className="px-4 py-3">Taken</th>
                  <th className="px-4 py-3">Missed</th>
                  <th className="px-4 py-3">Compliance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {medicine_stats.map((med, i) => (
                  <tr key={i} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-bold text-slate-900">{med.medicine_name}</td>
                    <td className="px-4 py-3 text-emerald-600 font-bold">{med.taken}</td>
                    <td className="px-4 py-3 text-rose-600 font-bold">{med.missed}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${med.adherence_rate >= 80 ? 'bg-teal-500' : 'bg-amber-500'}`}
                            style={{ width: `${med.adherence_rate}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-slate-900">{med.adherence_rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
