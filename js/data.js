/**
 * Módulo de gestión de datos
 * Maneja localStorage y estructura de datos
 */

/** Formatea número como moneda COP */
function fmt(n) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(n || 0);
}

/** Formatea moneda abreviada */
function fmtShort(value) {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
    return value;
}

const CATEGORIAS = ['Vivienda', 'Transporte', 'Alimentación', 'Educación', 'Servicios', 'Seguros', 'Deuda', 'Ahorro', 'Entretenimiento', 'Salud', 'Otro'];
const FRECUENCIAS = ['quincenal', 'mensual', 'semanal', 'única vez', 'anual'];
const ESTADOS = ['pendiente', 'pagado', 'vencido'];

/** Renders a status select with icon and color */
function statusSelect(estado, onchangeExpr) {
    const e = estado || 'pendiente';
    return `<select class="inline-select status-select ${e}" onchange="${onchangeExpr};this.className='inline-select status-select '+this.value">
        ${ESTADOS.map(s => `<option value="${s}" ${e === s ? 'selected' : ''}>${s === 'pagado' ? '\u2713 Pagado' : s === 'pendiente' ? '\u26A0 Pendiente' : '\u2717 Vencido'}</option>`).join('')}
    </select>`;
}

class FinanceData {
    constructor() {
        this.storageKey = 'finanzas_v1';
        this.data = this.loadData();
    }

    loadData() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error al cargar datos:', e);
                return this.getDefaultData();
            }
        }
        return this.getDefaultData();
    }

    getDefaultData() {
        return {
            settings: {
                currency: 'COP',
                periodType: 'monthly'
            },
            debts: [
                { id: 1, name: 'Cuota de la Casa', initialAmount: 14749153, currentAmount: 14749153, monthlyPayment: 450000, rate: 0, estado: 'pendiente', startDate: '2024-01-01' },
                { id: 2, name: 'Av Villas', initialAmount: 12757000, currentAmount: 12757000, monthlyPayment: 1740000, rate: 0, estado: 'pendiente', startDate: '2024-01-01' },
                { id: 3, name: 'Bancolombia TC', initialAmount: 7598276, currentAmount: 7598276, monthlyPayment: 475186, rate: 0, estado: 'pendiente', startDate: '2024-01-01' },
                { id: 4, name: 'Crédito Davivienda', initialAmount: 2200000, currentAmount: 2200000, monthlyPayment: 0, rate: 0, estado: 'pendiente', startDate: '2024-01-01' },
                { id: 5, name: 'Fincomercio', initialAmount: 4500000, currentAmount: 4500000, monthlyPayment: 0, rate: 0, estado: 'pendiente', startDate: '2024-01-01' },
                { id: 6, name: 'TC Finandina', initialAmount: 3400000, currentAmount: 3400000, monthlyPayment: 390000, rate: 0, estado: 'pendiente', startDate: '2024-01-01' },
                { id: 7, name: 'TC Cooperativa', initialAmount: 2500000, currentAmount: 2500000, monthlyPayment: 260000, rate: 0, estado: 'pendiente', startDate: '2024-01-01' }
            ],
            savings: {
                accounts: []
            },
            expenses: { items: [], monthlyTarget: 500000 },
            income: {
                sources: [
                    { id: 1, name: 'Cuota Natación Emily', frequency: 'mensual', estimado: 2200000, real: 2200000, estado: 'pagado' },
                    { id: 2, name: 'Movistar (Salario)', frequency: 'mensual', estimado: 3000000, real: 3000000, estado: 'pagado' }
                ]
            }
        };
    }

    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        localStorage.setItem('finanzas_lastUpdate', new Date().toISOString());
    }

    // --- Deudas ---
    getDebts() { return this.data.debts || []; }
    getTotalDebt() { return this.getDebts().reduce((s, d) => s + (d.currentAmount || 0), 0); }
    getDebtById(id) { return this.getDebts().find(d => d.id === id) || null; }

    addDebt(debt) {
        debt.id = Date.now();
        this.data.debts.push(debt);
        this.saveData();
        return debt;
    }

    updateDebt(id, updates) {
        const d = this.getDebtById(id);
        if (d) { Object.assign(d, updates); this.saveData(); }
        return d;
    }

    deleteDebt(id) {
        this.data.debts = this.data.debts.filter(d => d.id !== id);
        this.saveData();
    }

    // --- Cálculos ---
    getGeneralSummary() {
        const totalIncome = this.getIncomeSources().reduce((s, src) => s + (src.real || 0), 0);
        const totalDebtPayments = this.getDebts().reduce((s, d) => s + (d.monthlyPayment || 0), 0);
        const totalExpensesHormiga = this.getExpenses().reduce((s, e) => s + (e.amount || 0), 0);
        const totalExpenses = totalDebtPayments + totalExpensesHormiga;
        const totalSavings = this.getTotalSavings();
        const totalDebt = this.getTotalDebt();

        return {
            totalIncome,
            totalExpenses,
            totalDebtPayments,
            totalExpensesHormiga,
            neto: totalIncome - totalExpenses,
            totalDebt,
            totalSavings
        };
    }

    // --- Gastos hormiga ---
    getExpenses() { return this.data.expenses?.items || []; }
    getExpenseTarget() { return this.data.expenses?.monthlyTarget ?? 500000; }
    setExpenseTarget(val) {
        if (!this.data.expenses) this.data.expenses = {};
        this.data.expenses.monthlyTarget = val;
        this.saveData();
    }
    addExpense(expense) {
        if (!this.data.expenses) this.data.expenses = {};
        if (!this.data.expenses.items) this.data.expenses.items = [];
        expense.id = Date.now();
        this.data.expenses.items.push(expense);
        this.saveData();
        return expense;
    }

    // --- Ingresos ---
    getIncomeSources() { return this.data.income?.sources || []; }

    // --- Ahorros ---
    getSavings() { return this.data.savings?.accounts || []; }
    getTotalSavings() { return this.getSavings().reduce((s, a) => s + (a.balance || 0), 0); }

    addSaving(account) {
        if (!this.data.savings) this.data.savings = { accounts: [] };
        if (!this.data.savings.accounts) this.data.savings.accounts = [];
        account.id = Date.now();
        this.data.savings.accounts.push(account);
        this.saveData();
        return account;
    }

    updateSaving(id, updates) {
        const acc = this.getSavings().find(a => a.id === id);
        if (acc) { Object.assign(acc, updates); this.saveData(); }
        return acc;
    }

    deleteSaving(id) {
        if (!this.data.savings) return;
        this.data.savings.accounts = this.getSavings().filter(a => a.id !== id);
        this.saveData();
    }

    // --- Settings ---
    getSettings() { return this.data.settings || {}; }
    updateSettings(updates) {
        this.data.settings = { ...this.data.settings, ...updates };
        this.saveData();
    }

    // --- Import/Export ---
    resetData() { this.data = this.getDefaultData(); this.saveData(); }
    exportJSON() { return JSON.stringify(this.data, null, 2); }
    importJSON(jsonString) {
        try { this.data = JSON.parse(jsonString); this.saveData(); return true; }
        catch (e) { return false; }
    }
}

const financeData = new FinanceData();
