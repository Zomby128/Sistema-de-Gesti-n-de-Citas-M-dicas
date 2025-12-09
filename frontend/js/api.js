// URL del servidor (cambiar si es necesario)
const API_URL = 'http://localhost:3000';

// Función base para hacer requests HTTP
async function request(method, endpoint, body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${API_URL}${endpoint}`, opts);
    const contentType = res.headers.get('Content-Type') || '';
    const text = await res.text();
    let data = null;
    if (contentType.includes('application/json')) {
      try { data = JSON.parse(text); } catch (e) { data = null; }
    } else {
      data = text;
    }

    if (!res.ok) {
      const errMessage = (data && data.message) ? data.message : (typeof data === 'string' && data.length ? data : `HTTP ${res.status}`);
      throw new Error(errMessage);
    }
    return data;
  } catch (err) {
    console.error('API error:', err);
    throw err;
  }
}

// Funciones para acceder a pacientes

async function getPacientes() { return await request('GET', '/pacientes'); }
async function getPaciente(id) { return await request('GET', `/pacientes/${id}`); }
async function createPaciente(payload) { return await request('POST', '/pacientes', payload); }
async function updatePaciente(id, payload) { return await request('PUT', `/pacientes/${id}`, payload); }
async function deletePaciente(id) { return await request('DELETE', `/pacientes/${id}`); }

async function getDoctores() { return await request('GET', '/doctores'); }
async function getDoctor(id) { return await request('GET', `/doctores/${id}`); }
async function createDoctor(payload) { return await request('POST', '/doctores', payload); }
async function updateDoctor(id, payload) { return await request('PUT', `/doctores/${id}`, payload); }

// Construir query string (soporta string, objeto o nada)
function buildQuery(q) {
  if (!q) return '';
  if (typeof q === 'string') return q.startsWith('?') ? q : `?${q}`;
  if (typeof q === 'object') {
    const params = Object.entries(q)
      .filter(([k, v]) => v !== undefined && v !== null && String(v) !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    return params ? `?${params}` : '';
  }
  return '';
}

async function getCitas(query = '') {
  const qs = buildQuery(query);
  return await request('GET', `/citas${qs}`);
}
async function getCita(id) { return await request('GET', `/citas/${id}`); }
async function createCita(payload) { return await request('POST', '/citas', payload); }
async function updateCita(id, payload) { return await request('PUT', `/citas/${id}`, payload); }
async function cancelCita(id) { return await request('PUT', `/citas/${id}/cancelar`); }

// Obtener citas de hoy
function getCitasHoy() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const fecha = `${yyyy}-${mm}-${dd}`;
  return getCitas({ fecha }); // usamos objeto; buildQuery lo convertirá bien
}

// Obtener citas de las próximas 24 horas
function getCitasProximas() {
  return request('GET', '/citas/proximas');
}
// Estadísticas para dashboard
async function getCitasPorMes() { return await request('GET', '/estadisticas/citas-mes'); }
async function getTasaCancelacion(dias = 30) { return await request('GET', `/estadisticas/tasa-cancelacion?dias=${encodeURIComponent(dias)}`); }

// Mostrar notificación temporal
function showToast(msg, timeout = 3500) {
  const t = document.getElementById('toast');
  if (!t) { console.log('Toast:', msg); return; }
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), timeout);
}

function formatDateISOToLocal(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString(); } catch (e) { return iso; }
}

// Exponer funciones globalmente para compatibilidad
window.api = {
  request,
  getPacientes, getPaciente, createPaciente, updatePaciente, deletePaciente,
  getDoctores, getDoctor, createDoctor, updateDoctor,
  getCitas, getCita, createCita, updateCita, cancelCita,
  getCitasHoy, getCitasProximas,
  getCitasPorMes, getTasaCancelacion,
  showToast, formatDateISOToLocal
};

// Alias para compatibilidad con código existente
window.API = window.API || {};
window.API.getPacientes = window.API.getPacientes || window.api.getPacientes;
window.API.getDoctores = window.API.getDoctores || window.api.getDoctores;
window.API.getCitas = window.API.getCitas || window.api.getCitas;
window.API.getCita = window.API.getCita || window.api.getCita;
window.API.createCita = window.API.createCita || window.api.createCita;
window.API.cancelCita = window.API.cancelCita || window.api.cancelCita;
window.API.getCitasHoy = window.API.getCitasHoy || window.api.getCitasHoy;
window.API.getCitasProximas = window.API.getCitasProximas || window.api.getCitasProximas;
window.API.getCitasPorMes = window.API.getCitasPorMes || window.api.getCitasPorMes;
window.API.getTasaCancelacion = window.API.getTasaCancelacion || window.api.getTasaCancelacion;
