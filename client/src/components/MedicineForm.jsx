import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Pill, Clock, AlertCircle } from 'lucide-react';

export default function MedicineForm({ isOpen, onClose, onSave, initialData = null }) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [stockQty, setStockQty] = useState('30');
  const [refillThreshold, setRefillThreshold] = useState('5');
  const [timeSlots, setTimeSlots] = useState(['08:00']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDosage(initialData.dosage || '');
      setFrequency(initialData.frequency || 'Once daily');
      setStockQty(String(initialData.stock_qty || 30));
      setRefillThreshold(String(initialData.refill_threshold || 5));
      setTimeSlots(initialData.time_slots && initialData.time_slots.length > 0 ? initialData.time_slots : ['08:00']);
    } else {
      setName('');
      setDosage('');
      setFrequency('Once daily');
      setStockQty('30');
      setRefillThreshold('5');
      setTimeSlots(['08:00']);
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFrequencyChange = (newFreq) => {
    setFrequency(newFreq);
    // Automatically configure default time slots matching the chosen frequency
    if (newFreq === 'Twice daily') {
      setTimeSlots(['08:00', '20:00']);
    } else if (newFreq === 'Three times daily') {
      setTimeSlots(['08:00', '14:00', '20:00']);
    } else if (newFreq === 'Every 8 hours') {
      setTimeSlots(['08:00', '16:00', '00:00']);
    } else if (newFreq === 'Once daily') {
      setTimeSlots(['08:00']);
    }
  };

  const handleAddTimeSlot = (presetTime = '') => {
    const slot = presetTime || '12:00';
    if (!timeSlots.includes(slot)) {
      setTimeSlots([...timeSlots, slot]);
    } else {
      setTimeSlots([...timeSlots, '16:00']);
    }
  };

  const handleRemoveTimeSlot = (index) => {
    if (timeSlots.length <= 1) {
      setError('At least one time slot is required.');
      return;
    }
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const handleTimeSlotChange = (index, value) => {
    const newSlots = [...timeSlots];
    newSlots[index] = value;
    setTimeSlots(newSlots);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter medication name.');
    if (!dosage.trim()) return setError('Please enter dosage (e.g., 10 mg).');
    if (!stockQty || isNaN(stockQty) || Number(stockQty) < 0) return setError('Please enter a valid stock quantity.');

    // Ensure adequate time slots for multi-dose frequency
    let finalSlots = [...timeSlots].filter(s => s && s.trim());
    if (frequency === 'Twice daily' && finalSlots.length < 2) {
      finalSlots.push('20:00');
    } else if (frequency === 'Three times daily' && finalSlots.length < 3) {
      if (!finalSlots.includes('14:00')) finalSlots.push('14:00');
      if (!finalSlots.includes('20:00')) finalSlots.push('20:00');
    }

    try {
      setLoading(true);
      setError('');
      await onSave({
        id: initialData?.id,
        name: name.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        stock_qty: Number(stockQty),
        refill_threshold: Number(refillThreshold),
        time_slots: finalSlots
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save medication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Pill className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {initialData ? 'Edit Medication' : 'Add New Medication'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Set dosage, stock levels, and alarm times</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Medication Name</label>
            <input
              type="text"
              placeholder="e.g., Lisinopril, Metformin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 text-sm font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Dosage</label>
              <input
                type="text"
                placeholder="e.g., 10 mg, 1 tablet"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 text-sm font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => handleFrequencyChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 text-sm font-medium bg-white"
              >
                <option value="Once daily">Once daily (1 dose/day)</option>
                <option value="Twice daily">Twice daily (2 doses/day - Morning & Night)</option>
                <option value="Three times daily">Three times daily (3 doses/day)</option>
                <option value="Every 8 hours">Every 8 hours (3 doses/day)</option>
                <option value="As needed">As needed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 text-sm font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Refill Warning At</label>
              <input
                type="number"
                min="1"
                value={refillThreshold}
                onChange={(e) => setRefillThreshold(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 text-sm font-medium"
                required
              />
            </div>
          </div>

          {/* Time Slots Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Scheduled Time Slots</span>
                </label>
                <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-bold">
                  {timeSlots.length} daily alarm{timeSlots.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-[11px]">
                <button type="button" onClick={() => handleAddTimeSlot('08:00')} className="px-2 py-0.5 rounded bg-slate-100 hover:bg-teal-50 text-slate-700 font-medium">+ 8 AM</button>
                <button type="button" onClick={() => handleAddTimeSlot('14:00')} className="px-2 py-0.5 rounded bg-slate-100 hover:bg-teal-50 text-slate-700 font-medium">+ 2 PM</button>
                <button type="button" onClick={() => handleAddTimeSlot('20:00')} className="px-2 py-0.5 rounded bg-slate-100 hover:bg-teal-50 text-slate-700 font-medium">+ 8 PM</button>
              </div>
            </div>

            <div className="space-y-2">
              {timeSlots.map((slot, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={slot}
                    onChange={(e) => handleTimeSlotChange(idx, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono text-sm font-semibold focus:outline-none focus:border-teal-500"
                    required
                  />
                  {timeSlots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTimeSlot(idx)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition active:scale-95"
            >
              {loading ? 'Saving...' : initialData ? 'Update Medication' : 'Save Medication'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
