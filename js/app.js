/**
 * App Principal - Router, sidebar, toast, orquestación
 */

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
        this.setupDate();
        this.setupNavigation();
        this.setupSidebar();
        this.loadPage('dashboard');
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
                // Cerrar sidebar en mobile
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
