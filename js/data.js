/**
 * Módulo de gestión de datos
 * Maneja localStorage y estructura de datos
 */

class FinanceData {
    constructor() {
        this.storageKey = 'financeAppData';
        this.data = this.loadData();
    }

    /**
     * Carga datos del localStorage o retorna datos por defecto
     */
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

    /**
     * Estructura de datos por defecto
     */
    getDefaultData() {
        return {
            settings: {
                currency: 'COP',
                periodType: 'monthly', // 'monthly', 'biweekly'
                periodNames: ['Mes 1', 'Mes 2'], // Flexible para quincenas o meses
                startDate: new Date().toISOString().split('T')[0]
            },
            periods: {
                // Estructura flexible: periods[nombrePeriodo]
                'Período 1': {
                    name: 'Período 1',
                    income: 2200000,
                    items: [
                        { id: 1, name: 'Cuota Natación Emily', type: 'expense', amount: 0, debt: 0 },
                        { id: 2, name: 'Cuota de la Casa', type: 'expense', amount: 450000, debt: 14749153 },
                        { id: 3, name: 'Crédito Davivienda', type: 'debt', amount: 0, debt: 2200000 },
                        { id: 4, name: 'Servicios', type: 'expense', amount: 500000, debt: 0 }
                    ]
                },
                'Período 2': {
                    name: 'Período 2',
                    income: 2200000,
                    items: [
                        { id: 5, name: 'Bancolombia TC', type: 'debt', amount: 0, debt: 7598276 },
                        { id: 6, name: 'Cooperativa', type: 'debt', amount: 0, debt: 3850000 },
                        { id: 7, name: 'Recibos', type: 'expense', amount: 200000, debt: 0 },
                        { id: 8, name: 'Impuesto', type: 'expense', amount: 300000, debt: 0 }
                    ]
                }
            },
            debts: [
                { id: 1, name: 'Cuota de la Casa', initialAmount: 14749153, currentAmount: 14749153, monthlyPayment: 450000, startDate: '2024-01-01' },
                { id: 2, name: 'Av. Villas', initialAmount: 12757000, currentAmount: 12757000, monthlyPayment: 400000, startDate: '2024-01-01' },
                { id: 3, name: 'Bancolombia TC', initialAmount: 7598276, currentAmount: 7598276, monthlyPayment: 300000, startDate: '2024-01-01' },
                { id: 4, name: 'Crédito Davivienda', initialAmount: 2200000, currentAmount: 2200000, monthlyPayment: 150000, startDate: '2024-01-01' },
                { id: 5, name: 'Cooperativa', initialAmount: 3850000, currentAmount: 3850000, monthlyPayment: 200000, startDate: '2024-01-01' }
            ],
            expenses: {
                // Gastos hormiga: { date, category, amount, description }
                items: []
            },
            income: {
                // Fuentes de ingreso: { date, source, amount, period }
                sources: [
                    { id: 1, name: 'Salario Principal', monthlyAmount: 2200000 },
                    { id: 2, name: 'Ingresos Adicionales', monthlyAmount: 0 }
                ],
                history: []
            }
        };
    }

    /**
     * Guarda datos en localStorage
     */
    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    /**
     * Obtiene todos los períodos
     */
    getPeriods() {
        return this.data.periods || {};
    }

    /**
     * Obtiene un período específico
     */
    getPeriod(periodName) {
        return this.data.periods[periodName] || null;
    }

    /**
     * Crea o actualiza un período
     */
    setPeriod(periodName, periodData) {
        if (!this.data.periods) this.data.periods = {};
        this.data.periods[periodName] = {
            name: periodName,
            income: periodData.income || 0,
            items: periodData.items || []
        };
        this.saveData();
    }

    /**
     * Elimina un período
     */
    deletePeriod(periodName) {
        if (this.data.periods) {
            delete this.data.periods[periodName];
            this.saveData();
        }
    }

    /**
     * Añade un item a un período
     */
    addItemToPeriod(periodName, item) {
        const period = this.getPeriod(periodName);
        if (period) {
            if (!period.items) period.items = [];
            item.id = Date.now();
            period.items.push(item);
            this.saveData();
            return item;
        }
        return null;
    }

