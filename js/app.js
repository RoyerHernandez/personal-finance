/**
 * App Principal - Router, sidebar, toast, theme, tooltip guide, orquestacion
 */

/**
 * Tooltip Guide Engine
 * Usage: Guide.start('key', [ { target: '#selector', text: '...', arrow: 'top' }, ... ])
 * Shows one tooltip at a time anchored to target elements. Click "Entendido" to advance.
 * Only shows once per key (stored in localStorage).
 */
const Guide = {
    _overlay: null,
    _tooltip: null,
    _steps: [],
    _current: 0,
    _key: '',
    _prevTarget: null,

    isDone(key) {
        return !!localStorage.getItem('guide_' + key);
    },

    start(key, steps) {
        if (this.isDone(key) || !steps.length) return;
        this._key = key;
        this._steps = steps;
        this._current = 0;
        this._createOverlay();
        this._show();
    },

    _createOverlay() {
        this.dismiss();
        this._overlay = document.createElement('div');
        this._overlay.className = 'guide-overlay';
        this._overlay.addEventListener('click', () => this._advance());
        document.body.appendChild(this._overlay);
    },

    _show() {
        if (this._current >= this._steps.length) { this._finish(); return; }
        const step = this._steps[this._current];
        // Un-highlight previous
        if (this._prevTarget) this._prevTarget.classList.remove('guide-target-highlight');
        // Remove old tooltip
        if (this._tooltip) this._tooltip.remove();

        const target = document.querySelector(step.target);
        if (!target) { this._current++; this._show(); return; }

        target.classList.add('guide-target-highlight');
        this._prevTarget = target;

        const arrow = step.arrow || 'top';
        const total = this._steps.length;

        this._tooltip = document.createElement('div');
        this._tooltip.className = `guide-tooltip arrow-${arrow}`;
        this._tooltip.innerHTML = `
            <div class="guide-tooltip-step">Paso ${this._current + 1} de ${total}</div>
            <div class="guide-tooltip-text">${step.text}</div>
            <div class="guide-tooltip-actions">
                <button class="guide-tooltip-skip" onclick="Guide.dismiss()">Saltar guia</button>
                <button class="guide-tooltip-btn" onclick="Guide._advance()">
                    ${this._current >= total - 1 ? 'Finalizar' : 'Entendido'}
                </button>
            </div>
        `;
        document.body.appendChild(this._tooltip);

        // Position tooltip relative to target
        requestAnimationFrame(() => this._position(target, arrow));
    },

    _position(target, arrow) {
        const tr = target.getBoundingClientRect();
        const tt = this._tooltip.getBoundingClientRect();
        let top, left;
        const gap = 12;
        const margin = 12;

        if (arrow === 'top') {
            top = tr.bottom + gap;
            left = tr.left + tr.width / 2 - tt.width / 2;
        } else if (arrow === 'bottom') {
            top = tr.top - tt.height - gap;
            left = tr.left + tr.width / 2 - tt.width / 2;
        } else if (arrow === 'left') {
            top = tr.top + tr.height / 2 - tt.height / 2;
            left = tr.right + gap;
        } else {
            top = tr.top + tr.height / 2 - tt.height / 2;
            left = tr.left - tt.width - gap;
        }

        // Keep within viewport
        left = Math.max(margin, Math.min(left, window.innerWidth - tt.width - margin));
        top = Math.max(margin, Math.min(top, window.innerHeight - tt.height - margin));

        this._tooltip.style.top = top + 'px';
        this._tooltip.style.left = left + 'px';
    },

    _advance() {
        this._current++;
        this._show();
    },

    _finish() {
        localStorage.setItem('guide_' + this._key, '1');
        this.dismiss();
    },

    dismiss() {
        if (this._prevTarget) this._prevTarget.classList.remove('guide-target-highlight');
        if (this._tooltip) this._tooltip.remove();
        if (this._overlay) this._overlay.remove();
        this._tooltip = null;
        this._overlay = null;
        this._prevTarget = null;
        if (this._key) localStorage.setItem('guide_' + this._key, '1');
    }
};

/** Toast notifications */
function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

class FinanceApp {
    constructor() {
        this.container = document.getElementById('app-content');
        this.currentPage = 'dashboard';
        this.currentModule = null;
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupDate();
        this.setupNavigation();
        this.setupSidebar();
        this.loadPage('dashboard');
    }

    setupTheme() {
        const saved = localStorage.getItem('finanzas_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
        this.updateThemeIcon(saved);

        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('finanzas_theme', next);
                this.updateThemeIcon(next);
                // Re-render current page to update chart colors
                if (this.currentModule) this.currentModule.render();
            });
        }
    }

    updateThemeIcon(theme) {
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.textContent = theme === 'dark' ? '\u{1F319}' : '\u{2600}\u{FE0F}';
            toggle.title = theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
        }
    }

    setupDate() {
        const el = document.getElementById('topbarDate');
        if (el) {
            const now = new Date();
            el.textContent = now.toLocaleDateString('es-CO', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        }
    }

    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.loadPage(page);
                document.getElementById('sidebar').classList.remove('mobile-open');
                document.getElementById('sidebarOverlay').classList.remove('active');
            });
        });
    }

    setupSidebar() {
        const sidebar = document.getElementById('sidebar');
        const toggle = document.getElementById('sidebarToggle');
        const mobileBtn = document.getElementById('mobileMenuBtn');
        const overlay = document.getElementById('sidebarOverlay');

        if (toggle) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
            });
        }

        if (mobileBtn) {
            mobileBtn.addEventListener('click', () => {
                sidebar.classList.toggle('mobile-open');
                overlay.classList.toggle('active');
            });
        }

        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('mobile-open');
                overlay.classList.remove('active');
            });
        }
    }

    loadPage(page) {
        window.history.replaceState({}, '', `#${page}`);

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-page') === page);
        });

        this.currentPage = page;

        switch (page) {
            case 'dashboard': this.currentModule = new Dashboard(this.container); break;
            case 'periods':   this.currentModule = new Periods(this.container); break;
            case 'debts':     this.currentModule = new Debts(this.container); break;
            case 'expenses':  this.currentModule = new Expenses(this.container); break;
            case 'income':    this.currentModule = new Income(this.container); break;
            case 'settings':  this.currentModule = new Settings(this.container); break;
            default: this.loadPage('dashboard'); return;
        }

        this.currentModule.render();
    }
}

// Boot
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.app = new FinanceApp(); });
} else {
    window.app = new FinanceApp();
}
