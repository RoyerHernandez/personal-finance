/**
 * Módulo Deudas y Créditos
 */

class Debts {
    constructor(container) {
        this.container = container;
        this.chartInstances = {};
    }

    render() {
        const debts = financeData.getDebts();
        const totalDebt = financeData.getTotalDebt();

        this.container.innerHTML = `
            <div class="debts">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                    <h1>💳 Deudas y Créditos</h1>
                    <button class="btn btn-primary" onclick="app.currentModule.showCreateDebtModal()">
                        + Nueva Deuda
                    </button>
                </div>

                <!-- KPI de Deuda Total -->
                <div class="grid grid-3">
                    <div class="kpi danger">
                        <div class="kpi-label">Deuda Total</div>
                        <div class="kpi-value">${this.formatCurrency(totalDebt)}</div>
                    </div>
                    <div class="kpi">
                        <div class="kpi-label">Cantidad de Deudas</div>
                        <div class="kpi-value">${debts.length}</div>
                    </div>
                    <div class="kpi">
                        <div class="kpi-label">Pago Promedio Mensual</div>
                        <div class="kpi-value">${this.formatCurrency(debts.reduce((sum, d) => sum + (d.monthlyPayment || 0), 0))}</div>
                    </div>
                </div>

                <!-- Gráfico de Deudas -->
                <div class="card">
                    <div class="card-header">
                        <h3>Distribución de Deudas</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="debtsDistribution"></canvas>
                    </div>
                </div>

                <!-- Tabla de Deudas -->
                <div class="card">
                    <div class="card-header">
                        <h3>Detalles de Deudas</h3>
                    </div>
                    ${this.renderDebtsTable(debts)}
                </div>

                <!-- Modal para crear deuda -->
                <div id="debtModal" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">Nueva Deuda</div>
                        <form onsubmit="app.currentModule.saveDebt(event)">
                            <div class="form-group">
                                <label>Nombre del Acreedor *</label>
                                <input type="text" id="debtName" placeholder="Ej: Bancolombia" required>
                            </div>
                            <div class="form-group">
                                <label>Monto Inicial *</label>
                                <input type="number" id="debtInitialAmount" placeholder="0" required>
                            </div>
                            <div class="form-group">
                                <label>Saldo Actual *</label>
                                <input type="number" id="debtCurrentAmount" placeholder="0" required>
                            </div>
                            <div class="form-group">
                                <label>Pago Mensual *</label>
                                <input type="number" id="debtMonthlyPayment" placeholder="0" required>
                            </div>
                            <div class="form-group">
                                <label>Fecha de inicio</label>
                                <input type="date" id="debtStartDate">
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" onclick="app.currentModule.closeModal()">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.renderDebtsChart(debts);
        }, 100);
    }

    renderDebtsChart(debts) {
        const ctx = document.getElementById('debtsDistribution');
        if (this.chartInstances.debtsDistribution) {
            this.chartInstances.debtsDistribution.destroy();
        }

        const labels = debts.map(d => d.name);
        const data = debts.map(d => d.currentAmount);
        const colors = [
            'rgba(239, 68, 68, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(37, 99, 235, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(59, 130, 246, 0.8)'
        ];

        this.chartInstances.debtsDistribution = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Saldo Actual',
                    data,
                    backgroundColor: colors.slice(0, data.length),
                    borderColor: colors.slice(0, data.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        ticks: {
                            callback: (value) => this.formatCurrencyShort(value)
                        }
                    }
                }
            }
        });
    }

    renderDebtsTable(debts) {
        if (debts.length === 0) {
            return '<p class="text-muted">No hay deudas registradas</p>';
        }

        let html = '<div class="table-container"><table><thead><tr>';
        html += '<th>Acreedor</th><th class="text-right">Inicial</th><th class="text-right">Saldo</th><th class="text-right">% Pagado</th><th class="text-right">Cuota Mensual</th><th>Progreso</th><th>Acciones</th>';
        html += '</tr></thead><tbody>';

        debts.forEach(debt => {
            const paid = debt.initialAmount - debt.currentAmount;
            const percentage = Math.round((paid / debt.initialAmount) * 100);

            html += `<tr>
                <td><strong>${debt.name}</strong></td>
                <td class="text-right">${this.formatCurrency(debt.initialAmount)}</td>
                <td class="text-right">${this.formatCurrency(debt.currentAmount)}</td>
                <td class="text-right">${percentage}%</td>
                <td class="text-right">${this.formatCurrency(debt.monthlyPayment)}</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${percentage}%"></div>
                    </div>
                </td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="app.currentModule.editDebt(${debt.id})">Editar</button>
                    <button class="btn btn-danger btn-small" onclick="app.currentModule.deleteDebt(${debt.id})">Eliminar</button>
                </td>
            </tr>`;
        });

        html += '</tbody></table></div>';
        return html;
    }

    showCreateDebtModal() {
        document.getElementById('debtModal').classList.add('active');
        document.getElementById('debtName').value = '';
        document.getElementById('debtInitialAmount').value = '';
        document.getElementById('debtCurrentAmount').value = '';
        document.getElementById('debtMonthlyPayment').value = '';
        document.getElementById('debtStartDate').value = new Date().toISOString().split('T')[0];
    }

    editDebt(debtId) {
        const debt = financeData.getDebts().find(d => d.id === debtId);
        if (!debt) return;

        document.getElementById('debtModal').classList.add('active');
        document.getElementById('debtName').value = debt.name;
        document.getElementById('debtInitialAmount').value = debt.initialAmount;
        document.getElementById('debtCurrentAmount').value = debt.currentAmount;
        document.getElementById('debtMonthlyPayment').value = debt.monthlyPayment;
        document.getElementById('debtStartDate').value = debt.startDate;

        this.currentEditingDebtId = debtId;
    }

    saveDebt(event) {
        event.preventDefault();
        const name = document.getElementById('debtName').value.trim();
        const initialAmount = parseFloat(document.getElementById('debtInitialAmount').value);
        const currentAmount = parseFloat(document.getElementById('debtCurrentAmount').value);
        const monthlyPayment = parseFloat(document.getElementById('debtMonthlyPayment').value);
        const startDate = document.getElementById('debtStartDate').value;

        if (!name || !initialAmount || !currentAmount || !monthlyPayment) {
            alert('Completa todos los campos requeridos');
            return;
        }

        const debtData = {
            name,
            initialAmount,
            currentAmount,
            monthlyPayment,
            startDate: startDate || new Date().toISOString().split('T')[0]
        };

        if (this.currentEditingDebtId) {
            financeData.updateDebt(this.currentEditingDebtId, debtData);
            this.currentEditingDebtId = null;
        } else {
            const debts = financeData.getDebts();
            const newId = Math.max(...debts.map(d => d.id), 0) + 1;
            debts.push({ id: newId, ...debtData });
            financeData.data.debts = debts;
            financeData.saveData();
        }

        this.closeModal();
        this.render();
    }

    deleteDebt(debtId) {
        if (!confirm('¿Eliminar esta deuda?')) return;
        const debts = financeData.getDebts();
        financeData.data.debts = debts.filter(d => d.id !== debtId);
        financeData.saveData();
        this.render();
    }

    closeModal() {
        document.getElementById('debtModal').classList.remove('active');
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
