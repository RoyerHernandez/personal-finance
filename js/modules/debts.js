/**
 * Módulo Deudas y Créditos - Fuente única con edición inline
 */
class Debts {
    constructor(container) {
        this.container = container;
        this.charts = {};
    }

    render() {
        const debts = financeData.getDebts();
        const totalDebt = financeData.getTotalDebt();
        const totalPaid = debts.reduce((s, d) => s + (d.initialAmount - d.currentAmount), 0);

        this.container.innerHTML = `
            <div class="flex-between mb-lg">
                <h1>Deudas y Créditos</h1>
                <button class="btn btn-primary" onclick="app.currentModule.addDebt()">+ Nueva Deuda</button>
            </div>

            <div class="grid grid-3">
                <div class="kpi orange">
                    <div class="kpi-label">Deuda Total Actual</div>
                    <div class="kpi-value">${fmt(totalDebt)}</div>
                </div>
                <div class="kpi green">
                    <div class="kpi-label">Total Pagado</div>
                    <div class="kpi-value">${fmt(totalPaid)}</div>
                </div>
                <div class="kpi blue">
                    <div class="kpi-label">Número de Deudas</div>
                    <div class="kpi-value">${debts.length}</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><h3>Distribución de Deudas</h3></div>
                <div class="chart-container"><canvas id="debtDistChart"></canvas></div>
            </div>

            <div class="card">
                <div class="card-header"><h3>Detalle de Deudas</h3></div>
                <div class="table-container">
                    <table>
                        <thead><tr>
                            <th>Acreedor</th>
                            <th class="text-right">Valor Inicial</th>
                            <th class="text-right">Saldo Actual</th>
                            <th class="text-right">Pagado</th>
                            <th>Progreso</th>
                            <th></th>
                        </tr></thead>
                        <tbody>
                            ${debts.map(d => this.renderDebtRow(d)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        setTimeout(() => this.renderChart(debts), 50);
    }

    renderDebtRow(d) {
        const paid = d.initialAmount - d.currentAmount;
        const pct = d.initialAmount > 0 ? Math.round((paid / d.initialAmount) * 100) : 0;
        const color = pct > 66 ? 'green' : pct > 33 ? 'orange' : 'red';

        return `<tr data-id="${d.id}">
            <td><input class="inline-input" value="${d.name}" onchange="app.currentModule.onEdit(${d.id}, 'name', this.value)"></td>
            <td><input class="inline-input text-right" type="number" value="${d.initialAmount}" onchange="app.currentModule.onEditNum(${d.id}, 'initialAmount', this.value)"></td>
            <td><input class="inline-input text-right" type="number" value="${d.currentAmount}" onchange="app.currentModule.onEditNum(${d.id}, 'currentAmount', this.value)"></td>
            <td class="text-right">${pct}%</td>
            <td style="min-width:120px"><div class="progress-bar"><div class="progress ${color}" style="width:${pct}%"></div></div></td>
            <td><button class="btn-icon danger" onclick="app.currentModule.deleteDebt(${d.id})" title="Eliminar">✕</button></td>
        </tr>`;
    }

    onEdit(id, field, value) {
        financeData.updateDebt(id, { [field]: value });
        showToast('Guardado', 'success');
    }

    onEditNum(id, field, value) {
        financeData.updateDebt(id, { [field]: parseFloat(value) || 0 });
        this.render();
        showToast('Guardado', 'success');
    }

    addDebt() {
        const name = prompt('Nombre del acreedor:');
        if (!name) return;
        const amount = parseFloat(prompt('Valor inicial:'));
        if (!amount || isNaN(amount)) return;

        financeData.addDebt({
            name,
            initialAmount: amount,
            currentAmount: amount,
            monthlyPayment: 0,
            startDate: new Date().toISOString().split('T')[0]
        });
        this.render();
        showToast('Deuda creada', 'success');
    }

    deleteDebt(id) {
        if (!confirm('¿Eliminar esta deuda? Se limpiarán las referencias en períodos.')) return;
        financeData.deleteDebt(id);
        this.render();
        showToast('Deuda eliminada', 'warning');
    }

    renderChart(debts) {
        const ctx = document.getElementById('debtDistChart');
        if (!ctx) return;
        if (this.charts.dist) this.charts.dist.destroy();

        const colors = ['#ef4444','#f97316','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#f59e0b'];

        this.charts.dist = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: debts.map(d => d.name),
                datasets: [{
                    label: 'Saldo Actual',
                    data: debts.map(d => d.currentAmount),
                    backgroundColor: colors.slice(0, debts.length),
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: '#64748b', callback: v => fmtShort(v) }, grid: { color: '#334155' } },
                    y: { ticks: { color: '#94a3b8' }, grid: { display: false } }
                }
            }
        });
    }
}
