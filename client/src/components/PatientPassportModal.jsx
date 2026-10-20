import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, ShieldCheck, Heart, User, Copy, Check, Printer, ExternalLink, AlertTriangle, Pill, PhoneCall, Wifi } from 'lucide-react';
import { formatTimeSlot } from '../utils/dateUtils';

export default function PatientPassportModal({ isOpen, onClose, user, medicines = [], caregivers = [] }) {
  const [copied, setCopied] = useState(false);
  const [networkHost, setNetworkHost] = useState(window.location.hostname === 'localhost' ? '10.124.219.158' : window.location.hostname);
  const [useNetworkIp, setUseNetworkIp] = useState(window.location.hostname === 'localhost');

  if (!isOpen || !user) return null;

  // Construct target passport URL
  const portStr = window.location.port ? `:${window.location.port}` : '';
  const hostToUse = useNetworkIp ? `${networkHost}${portStr}` : window.location.host;
  const protocol = window.location.protocol;
  const passportUrl = `${protocol}//${hostToUse}/passport/${user.invite_code}`;

  const copyPassportLink = () => {
    navigator.clipboard.writeText(passportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const primaryCaregiver = caregivers.length > 0 ? caregivers[0] : { name: 'Vishesh Shah', email: 'caregiver@caredose.com' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-sky-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <QrCode className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black tracking-tight">Digital Patient Passport</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-400/30">
                  Verified
                </span>
              </div>
              <p className="text-xs text-teal-200 font-medium">Scannable emergency medical passport for any smartphone or tablet</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">

          {/* QR Code & Scan Instructions Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center gap-6">
            <div className="p-3 bg-white rounded-2xl shadow-inner shrink-0 flex items-center justify-center">
              <QRCodeSVG
                value={passportUrl}
                size={170}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230f766e'><circle cx='12' cy='12' r='10'/></svg>",
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            </div>

            <div className="space-y-3 text-center md:text-left flex-1">
              <div>
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Scan From Another Device</span>
                </span>
                <h4 className="text-lg font-black text-white mt-1.5">Point Any Phone Camera</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Opens the live Emergency Health Passport instantly. No app installation or login credentials required.
                </p>
              </div>

              {/* Network Host Switcher for local Wi-Fi testing */}
              {window.location.hostname === 'localhost' && (
                <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700 text-xs space-y-1.5 text-left">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Wifi className="w-3 h-3 text-sky-400" />
                      <span>Local Wi-Fi Network Mode:</span>
                    </span>
                    <button
                      onClick={() => setUseNetworkIp(!useNetworkIp)}
                      className="text-teal-400 hover:text-teal-300 underline font-semibold"
                    >
                      {useNetworkIp ? 'Using Wi-Fi IP (10.124.219.158)' : 'Using localhost'}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={copyPassportLink}
                  className="py-2 px-3.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Public URL!' : 'Copy Passport URL'}</span>
                </button>

                <a
                  href={passportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center space-x-1.5 transition active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Public View</span>
                </a>
              </div>
            </div>
          </div>

          {/* Emergency Medical Card Preview */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Patient Emergency Card</span>
                <h4 className="text-lg font-black text-slate-900">{user.name}</h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-700">Passport ID</span>
                <div className="text-sm font-mono font-black text-teal-800">{user.invite_code}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                <div className="text-slate-500 font-semibold flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>Primary Emergency Contact</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{primaryCaregiver.name} (Caregiver)</div>
                <div className="text-slate-500">{primaryCaregiver.email}</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                <div className="text-slate-500 font-semibold flex items-center space-x-1">
                  <Heart className="w-3.5 h-3.5 text-rose-600" />
                  <span>Blood Group & Vitals</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">O+ (Positive) • Stable</div>
                <div className="text-emerald-700 font-semibold">Active CareDose Monitoring</div>
              </div>
            </div>

            {/* Current Active Prescriptions */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center space-x-1.5">
                <Pill className="w-3.5 h-3.5 text-teal-600" />
                <span>Active Prescriptions ({medicines.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {medicines.map(m => (
                  <div key={m.id} className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{m.name}</span>
                      <span className="text-slate-500 ml-1.5 font-mono">{m.dosage}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-100">
                      {m.frequency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical Directives */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center space-x-1.5 text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Known Allergies & Directives</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800/90">
                Mild penicillin allergy. In case of unexpected medical incident, verify prescribed daily doses and notify primary caregiver immediately.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrint}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-2 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Emergency Card</span>
            </button>

            <button
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-sm active:scale-95"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
