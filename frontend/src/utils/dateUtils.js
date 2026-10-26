// Utility for Indian Standard Time (IST, UTC+5:30) date & time formatting

/**
 * Safely parse any timestamp (ISO string, legacy SQLite string, or Date)
 * If timestamp is "YYYY-MM-DD HH:mm:ss" without timezone offset, treats it as UTC.
 */
export function parseDate(ts) {
  if (!ts) return null;
  if (ts instanceof Date) return ts;

  if (typeof ts === 'string') {
    const trimmed = ts.trim();
    // Legacy SQL string without timezone: "2026-10-20 14:11:00" -> treat as UTC
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(trimmed)) {
      return new Date(trimmed.replace(' ', 'T') + 'Z');
    }
    // "2026-10-20T14:11:00" without Z -> add Z
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
      return new Date(trimmed + 'Z');
    }
    return new Date(trimmed);
  }

  return new Date(ts);
}

/**
 * Format timestamp into Indian 12-hour time: e.g. "07:45 PM"
 */
export function formatIndianTime(ts) {
  const d = parseDate(ts);
  if (!d || isNaN(d.getTime())) return null;

  try {
    return d.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).toUpperCase();
  } catch (e) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

/**
 * Format timestamp into Indian full date and time: e.g. "Oct 23, 2026, 07:45 PM"
 */
export function formatIndianDateTime(ts) {
  const d = parseDate(ts);
  if (!d || isNaN(d.getTime())) return '';

  try {
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return d.toLocaleString();
  }
}

/**
 * Format time slot e.g. "08:00" -> "8:00 AM", "20:00" -> "8:00 PM"
 */
export function formatTimeSlot(timeStr) {
  if (!timeStr) return '';
  try {
    const parts = timeStr.split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  } catch (e) {
    return timeStr;
  }
}
