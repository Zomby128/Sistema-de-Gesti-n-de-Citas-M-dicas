// Módulo de autocomplete para búsquedas avanzadas
const AutocompleteManager = {
    // Almacenar instancias activas
    instances: {},

    // Crear instancia de autocomplete
    create(config) {
        const {
            inputSelector,
            containerId,
            dataSource,
            displayField,
            valueField,
            minChars = 2,
            maxResults = 10,
            onSelect = () => {},
            formatResult = null,
            highlightMatches = true
        } = config;

        const inputEl = document.querySelector(inputSelector);
        if (!inputEl) {
            console.warn(`Input no encontrado: ${inputSelector}`);
            return null;
        }

        const containerId_unique = inputSelector.replace(/[^a-zA-Z0-9]/g, '-');
        
        // Crear contenedor si no existe
        let container = document.getElementById(containerId || containerId_unique);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId || containerId_unique;
            container.className = 'autocomplete-container';
            inputEl.parentNode.insertBefore(container, inputEl.nextSibling);
        }

        const instance = {
            inputEl,
            container,
            dataSource,
            displayField,
            valueField,
            minChars,
            maxResults,
            onSelect,
            formatResult,
            highlightMatches,
            selectedIndex: -1,
            results: [],
            open: false,
            
            async handleInput(query) {
                this.selectedIndex = -1;
                
                if (query.length < this.minChars) {
                    this.close();
                    return;
                }

                try {
                    // Obtener datos
                    let data = typeof this.dataSource === 'function' 
                        ? await this.dataSource() 
                        : this.dataSource;

                    // Filtrar por query
                    this.results = data.filter(item => {
                        const displayValue = String(item[this.displayField]).toLowerCase();
                        return displayValue.includes(query.toLowerCase());
                    }).slice(0, this.maxResults);

                    // Renderizar resultados
                    this.render(query);
                    this.open = true;
                } catch (error) {
                    console.error('Error en autocomplete:', error);
                }
            },

            render(query) {
                if (this.results.length === 0) {
                    this.container.innerHTML = '<div class="autocomplete-no-results">Sin resultados</div>';
                    return;
                }

                const items = this.results.map((item, idx) => {
                    let displayText = String(item[this.displayField]);
                    
                    // Resaltar coincidencias
                    if (this.highlightMatches) {
                        const regex = new RegExp(`(${query})`, 'gi');
                        displayText = displayText.replace(regex, '<strong>$1</strong>');
                    }

                    // Formato personalizado
                    let html;
                    if (this.formatResult) {
                        html = this.formatResult(item, displayText);
                    } else {
                        html = `<div class="autocomplete-item-text">${displayText}</div>`;
                    }

                    return `
                        <div class="autocomplete-item" data-index="${idx}" data-value="${item[this.valueField]}">
                            ${html}
                        </div>
                    `;
                }).join('');

                this.container.innerHTML = `<div class="autocomplete-list">${items}</div>`;
                
                // Event listeners
                this.container.querySelectorAll('.autocomplete-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const idx = parseInt(item.getAttribute('data-index'));
                        this.selectItem(this.results[idx]);
                    });
                    item.addEventListener('mouseenter', () => {
                        this.selectIndex(parseInt(item.getAttribute('data-index')));
                    });
                });
            },

            selectIndex(idx) {
                // Remover clase anterior
                this.container.querySelectorAll('.autocomplete-item').forEach(item => {
                    item.classList.remove('selected');
                });

                // Añadir clase nueva
                const item = this.container.querySelector(`[data-index="${idx}"]`);
                if (item) {
                    item.classList.add('selected');
                    this.selectedIndex = idx;
                }
            },

            selectItem(item) {
                this.inputEl.value = item[this.displayField];
                this.onSelect(item);
                this.close();
            },

            close() {
                this.container.innerHTML = '';
                this.open = false;
            },

            handleKeyDown(event) {
                if (!this.open || this.results.length === 0) return;

                switch (event.key) {
                    case 'ArrowDown':
                        event.preventDefault();
                        this.selectIndex(
                            this.selectedIndex === -1 ? 0 : Math.min(this.selectedIndex + 1, this.results.length - 1)
                        );
                        break;
                    case 'ArrowUp':
                        event.preventDefault();
                        this.selectIndex(Math.max(this.selectedIndex - 1, -1));
                        break;
                    case 'Enter':
                        event.preventDefault();
                        if (this.selectedIndex >= 0) {
                            this.selectItem(this.results[this.selectedIndex]);
                        }
                        break;
                    case 'Escape':
                        this.close();
                        break;
                }
            }
        };

        // Event listeners
        inputEl.addEventListener('input', (e) => instance.handleInput(e.target.value));
        inputEl.addEventListener('keydown', (e) => instance.handleKeyDown(e));
        inputEl.addEventListener('focus', (e) => {
            if (e.target.value.length >= instance.minChars) {
                instance.handleInput(e.target.value);
            }
        });

        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!inputEl.contains(e.target) && !container.contains(e.target)) {
                instance.close();
            }
        });

        // Guardar instancia
        this.instances[inputSelector] = instance;
        return instance;
    },

    // Obtener instancia
    getInstance(inputSelector) {
        return this.instances[inputSelector];
    }
};

// Exponer globalmente
window.AutocompleteManager = AutocompleteManager;
