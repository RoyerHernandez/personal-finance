/**
 * Módulo Dashboard
 * Resumen general de finanzas, gráficos y KPIs
 */

class Dashboard {
    constructor(container) {
        this.container = container;
        this.chartInstances = {};
    }

    render() {
        const summary = financeData.getGeneralSummary();
        const debts = financeData.getDebts();
        const periods = financeData.getPeriods();

        this.container.innerHTML = `
            <div class="dashboard">
                <h1>📊 Dashboard</h1>

                <!-- KPIs Principales -->
                <div class="grid grid-3">
                    <div class="kpi ${summary.balance >= 0 ? 'positive' : 'negative'}">
                        <div class="kpi-label">Balance Neto</div>
                        <div class="kpi-value">${this.formatCurrency(summary.balance)}</div>
                    </div>
                    <div class="kpi positive">
                        <div class="kpi-label">Ingresos Totales</div>
                        <div class="kpi-value">${this.formatCurrency(summary.totalIncome)}</div>
                    </div>
                    <div class="kpi danger">
                        <div class="kpi-label">Deuda Total</div>
                        <div class="kpi-value">${this.formatCurrency(summary.totalDebtAmount)}</div>
                    </div>
                </div>

                <!-- Flujo de Gastos vs Ingresos -->
                <div class="grid grid-2">
                    <div class="card">
                        <div class="card-header">
                            <h3>Flujo de Caja</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="flowChart"></canvas>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3>Deuda Total por Acreedor</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="debtChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Resumen de Períodos -->
                <div class="card">
                    <div class="card-header">
                        <h3>Resumen por Período</h3>
                    </div>
                    ${this.renderPeriodsTable(periods)}
                </div>

                <!-- Top Deudas -->
                <div class="card">
                    <div class="card-header">
                        <h3>Deudas principales</h3>
                    </div>
                    ${this.renderDebtsTable(debts)}
                </div>
            </div>
        `;

        // Renderiza gráficos después de que el DOM esté listo
        setTimeout(() => {
            this.renderFlowChart(summary);
            this.renderDebtChart(debts);
        }, 100);
    }

    renderFlowChart(summary) {
        const ctx = document.getElementById('flowChart');
        if (this.chartInstances.flow) this.chartInstances.flow.destroy();

        this.chartInstances.flow = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Ingresos', 'Gastos', 'Balance'],
                datasets: [{
                    label: 'Cantidad',
                    data: [summary.totalIncome, summary.totalExpenses, summary.balance],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(37, 99, 235, 0.8)'
                    ],
                    borderColor: [
                        'rgb(16, 185, 129)',
                        'rgb(239, 68, 68)',
                        'rgb(37, 99, 235)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrencyShort(value)
                        }
                    }
                }
            }
        });
    }

    renderDebtChart(debts) {
        const ctx = document.getElementById('debtChart');
        if (this.chartInstances.debt) this.chartInstances.debt.destroy();

        const labels = debts.map(d => d.name);
        const data = debts.map(d => d.currentAmount);
        const colors = [
            'rgba(239, 68, 68, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(37, 99, 235, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)'
        ];

        this.chartInstances.debt = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors.slice(0, data.length),
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderPeriodsTable(periods) {
        const periodsArray = Object.values(periods);

        if (periodsArray.length === 0) {
            return '<p class="text-muted">No hay períodos configurados</p>';
        }

        let html = '<div class="table-container"><table><thead><tr>';
        html += '<th>Período</th><th class="text-right">Ingresos</th><th class="text-right">Gastos</th><th class="text-right">Deudas</th><th class="text-right">Balance</th>';
        html += '</tr></thead><tbody>';

        periodsArray.forEach(period => {
            const summary = financeData.getPeriodSummary(period.name);
            html += `<tr>
                <td><strong>${summary.periodName}</strong></td>
                <td class="text-right text-success">${this.formatCurrency(summary.income)}</td>
                <td class="text-right text-danger">${this.formatCurrency(summary.totalExpenses)}</td>
                <td class="text-right">${this.formatCurrency(summary.totalDebts)}</td>
                <td class="text-right ${summary.balance >= 0 ? 'text-success' : 'text-danger'} font-bold">
                    ${this.formatCurrency(summary.balance)}
                </td>
            </tr>`;
        });

        html += '</tbody></table></div>';
        return html;
    }

    renderDebtsTable(debts) {
        if (debts.length === 0) {
            return '<p class="text-muted">No hay deudas registradas</p>';
        }

        let html = '<div class="table-container"><table><thead><tr>';
        html += '<th>Acreedor</th><th class="text-right">Deuda Inicial</th><th class="text-right">Saldo Actual</th><th class="text-right">% Pagado</th><th>Progreso</th>';
        html += '</tr></thead><tbody>';

        debts.slice(0, 5).forEach(debt => {
            const paid = debt.initialAmount - debt.currentAmount;
            const percentage = Math.round((paid / debt.initialAmount) * 100);

            html += `<tr>
                <td><strong>${debt.name}</strong></td>
                <td class="text-right">${this.formatCurrency(debt.initialAmount)}</td>
                <td class="text-right">${this.formatCurrency(debt.currentAmount)}</td>
                <td class="text-right">${percentage}%</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${percentage}%"></div>
                    </div>
                </td>
            </tr>`;
        });

        html += '</tbody></table></div>';
        return html;
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value || 0);
    }

    formatCurrencyShort(value) {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
            return (value / 1000).toFixed(0) + 'K';
        }
        return value;
    }
}
