/**
 * Módulo Dashboard - KPIs, gráficos, resumen
 */
class Dashboard {
    constructor(container) {
        this.container = container;
        this.charts = {};
    }

    render() {
        const s = financeData.getGeneralSummary();
        const debts = financeData.getDebts();
        const periods = financeData.getPeriods();

        this.container.innerHTML = `
            <h1>Dashboard</h1>

            <div class="grid grid-4">
                <div class="kpi green">
                    <div class="kpi-label">Ingresos</div>
                    <div class="kpi-value">${fmt(s.totalIncome)}</div>
                </div>
                <div class="kpi red">
                    <div class="kpi-label">Egresos</div>
                    <div class="kpi-value">${fmt(s.totalExpenses)}</div>
                </div>
                <div class="kpi ${s.neto >= 0 ? 'blue' : 'red'}">
                    <div class="kpi-label">Flujo Neto</div>
                    <div class="kpi-value">${fmt(s.neto)}</div>
                </div>
                <div class="kpi orange">
                    <div class="kpi-label">Deuda Total</div>
                    <div class="kpi-value">${fmt(s.totalDebt)}</div>
                </div>
            </div>

            <div class="grid grid-2">
                <div class="card">
                    <div class="card-header"><h3>Distribución de Egresos</h3></div>
                    <div class="chart-container"><canvas id="chartEgresos"></canvas></div>
                </div>
                <div class="card">
                    <div class="card-header"><h3>Ingresos vs Egresos por Período</h3></div>
                    <div class="chart-container"><canvas id="chartPeriodos"></canvas></div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><h3>Resumen por Período</h3></div>
                ${this.renderPeriodsTable(periods)}
            </div>

            <div class="card">
                <div class="card-header"><h3>Top Deudas</h3></div>
                ${this.renderDebtsTable(debts)}
            </div>
        `;

        setTimeout(() => {
            this.renderEgresosChart(periods);
            this.renderPeriodosChart(periods);
        }, 50);
    }

    renderEgresosChart(periods) {
        const ctx = document.getElementById('chartEgresos');
        if (!ctx) return;
        if (this.charts.egresos) this.charts.egresos.destroy();

        // Agrupar egresos por categoría
        const cats = {};
        Object.values(periods).forEach(p => {
            (p.items || []).forEach(item => {
                if (item.egreso > 0) {
                    const cat = item.category || 'Otro';
                    cats[cat] = (cats[cat] || 0) + item.egreso;
                }
            });
        });

        const colors = ['#ef4444','#f59e0b','#3b82f6','#8b5cf6','#ec4899','#10b981','#06b6d4','#f97316','#6366f1','#14b8a6'];

        this.charts.egresos = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(cats),
                datasets: [{ data: Object.values(cats), backgroundColor: colors.slice(0, Object.keys(cats).length), borderColor: '#1e293b', borderWidth: 2 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, font: { size: 11 } } }
                }
            }
        });
    }

    renderPeriodosChart(periods) {
        const ctx = document.getElementById('chartPeriodos');
        if (!ctx) return;
        if (this.charts.periodos) this.charts.periodos.destroy();

        const names = Object.keys(periods);
        const ingresos = names.map(n => financeData.calcPeriodo(n).totIngreso);
        const egresos = names.map(n => financeData.calcPeriodo(n).totEgreso);

        this.charts.periodos = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: names,
                datasets: [
                    { label: 'Ingresos', data: ingresos, backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 4 },
                    { label: 'Egresos', data: egresos, backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 4 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#94a3b8' } } },
                scales: {
                    x: { ticks: { color: '#64748b' }, grid: { color: '#334155' } },
                    y: { beginAtZero: true, ticks: { color: '#64748b', callback: v => fmtShort(v) }, grid: { color: '#334155' } }
                }
            }
        });
    }

    renderPeriodsTable(periods) {
        const arr = Object.keys(periods);
        if (!arr.length) return '<p class="text-muted">Sin períodos configurados</p>';

        let html = '<div class="table-container"><table><thead><tr><th>Período</th><th>Tipo</th><th class="text-right">Ingresos</th><th class="text-right">Egresos</th><th class="text-right">Saldo</th><th class="text-right">Neto</th></tr></thead><tbody>';

        arr.forEach(name => {
            const p = periods[name];
            const c = financeData.calcPeriodo(name);
            html += `<tr>
                <td><strong>${name}</strong></td>
                <td><span class="badge badge-${p.type || 'quincena'}">${p.type || 'quincena'}</span></td>
                <td class="text-right text-success">${fmt(c.totIngreso)}</td>
                <td class="text-right text-danger">${fmt(c.totEgreso)}</td>
                <td class="text-right text-warning">${fmt(c.totSaldo)}</td>
                <td class="text-right font-bold ${c.neto >= 0 ? 'text-success' : 'text-danger'}">${fmt(c.neto)}</td>
            </tr>`;
        });

        html += '</tbody></table></div>';
        return html;
    }

    renderDebtsTable(debts) {
        if (!debts.length) return '<p class="text-muted">Sin deudas</p>';

        let html = '<div class="table-container"><table><thead><tr><th>Acreedor</th><th class="text-right">Deuda Inicial</th><th class="text-right">Saldo Actual</th><th class="text-right">Pagado</th><th>Progreso</th></tr></thead><tbody>';

        debts.forEach(d => {
            const paid = d.initialAmount - d.currentAmount;
            const pct = d.initialAmount > 0 ? Math.round((paid / d.initialAmount) * 100) : 0;
            const color = pct > 66 ? 'green' : pct > 33 ? 'orange' : 'red';

            html += `<tr>
                <td><strong>${d.name}</strong></td>
                <td class="text-right">${fmt(d.initialAmount)}</td>
                <td class="text-right">${fmt(d.currentAmount)}</td>
                <td class="text-right">${pct}%</td>
                <td><div class="progress-bar"><div class="progress ${color}" style="width:${pct}%"></div></div></td>
            </tr>`;
        });

        html += '</tbody></table></div>';
        return html;
    }
}