    /**
     * Actualiza un item en un período
     */
    updateItemInPeriod(periodName, itemId, updates) {
        const period = this.getPeriod(periodName);
        if (period && period.items) {
            const item = period.items.find(i => i.id === itemId);
            if (item) {
                Object.assign(item, updates);
                this.saveData();
                return item;
            }
        }
        return null;
    }

    /**
     * Elimina un item de un período
     */
    deleteItemFromPeriod(periodName, itemId) {
        const period = this.getPeriod(periodName);
        if (period && period.items) {
            period.items = period.items.filter(i => i.id !== itemId);
            this.saveData();
        }
    }

    /**
     * Obtiene todas las deudas
     */
    getDebts() {
        return this.data.debts || [];
    }

    /**
     * Obtiene el total de deudas
     */
    getTotalDebt() {
        return this.getDebts().reduce((sum, debt) => sum + (debt.currentAmount || 0), 0);
    }

    /**
     * Actualiza una deuda
     */
    updateDebt(debtId, updates) {
        const debt = this.data.debts.find(d => d.id === debtId);
        if (debt) {
            Object.assign(debt, updates);
            this.saveData();
            return debt;
        }
        return null;
    }

    /**
     * Calcula resumen de un período
     */
    getPeriodSummary(periodName) {
        const period = this.getPeriod(periodName);
        if (!period) return null;

        const items = period.items || [];
        const expenses = items.filter(i => i.type === 'expense');
        const debts = items.filter(i => i.type === 'debt');

        const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalDebts = debts.reduce((sum, d) => sum + (d.debt || 0), 0);
        const balance = (period.income || 0) - totalExpenses;

        return {
            periodName,
            income: period.income || 0,
            totalExpenses,
            totalDebts,
            balance,
            items
        };
    }

    /**
     * Calcula resumen general
     */
    getGeneralSummary() {
        const periods = Object.values(this.getPeriods());
        let totalIncome = 0;
        let totalExpenses = 0;
        let totalDebtBalance = 0;

        periods.forEach(period => {
            totalIncome += period.income || 0;
            const items = period.items || [];
            items.forEach(item => {
                if (item.type === 'expense') {
                    totalExpenses += item.amount || 0;
                } else if (item.type === 'debt') {
                    totalDebtBalance += item.debt || 0;
                }
            });
        });

        return {
            totalIncome,
            totalExpenses,
            totalDebtBalance,
            balance: totalIncome - totalExpenses,
            totalDebtAmount: this.getTotalDebt()
        };
    }

    /**
     * Obtiene gastos hormiga
     */
    getExpenses() {
        return this.data.expenses?.items || [];
    }

    /**
     * Añade un gasto hormiga
     */
    addExpense(expense) {
        if (!this.data.expenses) this.data.expenses = {};
        if (!this.data.expenses.items) this.data.expenses.items = [];
        expense.id = Date.now();
        this.data.expenses.items.push(expense);
        this.saveData();
        return expense;
    }

    /**
     * Obtiene fuentes de ingresos
     */
    getIncomeSources() {
        return this.data.income?.sources || [];
    }

    /**
     * Obtiene historial de ingresos
     */
    getIncomeHistory() {
        return this.data.income?.history || [];
    }

    /**
     * Obtiene configuración
     */
    getSettings() {
        return this.data.settings || {};
    }

    /**
     * Actualiza configuración
     */
    updateSettings(updates) {
        this.data.settings = { ...this.data.settings, ...updates };
        this.saveData();
    }

    /**
     * Resetea todos los datos (PELIGROSO)
     */
    resetData() {
        this.data = this.getDefaultData();
        this.saveData();
    }

    /**
     * Exporta datos como JSON
     */
    exportJSON() {
        return JSON.stringify(this.data, null, 2);
    }

    /**
     * Importa datos desde JSON
     */
    importJSON(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.data = { ...this.getDefaultData(), ...imported };
            this.saveData();
            return true;
        } catch (e) {
            console.error('Error al importar datos:', e);
            return false;
        }
    }
}

// Instancia global
const financeData = new FinanceData();
