// Módulo de notificaciones en tiempo real
const NotificationsManager = {
    // Historial de citas notificadas (para evitar duplicados)
    notifiedCitas: new Set(),
    
    // Intervalo de verificación (en milisegundos)
    checkInterval: 60000, // Cada minuto
    
    // ID del intervalo
    intervalId: null,
    
    // Solicitar permisos al navegador
    async requestPermission() {
        if (!('Notification' in window)) {
            console.log('Este navegador no soporta notificaciones');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            try {
                const permission = await Notification.requestPermission();
                return permission === 'granted';
            } catch (error) {
                console.error('Error al solicitar permisos de notificación:', error);
                return false;
            }
        }

        return false;
    },

    // Iniciar monitoreo de citas próximas
    startMonitoring() {
        if (this.intervalId) {
            console.warn('Monitoreo de notificaciones ya activo');
            return;
        }

        // Verificación inicial
        this.checkUpcomingAppointments();

        // Verificación periódica
        this.intervalId = setInterval(() => {
            this.checkUpcomingAppointments();
        }, this.checkInterval);

        console.log('Monitoreo de notificaciones iniciado');
    },

    // Detener monitoreo
    stopMonitoring() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('Monitoreo de notificaciones detenido');
        }
    },

    // Verificar citas próximas y enviar notificaciones
    async checkUpcomingAppointments() {
        try {
            const citasProximas = await API.getCitasProximas();

            if (!citasProximas || citasProximas.length === 0) {
                return;
            }

            const ahora = new Date();

            citasProximas.forEach(cita => {
                // Evitar notificar la misma cita dos veces
                if (this.notifiedCitas.has(cita.id)) {
                    return;
                }

                const fechaCita = new Date(`${cita.fecha}T${cita.hora}`);
                const minutosHasta = Math.round((fechaCita - ahora) / (1000 * 60));

                // Notificar si la cita es en menos de 30 minutos
                if (minutosHasta <= 30 && minutosHasta > 0) {
                    this.notifyAppointment(cita, minutosHasta);
                    this.notifiedCitas.add(cita.id);
                }
            });
        } catch (error) {
            console.error('Error al verificar citas próximas para notificaciones:', error);
        }
    },

    // Enviar notificación de cita próxima
    notifyAppointment(cita, minutosHasta) {
        if (Notification.permission !== 'granted') {
            return;
        }

        const titulo = `🏥 Cita Próxima en ${minutosHasta} min`;
        const opciones = {
            body: `${cita.pacienteNombre} con Dr. ${cita.doctorNombre} a las ${cita.hora}`,
            icon: 'https://ui-avatars.com/api/?name=ClinicaMed&background=4CAF50&color=fff',
            tag: `cita-${cita.id}`,
            requireInteraction: true,
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="50" text-anchor="middle" dominant-baseline="middle">🏥</text></svg>'
        };

        try {
            const notif = new Notification(titulo, opciones);

            // Click en notificación lleva al dashboard
            notif.onclick = () => {
                window.focus();
                if (window.app) {
                    window.app.showSection('dashboard');
                }
            };

            // Reproducir sonido
            this.playNotificationSound();
        } catch (error) {
            console.error('Error al crear notificación:', error);
        }
    },

    // Reproducir sonido de notificación
    playNotificationSound() {
        try {
            // Audio de notificación usando Web Audio API (sin necesidad de archivo)
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Sonido: do-mi-sol (acorde mayor)
            oscillator.frequency.setValueAtTime(262, audioContext.currentTime); // Do
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);

            // Segunda nota
            setTimeout(() => {
                try {
                    const osc2 = audioContext.createOscillator();
                    const gain2 = audioContext.createGain();
                    osc2.connect(gain2);
                    gain2.connect(audioContext.destination);

                    osc2.frequency.setValueAtTime(330, audioContext.currentTime); // Mi
                    gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

                    osc2.start(audioContext.currentTime);
                    osc2.stop(audioContext.currentTime + 0.2);
                } catch (e) {
                    // Ignorar si hay error de audio
                }
            }, 100);
        } catch (error) {
            console.warn('No se pudo reproducir sonido de notificación:', error);
        }
    },

    // Limpiar notificaciones antiguas
    clearOldNotifications() {
        // Limpiar IDs de citas muy antiguas (más de 1 hora)
        // Esto previene que el Set crezca indefinidamente
        if (this.notifiedCitas.size > 100) {
            this.notifiedCitas.clear();
        }
    },

    // Obtener badge con número de notificaciones
    getNotificationBadge(count) {
        return count > 0 ? count.toString() : '';
    }
};

// Exponer globalmente
window.NotificationsManager = NotificationsManager;
