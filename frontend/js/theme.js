// Sistema de modo oscuro/claro
const ThemeManager = {
    // Temas disponibles
    themes: {
        light: {
            name: 'light',
            label: 'Claro',
            icon: 'fa-sun',
            colors: {
                '--bg-primary': '#ffffff',
                '--bg-secondary': '#f5f5f5',
                '--bg-tertiary': '#efefef',
                '--text-primary': '#333333',
                '--text-secondary': '#666666',
                '--text-light': '#999999'
            }
        },
        dark: {
            name: 'dark',
            label: 'Oscuro',
            icon: 'fa-moon',
            colors: {
                '--bg-primary': '#1a1a1a',
                '--bg-secondary': '#2d2d2d',
                '--bg-tertiary': '#3a3a3a',
                '--text-primary': '#ffffff',
                '--text-secondary': '#cccccc',
                '--text-light': '#999999'
            }
        }
    },

    // Tema actual
    currentTheme: 'light',

    // Clave de localStorage
    storageKey: 'clinicamed-theme',

    // Inicializar tema
    init() {
        // Obtener tema guardado o usar el del sistema
        const savedTheme = localStorage.getItem(this.storageKey);
        
        if (savedTheme && this.themes[savedTheme]) {
            this.setTheme(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setTheme('dark');
        } else {
            this.setTheme('light');
        }

        // Detectar cambios de preferencia del sistema
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(this.storageKey)) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    },

    // Establecer tema
    setTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;

        this.currentTheme = themeName;

        // Aplicar variables CSS
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        // Guardar preferencia
        localStorage.setItem(this.storageKey, themeName);

        // Actualizar atributo en HTML
        document.documentElement.setAttribute('data-theme', themeName);

        // Disparar evento
        this.dispatchEvent(themeName);
    },

    // Toggle tema
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    },

    // Obtener tema actual
    getCurrent() {
        return this.currentTheme;
    },

    // Obtener info del tema
    getThemeInfo(themeName = this.currentTheme) {
        return this.themes[themeName];
    },

    // Disparar evento personalizado
    dispatchEvent(themeName) {
        window.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme: themeName }
        }));
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ThemeManager.init();
    });
} else {
    ThemeManager.init();
}

// Exponer globalmente
window.ThemeManager = ThemeManager;
