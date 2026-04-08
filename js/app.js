/**
 * App Principal - Router y orquestación de módulos
 */

class FinanceApp {
    constructor() {
        this.container = document.getElementById('app-content');
        this.currentPage = 'dashboard';
        this.currentModule = null;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.loadPage('dashboard');
        this.setupHashRouting();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.loadPage(page);
            });
        });
    }

    setupHashRouting() {
        window.addEventListener('hashchange', () => {
            const page = window.location.hash.slice(1) || 'dashboard';
            this.loadPage(page);
        });
    }

    loadPage(page) {
        // Actualiza la URL sin recargar
        window.history.pushState({}, '', `#${page}`);

        // Actualiza la navegación activa
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            }
        });

        // Carga el módulo correspondiente
        this.currentPage = page;

        switch (page) {
            case 'dashboard':
                this.currentModule = new Dashboard(this.container);
                break;
            case 'periods':
                this.currentModule = new Periods(this.container);
                break;
            case 'debts':
                this.currentModule = new Debts(this.container);
                break;
            case 'expenses':
                this.currentModule = new Expenses(this.container);
                break;
            case 'income':
                this.currentModule = new Income(this.container);
                break;
            case 'settings':
                this.currentModule = new Settings(this.container);
                break;
            default:
                this.loadPage('dashboard');
                return;
        }

        // Renderiza el módulo
        this.currentModule.render();
    }
}

// Inicia la app cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new FinanceApp();
    });
} else {
    window.app = new FinanceApp();
}
