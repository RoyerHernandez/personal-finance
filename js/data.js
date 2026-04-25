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
                { id: 1, name: 'Cuota de la Casa', initialAmount: 14749153, currentAmount: 14749153, monthlyPayment: 450000, startDate: '2024-01-01' },
                { id: 2, name: 'Av Villas', initialAmount: 12757000, currentAmount: 12757000, monthlyPayment: 1740000, startDate: '2024-01-01' },
                { id: 3, name: 'Bancolombia TC', initialAmount: 7598276, currentAmount: 7598276, monthlyPayment: 475186, startDate: '2024-01-01' },
                { id: 4, name: 'Crédito Davivienda', initialAmount: 2200000, currentAmount: 2200000, monthlyPayment: 0, startDate: '2024-01-01' },
                { id: 5, name: 'Fincomercio', initialAmount: 4500000, currentAmount: 4500000, monthlyPayment: 0, startDate: '2024-01-01' },
                { id: 6, name: 'TC Finandina', initialAmount: 3400000, currentAmount: 3400000, monthlyPayment: 390000, startDate: '2024-01-01' },
                { id: 7, name: 'TC Cooperativa', initialAmount: 2500000, currentAmount: 2500000, monthlyPayment: 260000, startDate: '2024-01-01' }
            ],
            periods: {
                'Abril 2026': {
                    name: 'Abril 2026',
                    type: 'mensual',
                    startDate: '2026-04-01',
                    endDate: '2026-04-30',
                    items: [
                        { id: 101, concept: 'Cuota Natación Emily', category: 'Educación', ingreso: 2200000, egreso: 0, saldo: 0, estado: 'pagado', debtId: null },
                        { id: 102, concept: 'Cuota de la Casa', category: 'Vivienda', ingreso: 0, egreso: 450000, saldo: 0, estado: 'pagado', debtId: 1 },
                        { id: 103, concept: 'Crédito Davivienda', category: 'Deuda', ingreso: 0, egreso: 0, saldo: 0, estado: 'pendiente', debtId: 4 },
                        { id: 104, concept: 'Av Villas', category: 'Deuda', ingreso: 0, egreso: 1740000, saldo: 0, estado: 'pagado', debtId: 2 },
                        { id: 105, concept: 'TC Finandina', category: 'Deuda', ingreso: 0, egreso: 390000, saldo: 0, estado: 'pagado', debtId: 6 },
                        { id: 106, concept: 'Tigo', category: 'Servicios', ingreso: 0, egreso: 0, saldo: 0, estado: 'pendiente', debtId: null },
                        { id: 107, concept: 'Almuerzos', category: 'Alimentación', ingreso: 0, egreso: 0, saldo: 400000, estado: 'pendiente', debtId: null },
                        { id: 108, concept: 'Transportes', category: 'Transporte', ingreso: 0, egreso: 0, saldo: 140000, estado: 'pendiente', debtId: null },
                        { id: 109, concept: 'Movistar mío', category: 'Servicios', ingreso: 0, egreso: 323000, saldo: 0, estado: 'pagado', debtId: null },
                        { id: 110, concept: 'Movistar Laus', category: 'Servicios', ingreso: 0, egreso: 51000, saldo: 0, estado: 'pagado', debtId: null },
                        { id: 111, concept: 'Universidad Laus', category: 'Educación', ingreso: 0, egreso: 1250000, saldo: 0, estado: 'pagado', debtId: null },
                        { id: 112, concept: 'Cadena', category: 'Otro', ingreso: 0, egreso: 0, saldo: 0, estado: 'pendiente', debtId: null },
                        { id: 113, concept: 'Apartamento', category: 'Vivienda', ingreso: 0, egreso: 1090000, saldo: 0, estado: 'pagado', debtId: null },
                        { id: 114, concept: 'Ahorro Littio', category: 'Ahorro', ingreso: 0, egreso: 0, saldo: 0, estado: 'pendiente', debtId: null },
                        { id: 201, concept: 'Movistar (Salario)', category: 'Servicios', ingreso: 3000000, egreso: 160000, saldo: 0, estado: 'pagado', debtId: null },
                        { id: 202, concept: 'Bancolombia TC', category: 'Deuda', ingreso: 0, egreso: 475186, saldo: 0, estado: 'pagado', debtId: 3 },
                        { id: 203, concept: 'TC Cooperativa', category: 'Deuda', ingreso: 0, egreso: 260000, saldo: 0, estado: 'pagado', debtId: 7 },
                        { id: 204, concept: 'Ahorro Programado Cooperativa', category: 'Ahorro', ingreso: 0, egreso: 0, saldo: 71000, estado: 'pendiente', debtId: null },
                        { id: 205, concept: 'Fincomercio', category: 'Deuda', ingreso: 0, egreso: 0, saldo: 0, estado: 'pendiente', debtId: 5 },
                        { id: 208, concept: 'Recibos', category: 'Servicios', ingreso: 0, egreso: 200000, saldo: 0, estado: 'pagado', debtId: null },
                        { id: 209, concept: 'Abuelo', category: 'Otro', ingreso: 0, egreso: 0, saldo: 60000, estado: 'pendiente', debtId: null },
                        { id: 210, concept: 'Skandia', category: 'Seguros', ingreso: 0, egreso: 350000, saldo: 0, estado: 'pagado', debtId: null },
                        { id: 212, concept: 'Impuesto', category: 'Otro', ingreso: 0, egreso: 300000, saldo: 0, estado: 'pagado', debtId: null }
                    ]
                }
            },
            expenses: { items: [] },
            income: {
                sources: [
                    { id: 1, name: 'Cuota Natación Emily', frequency: 'mensual', estimado: 2200000, real: 2200000, period: 'Abril 2026' },
                    { id: 2, name: 'Movistar (Salario)', frequency: 'mensual', estimado: 3000000, real: 3000000, period: 'Abril 2026' }
                ]
            }
        };
    }

    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        localStorage.setItem('finanzas_lastUpdate', new Date().toISOString());
    }

    // --- Períodos ---
    getPeriods() { return this.data.periods || {}; }
    getPeriod(name) { return this.data.periods[name] || null; }

    setPeriod(name, periodData) {
        this.data.periods[name] = { name, ...periodData };
        this.saveData();
    }

    deletePeriod(name) {
        delete this.data.periods[name];
        this.saveData();
    }

    addItemToPeriod(periodName, item) {
        const p = this.getPeriod(periodName);
        if (!p) return null;
        if (!p.items) p.items = [];
        item.id = Date.now();
        p.items.push(item);
        this.saveData();
        return item;
    }

    updateItemInPeriod(periodName, itemId, updates) {
        const p = this.getPeriod(periodName);
        if (!p || !p.items) return null;
        const item = p.items.find(i => i.id === itemId);
        if (!item) return null;
        Object.assign(item, updates);
        this.saveData();
        return item;
    }

    deleteItemFromPeriod(periodName, itemId) {
        const p = this.getPeriod(periodName);
        if (p && p.items) {
            p.items = p.items.filter(i => i.id !== itemId);
            this.saveData();
        }
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
        Object.values(this.data.periods).forEach(p => {
            (p.items || []).forEach(item => {
                if (item.debtId === id) item.debtId = null;
            });
        });
        this.saveData();
    }

    // --- Cálculos ---
    calcPeriodo(periodName) {
        const p = this.getPeriod(periodName);
        if (!p) return { totIngreso: 0, totEgreso: 0, totSaldo: 0, neto: 0 };
        const items = p.items || [];
        const totIngreso = items.reduce((s, i) => s + (i.ingreso || 0), 0);
        const totEgreso = items.reduce((s, i) => s + (i.egreso || 0), 0);
        const totSaldo = items.reduce((s, i) => s + (i.saldo || 0), 0);
        return { totIngreso, totEgreso, totSaldo, neto: totIngreso - totEgreso - totSaldo };
    }

    getGeneralSummary() {
        const periods = Object.keys(this.data.periods);
        let totalIncome = 0, totalExpenses = 0, totalSaldo = 0;
        periods.forEach(name => {
            const c = this.calcPeriodo(name);
            totalIncome += c.totIngreso;
            totalExpenses += c.totEgreso;
            totalSaldo += c.totSaldo;
        });
        return {
            totalIncome, totalExpenses, totalSaldo,
            neto: totalIncome - totalExpenses - totalSaldo,
            totalDebt: this.getTotalDebt()
        };
    }

    // --- Gastos hormiga ---
    getExpenses() { return this.data.expenses?.items || []; }
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
