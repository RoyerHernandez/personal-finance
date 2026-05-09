/**
 * Dashboard - Vista general con diseno fintech
 */
class Dashboard {
    constructor(container) {
        this.container = container;
        this.charts = {};
    }

    render() {
        const s = financeData.getGeneralSummary();
        const debts = financeData.getDebts();
        const savings = financeData.getSavings();
        const dateStr = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
        const capitalDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

        this.container.innerHTML = `
            <!-- Top Section -->
            <div class="dash-top">
                <div class="dash-top-header">
                    <h1>Resumen Financiero</h1>
                    <div class="dash-top-header-right">
                        <span class="date-badge">${capitalDate}</span>
                    </div>
                </div>

                <!-- KPIs -->
                <div class="grid grid-5">
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
                        <div class="kpi-change">${debts.length} deudas</div>
                    </div>
                    <div class="kpi green">
                        <div class="kpi-label">Ahorros</div>
                        <div class="kpi-value">${fmt(s.totalSavings)}</div>
                        <div class="kpi-change">${savings.length} cuentas</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions">
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
                    <a class="quick-action" onclick="app.loadPage('savings')">
                        <span class="quick-action-icon">&#x1F3E6;</span>
                        Ahorros
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
                            <div class="chart-container">
                                <canvas id="chartEgresos" width="400" height="260"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="section">
                        <div class="section-header" onclick="toggleSection(this)">
                            <h3>&#x1F4C8; Ingresos vs Egresos</h3>
                            <span class="section-toggle">&#x25BE;</span>
                        </div>
                        <div class="section-body">
                            <div class="chart-container">
                                <canvas id="chartFlow" width="400" height="260"></canvas>
                            </div>
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
                        ${debts.length ? debts.map(d => {
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
                                    <div class="product-amount-label">Cuota</div>
                                    <div class="product-amount-value">${fmt(d.monthlyPayment)}</div>
                                </div>
                                <div class="product-amount">
                                    <div class="product-amount-label">Saldo</div>
                                    <div class="product-amount-value text-danger">${fmt(d.currentAmount)}</div>
                                </div>
                            </div>`;
                        }).join('') : '<div style="padding:var(--spacing-lg)"><p class="text-muted">Sin deudas registradas</p></div>'}
                    </div>
                </div>

                <!-- Savings -->
                ${savings.length ? `
                <div class="section">
                    <div class="section-header" onclick="toggleSection(this)">
                        <h3>&#x1F3E6; Mis Ahorros (${savings.length})</h3>
                        <div class="section-header-right">
                            <span class="debt-total-badge" style="background:rgba(16,185,129,0.15);color:#10b981">Total: ${fmt(s.totalSavings)}</span>
                            <span class="section-toggle">&#x25BE;</span>
                        </div>
                    </div>
                    <div class="section-body" style="padding:0">
                        ${savings.map(a => `
                            <div class="product-card">
                                <div class="product-info">
                                    <div class="product-name">${a.entity}</div>
                                    <div class="product-detail">${a.type}${a.rate ? ' · ' + a.rate + '% E.A.' : ''}</div>
                                </div>
                                <div class="product-amount">
                                    <div class="product-amount-label">Saldo</div>
                                    <div class="product-amount-value text-success">${fmt(a.balance)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.renderEgresosChart(s);
                this.renderFlowChart(s);
            });
        });
    }

    getChartColors() {
        const style = getComputedStyle(document.documentElement);
        return {
            grid: style.getPropertyValue('--chart-grid').trim() || '#2E2E2E',
            text: style.getPropertyValue('--chart-text').trim() || '#71717a',
            border: style.getPropertyValue('--bg-section').trim() || '#1A1A1A'
        };
    }

    renderEgresosChart(s) {
        const el = document.getElementById('chartEgresos');
        if (!el) return;
        if (this.charts.egresos) this.charts.egresos.destroy();

        const cc = this.getChartColors();
        const cats = {};

        // Debt payments by name
        financeData.getDebts().forEach(d => {
            if (d.monthlyPayment > 0) cats[d.name] = (cats[d.name] || 0) + d.monthlyPayment;
        });

        // Expense items by category
        financeData.getExpenses().forEach(e => {
            if (e.amount > 0) cats[e.category || 'Otro'] = (cats[e.category || 'Otro'] || 0) + e.amount;
        });

        if (Object.keys(cats).length === 0) return;

        const colors = ['#ef4444','#f59e0b','#3b82f6','#8b5cf6','#ec4899','#10b981','#06b6d4','#f97316','#6366f1','#14b8a6'];
        const isMobile = window.innerWidth < 768;

        this.charts.egresos = new Chart(el, {
            type: 'doughnut',
            data: {
                labels: Object.keys(cats),
                datasets: [{
                    data: Object.values(cats),
                    backgroundColor: colors.slice(0, Object.keys(cats).length),
                    borderColor: cc.border,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: isMobile ? 'bottom' : 'right',
                        labels: { color: cc.text, padding: 10, font: { size: isMobile ? 10 : 11 } }
                    }
                }
            }
        });
    }

    renderFlowChart(s) {
        const el = document.getElementById('chartFlow');
        if (!el) return;
        if (this.charts.flow) this.charts.flow.destroy();

        const cc = this.getChartColors();

        this.charts.flow = new Chart(el, {
            type: 'bar',
            data: {
                labels: ['Ingresos', 'Cuotas Deuda', 'Gastos', 'Ahorros'],
                datasets: [{
                    data: [s.totalIncome, s.totalDebtPayments, s.totalExpensesHormiga, s.totalSavings],
                    backgroundColor: [
                        'rgba(16,185,129,0.8)',
                        'rgba(239,68,68,0.8)',
                        'rgba(245,158,11,0.8)',
                        'rgba(59,130,246,0.8)'
                    ],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
