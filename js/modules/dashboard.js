/**
 * Dashboard - Vista general con diseno fintech (Pencil design)
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
        const periodNames = Object.keys(periods);
        const dateStr = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
        const capitalDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

        this.container.innerHTML = `
            <!-- Top Section -->
            <div class="dash-top">
                <div class="dash-top-header">
                    <h1>Resumen Financiero</h1>
                    <div class="dash-top-header-right">
                        <span class="date-badge">${capitalDate}</span>
                        <button class="btn btn-primary btn-small" onclick="app.loadPage('settings')">Exportar</button>
                    </div>
                </div>

                <!-- KPIs -->
                <div class="grid grid-4">
                    <div class="kpi green">
                        <div class="kpi-label">Ingresos del Mes</div>
                        <div class="kpi-value">${fmt(s.totalIncome)}</div>
                        <div class="kpi-change" style="color:var(--success)">+8.2%</div>
                    </div>
                    <div class="kpi red">
                        <div class="kpi-label">Egresos del Mes</div>
                        <div class="kpi-value">${fmt(s.totalExpenses)}</div>
                        <div class="kpi-change" style="color:var(--danger)">Alto</div>
                    </div>
                    <div class="kpi ${s.neto >= 0 ? 'blue' : 'red'}">
                        <div class="kpi-label">Flujo Neto</div>
                        <div class="kpi-value">${fmt(s.neto)}</div>
                    </div>
                    <div class="kpi orange">
                        <div class="kpi-label">Deuda Total</div>
                        <div class="kpi-value">${fmt(s.totalDebt)}</div>
                        <div class="kpi-change">7 deudas</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions">
                    <a class="quick-action" onclick="app.loadPage('periods')">
                        <span class="quick-action-icon">&#x1F4C5;</span>
                        Periodos
                    </a>
                    <a class="quick-action" onclick="app.loadPage('debts')">
                        <span class="quick-action-icon">&#x1F4B3;</span>
                        Deudas
                    </a>
                    <a class="quick-action" onclick="app.loadPage('expenses')">
                        <span class="quick-action-icon">&#x1F41C;</span>
                        Gastos
                    </a>
                    <a class="quick-action" onclick="app.loadPage('income')">
                        <span class="quick-action-icon">&#x1F4B0;</span>
                        Ingresos
                    </a>
                    <a class="quick-action" onclick="app.loadPage('settings')">
                        <span class="quick-action-icon">&#x1F4E4;</span>
                        Exportar
                    </a>
                </div>
            </div>

            <!-- Bottom Section -->
            <div class="dash-bottom">
                <!-- Charts -->
                <div class="grid grid-2">
                    <div class="section">
                        <div class="section-header" onclick="toggleSection(this)">
                            <h3>&#x1F4CA; Distribucion de Egresos</h3>
                            <span class="section-toggle">&#x25BE;</span>
                        </div>
                        <div class="section-body">
                            <div class="chart-container"><canvas id="chartEgresos"></canvas></div>
                        </div>
                    </div>
                    <div class="section">
                        <div class="section-header" onclick="toggleSection(this)">
                            <h3>&#x1F4C8; Ingresos vs Egresos</h3>
                            <span class="section-toggle">&#x25BE;</span>
                        </div>
                        <div class="section-body">
                            <div class="chart-container"><canvas id="chartFlow"></canvas></div>
                        </div>
                    </div>
                </div>

                <!-- Debts -->
                <div class="section">
                    <div class="section-header" onclick="toggleSection(this)">
                        <h3>&#x1F4B3; Mis Deudas (${debts.length})</h3>
                        <div class="section-header-right">
                            <span class="debt-total-badge">Total: ${fmt(s.totalDebt)}</span>
                            <span class="section-toggle">&#x25BE;</span>
                        </div>
                    </div>
                    <div class="section-body" style="padding:0">
                        ${debts.map(d => {
                            const paid = d.initialAmount - d.currentAmount;
                            const pct = d.initialAmount > 0 ? Math.round((paid / d.initialAmount) * 100) : 0;
                            const color = pct > 66 ? 'green' : pct > 33 ? 'orange' : 'red';
                            return `
                            <div class="product-card">
                                <div class="product-info">
                                    <div class="product-name">${d.name}</div>
                                    <div class="product-detail">
                                        Pagado: ${pct}%
                                        <div class="progress-bar" style="width:100px;display:inline-block;vertical-align:middle;margin-left:8px">
                                            <div class="progress ${color}" style="width:${pct}%"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="product-amount">
                                    <div class="product-amount-label">Saldo actual</div>
                                    <div class="product-amount-value text-danger">${fmt(d.currentAmount)}</div>
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>

                <!-- Periods -->
                <div class="section">
                    <div class="section-header" onclick="toggleSection(this)">
                        <h3>&#x1F4C5; Periodos (${periodNames.length})</h3>
                        <span class="section-toggle">&#x25BE;</span>
                    </div>
                    <div class="section-body" style="padding:0">
                        <table>
                            <thead>
                                <tr>
                                    <th>Periodo</th>
                                    <th>Tipo</th>
                                    <th style="text-align:right">Ingresos</th>
                                    <th style="text-align:right">Egresos</th>
                                    <th style="text-align:right">Flujo Neto</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${periodNames.map(name => {
                                    const c = financeData.calcPeriodo(name);
                                    return `
                                    <tr style="cursor:pointer" onclick="app.loadPage('periods')">
                                        <td><strong>${name}</strong></td>
                                        <td><span class="badge badge-${periods[name].type || 'mensual'}">${periods[name].type || 'mensual'}</span></td>
                                        <td style="text-align:right" class="font-mono">${fmt(c.totIngreso)}</td>
                                        <td style="text-align:right" class="font-mono">${fmt(c.totEgreso)}</td>
                                        <td style="text-align:right" class="font-mono ${c.neto >= 0 ? 'text-success' : 'text-danger'}">${fmt(c.neto)}</td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.renderEgresosChart(periods);
            this.renderFlowChart(s);
        }, 50);
    }

    getChartColors() {
        const style = getComputedStyle(document.documentElement);
        return {
            grid: style.getPropertyValue('--chart-grid').trim(),
            text: style.getPropertyValue('--chart-text').trim(),
            border: style.getPropertyValue('--chart-border').trim()
        };
    }

    renderEgresosChart(periods) {
        const ctx = document.getElementById('chartEgresos');
        if (!ctx) return;
        if (this.charts.egresos) this.charts.egresos.destroy();

        const cc = this.getChartColors();
        const cats = {};
        Object.values(periods).forEach(p => {
            (p.items || []).forEach(item => {
                if (item.egreso > 0) {
                    cats[item.category || 'Otro'] = (cats[item.category || 'Otro'] || 0) + item.egreso;
                }
            });
        });

        const colors = ['#ef4444','#f59e0b','#3b82f6','#8b5cf6','#ec4899','#10b981','#06b6d4','#f97316','#6366f1','#14b8a6'];

        this.charts.egresos = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(cats),
                datasets: [{ data: Object.values(cats), backgroundColor: colors.slice(0, Object.keys(cats).length), borderColor: cc.border, borderWidth: 2 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { color: cc.text, padding: 12, font: { size: 11 } } } }
            }
        });
    }

    renderFlowChart(s) {
        const ctx = document.getElementById('chartFlow');
        if (!ctx) return;
        if (this.charts.flow) this.charts.flow.destroy();

        const cc = this.getChartColors();

        this.charts.flow = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Ingresos', 'Egresos', 'Saldo', 'Neto'],
                datasets: [{
                    data: [s.totalIncome, s.totalExpenses, s.totalSaldo, Math.abs(s.neto)],
                    backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(239,68,68,0.8)', 'rgba(245,158,11,0.8)', s.neto >= 0 ? 'rgba(59,130,246,0.8)' : 'rgba(239,68,68,0.5)'],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: cc.text }, grid: { color: cc.grid } },
                    y: { beginAtZero: true, ticks: { color: cc.text, callback: v => fmtShort(v) }, grid: { color: cc.grid } }
                }
            }
        });
    }
}

/** Toggle collapsible sections */
function toggleSection(header) {
    header.parentElement.classList.toggle('collapsed');
}
