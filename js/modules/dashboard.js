/**
 * Dashboard - Vista general con diseño fintech
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

        this.container.innerHTML = `
            <div class="flex-between mb-lg">
                <h1>Resumen Financiero</h1>
                <span class="text-muted" style="font-size:0.8rem">${new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}</span>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
                <a class="quick-action" onclick="app.loadPage('periods')">
                    <span class="quick-action-icon">📅</span>
                    Ver Períodos
                </a>
                <a class="quick-action" onclick="app.loadPage('debts')">
                    <span class="quick-action-icon">💳</span>
                    Mis Deudas
                </a>
                <a class="quick-action" onclick="app.loadPage('expenses')">
                    <span class="quick-action-icon">🐜</span>
                    Registrar Gasto
                </a>
                <a class="quick-action" onclick="app.loadPage('income')">
                    <span class="quick-action-icon">💰</span>
                    Ingresos
                </a>
                <a class="quick-action" onclick="app.loadPage('settings')">
                    <span class="quick-action-icon">📤</span>
                    Exportar
                </a>
            </div>

            <!-- KPIs -->
            <div class="grid grid-4 mb-md">
                <div class="kpi green">
                    <div class="kpi-label">Ingresos del Mes</div>
                    <div class="kpi-value">${fmt(s.totalIncome)}</div>
                </div>
                <div class="kpi red">
                    <div class="kpi-label">Egresos del Mes</div>
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

            <!-- Charts -->
            <div class="grid grid-2">
                <div class="section">
                    <div class="section-header" onclick="toggleSection(this)">
                        <h3>📊 Distribución de Egresos</h3>
                        <span class="section-toggle">▾</span>
                    </div>
                    <div class="section-body">
                        <div class="chart-container"><canvas id="chartEgresos"></canvas></div>
                    </div>
                </div>
                <div class="section">
                    <div class="section-header" onclick="toggleSection(this)">
                        <h3>📈 Ingresos vs Egresos</h3>
                        <span class="section-toggle">▾</span>
                    </div>
                    <div class="section-body">
                        <div class="chart-container"><canvas id="chartFlow"></canvas></div>
                    </div>
                </div>
            </div>

            <!-- Mis Deudas (Bancolombia-style) -->
            <div class="section">
                <div class="section-header" onclick="toggleSection(this)">
                    <h3>💳 Mis Deudas (${debts.length})</h3>
                    <span class="section-toggle">▾</span>
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

            <!-- Períodos -->
            <div class="section">
                <div class="section-header" onclick="toggleSection(this)">
                    <h3>📅 Períodos (${periodNames.length})</h3>
                    <span class="section-toggle">▾</span>
                </div>
                <div class="section-body" style="padding:0">
                    ${periodNames.map(name => {
                        const c = financeData.calcPeriodo(name);
                        return `
                        <div class="product-card" style="cursor:pointer" onclick="app.loadPage('periods')">
                            <div class="product-info">
                                <div class="product-name">${name}</div>
                                <div class="product-detail">
                                    <span class="badge badge-${periods[name].type || 'mensual'}">${periods[name].type || 'mensual'}</span>
                                    Ingresos: ${fmt(c.totIngreso)} · Egresos: ${fmt(c.totEgreso)}
                                </div>
                            </div>
                            <div class="product-amount">
                                <div class="product-amount-label">Flujo neto</div>
                                <div class="product-amount-value ${c.neto >= 0 ? 'text-success' : 'text-danger'}">${fmt(c.neto)}</div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        `;

        setTimeout(() => {
            this.renderEgresosChart(periods);
            this.renderFlowChart(s);
        }, 50);
    }

    renderEgresosChart(periods) {
        const ctx = document.getElementById('chartEgresos');
        if (!ctx) return;
        if (this.charts.egresos) this.charts.egresos.destroy();

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
                datasets: [{ data: Object.values(cats), backgroundColor: colors.slice(0, Object.keys(cats).length), borderColor: '#1e293b', borderWidth: 2 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 10, font: { size: 10 } } } }
            }
        });
    }

    renderFlowChart(s) {
        const ctx = document.getElementById('chartFlow');
        if (!ctx) return;
        if (this.charts.flow) this.charts.flow.destroy();

        this.charts.flow = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Ingresos', 'Egresos', 'Saldo', 'Neto'],
                datasets: [{
                    data: [s.totalIncome, s.totalExpenses, s.totalSaldo, s.neto],
                    backgroundColor: ['rgba(16,185,129,0.7)', 'rgba(239,68,68,0.7)', 'rgba(245,158,11,0.7)', s.neto >= 0 ? 'rgba(59,130,246,0.7)' : 'rgba(239,68,68,0.5)'],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: '#64748b' }, grid: { color: '#334155' } },
                    y: { beginAtZero: true, ticks: { color: '#64748b', callback: v => fmtShort(v) }, grid: { color: '#334155' } }
                }
            }
        });
    }
}

/** Toggle collapsible sections */
function toggleSection(header) {
    header.parentElement.classList.toggle('collapsed');
}
