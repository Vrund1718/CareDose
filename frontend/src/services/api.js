const API_HOST = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
const BASE_URL = `${API_HOST}/api`;

function getAuthHeader() {
  const token = localStorage.getItem('caredose_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.error || data.message || `HTTP Error ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // Auth API
  auth: {
    login: async (credentials) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return handleResponse(res);
    },
    register: async (userData) => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    }
  },

  // Medicines API
  medicines: {
    getAll: async (patientId) => {
      const url = patientId ? `${BASE_URL}/medicines?patient_id=${patientId}` : `${BASE_URL}/medicines`;
      const res = await fetch(url, { headers: { ...getAuthHeader() } });
      return handleResponse(res);
    },
    create: async (medicineData) => {
      const res = await fetch(`${BASE_URL}/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(medicineData)
      });
      return handleResponse(res);
    },
    update: async (id, medicineData) => {
      const res = await fetch(`${BASE_URL}/medicines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(medicineData)
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${BASE_URL}/medicines/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    },
    refill: async (id, addQuantity = 30) => {
      const res = await fetch(`${BASE_URL}/medicines/${id}/refill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ add_quantity: addQuantity })
      });
      return handleResponse(res);
    }
  },

  // Daily Schedules & Doses API
  schedules: {
    getToday: async (patientId) => {
      const url = patientId ? `${BASE_URL}/schedules/today?patient_id=${patientId}` : `${BASE_URL}/schedules/today`;
      const res = await fetch(url, { headers: { ...getAuthHeader() } });
      return handleResponse(res);
    },
    updateStatus: async (doseId, status) => {
      const res = await fetch(`${BASE_URL}/doses/${doseId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status })
      });
      return handleResponse(res);
    },
    logAdhoc: async (medicineId) => {
      const res = await fetch(`${BASE_URL}/schedules/log-adhoc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ medicine_id: medicineId })
      });
      return handleResponse(res);
    }
  },

  // Caregivers API
  caregivers: {
    linkPatient: async (payload) => {
      const res = await fetch(`${BASE_URL}/caregivers/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload)
      });
      return handleResponse(res);
    },
    getPatients: async () => {
      const res = await fetch(`${BASE_URL}/caregivers/patients`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    },
    getAlerts: async () => {
      const res = await fetch(`${BASE_URL}/caregivers/alerts`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    },
    getMyCaregivers: async () => {
      const res = await fetch(`${BASE_URL}/caregivers/my-caregivers`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    }
  },

  // Appointments API
  appointments: {
    getAll: async (patientId) => {
      const url = patientId ? `${BASE_URL}/appointments?patient_id=${patientId}` : `${BASE_URL}/appointments`;
      const res = await fetch(url, { headers: { ...getAuthHeader() } });
      return handleResponse(res);
    },
    create: async (appointmentData) => {
      const res = await fetch(`${BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(appointmentData)
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${BASE_URL}/appointments/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    }
  },

  // Reports API
  reports: {
    getAdherence: async (patientId) => {
      const url = patientId ? `${BASE_URL}/reports/adherence?patient_id=${patientId}` : `${BASE_URL}/reports/adherence`;
      const res = await fetch(url, { headers: { ...getAuthHeader() } });
      return handleResponse(res);
    }
  }
};
