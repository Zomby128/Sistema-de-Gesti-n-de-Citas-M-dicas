# ⚡ INICIO RÁPIDO - Sistema de Citas Médicas

## 🚀 En 3 Pasos

### 1️⃣ Terminal 1 - Backend
```bash
cd backend
npm install
npm start
```

Deberías ver:
```
API de Sistema de Citas Médicas ejecutándose en puerto 3000
```

---

### 2️⃣ Terminal 2 - Frontend (Elige UNA opción)

**Opción A: Live Server (VS Code)**
- Click derecho en `frontend/index.html`
- "Open with Live Server"

**Opción B: Python**
```bash
cd frontend
python -m http.server 8000
```

**Opción C: Node.js (si tienes http-server)**
```bash
npm install -g http-server
cd frontend
http-server
```

---

### 3️⃣ Abre en el Navegador
```
http://localhost:8000
http://localhost:5500  (si usas Live Server)
http://localhost:8080  (si usas http-server)
```

---

## ✅ Verifica que TODO Funciona

1. **Dashboard aparece** con 4 estadísticas
2. **Click en "Pacientes"** muestra lista (si hay datos)
3. **Click en "Nuevo Paciente"** abre modal
4. **Llena formulario** y click "Guardar"
5. **Dashboard se actualiza** con nuevo paciente
6. **Click en "Citas"** muestra citas
7. **Click en "Nueva Cita"** agendar
8. **Selecciona paciente, doctor, fecha y hora**
9. **Click "Guardar"** - debe funcionar

---

## 📝 Datos de Prueba (Ya incluidos)

### Pacientes
- P001: María González
- P002: Carlos Rodríguez
- P003: Ana Martínez

### Doctores
- D001: Dr. Carlos Méndez (Cardiología)
- D002: Dra. Elena Ruiz (Pediatría)
- D003: Dr. Roberto Vargas (Dermatología)

### Citas
- C001-C050: Varias citas de ejemplo

---

## 🆘 Si Algo Falla

### Backend no inicia
```bash
# Verifica Node.js
node --version  # Debe ser v14+

# Reinstala dependencias
cd backend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Frontend no conecta
```bash
# Abre Console (F12) y busca:
# - CORS error → Backend no está corriendo
# - 404 error → Endpoint no existe
# - Timeout → Backend muy lento
```

### Botones no funcionan
```bash
# Recarga página (Ctrl+F5)
# Abre F12 > Console > busca errores
```

---

## 📁 Estructura Mínima Necesaria

```
Sistema-Medico/
├── backend/
│   ├── server.js          ✅ DEBE EXISTIR
│   ├── package.json       ✅ DEBE EXISTIR
│   ├── utils/fileManager.js
│   └── data/
│       ├── pacientes.json
│       ├── doctores.json
│       └── citas.json
├── frontend/
│   ├── index.html         ✅ DEBE EXISTIR
│   ├── css/
│   │   ├── styles.css
│   │   └── components.css
│   └── js/
│       ├── api.js
│       ├── app.js
│       ├── pacientes.js
│       ├── doctores.js
│       └── citas.js
└── README.md              ✅ DEBE EXISTIR
```

---

## 🔗 URLs Importantes

| Recurso | URL |
|---------|-----|
| API Raíz | http://localhost:3000 |
| Pacientes | http://localhost:3000/pacientes |
| Doctores | http://localhost:3000/doctores |
| Citas | http://localhost:3000/citas |
| Frontend | http://localhost:8000 |

---

## 🎯 Próximo Paso

1. ✅ Sistema funcionando?
2. → Lee `README.md` para entender características
3. → Lee `DEVELOPMENT.md` si quieres modificar código
4. → Lee `backend/BACKEND_DOCS.md` para API endpoints

---

**¡Listo! El sistema está operativo. Disfruta** 🎉
