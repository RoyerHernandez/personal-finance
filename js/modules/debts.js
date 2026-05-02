/**
 * Módulo Deudas y Créditos - Estilo producto financiero
 */
class Debts {
    constructor(container) {
        this.container = container;
        this.charts = {};
    }

    render() {
        const debts = financeData.getDebts();
        const totalDebt = financeData.getTotalDebt();
        const totalInitial = debts.reduce((s, d) => s + (d.initialAmount || 0), 0);
        const totalPaid = totalInitial - totalDebt;

        this.container.innerHTML = `
            <div class="page-content">
            <div class="flex-between mb-lg">
                <h1>Deudas y Creditos</h1>
                <button class="btn btn-primary" onclick="app.currentModule.addDebt()">+ Nueva Deuda</button>
            </div>

            <div class="grid grid-3 mb-md">
                <div class="kpi orange">
                    <div class="kpi-label">Deuda Total</div>
                    <div class="kpi-value">${fmt(totalDebt)}</div>
                </div>
                <div class="kpi green">
                    <div class="kpi-label">Total Pagado</div>
                    <div class="kpi-value">${fmt(totalPaid)}</div>
                </div>
                <div class="kpi blue">
                    <div class="kpi-label"># Deudas</div>
                    <div class="kpi-value">${debts.length}</div>
                </div>
            </div>

            <div class="section">
                <div class="section-header" onclick="toggleSection(this)">
                    <h3>📊 Distribución</h3>
                    <span class="section-toggle">▾</span>
                </div>
                <div class="section-body">
                    <div class="chart-container"><canvas id="debtChart" width="400" height="260"></canvas></div>
                </div>
            </div>

            <div class="section">
                <div class="section-header" onclick="toggleSection(this)">
                    <h3>💳 Mis Obligaciones (${debts.length})</h3>
                    <span class="section-toggle">▾</span>
                </div>
                <div class="section-body" style="padding:0">
                    ${debts.map(d => this.renderDebtCard(d)).join('')}
                </div>
            </div>
            </div>
        `;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => this.renderChart(debts));
        });
        this.startGuide();
    }

    startGuide() {
        requestAnimationFrame(() => {
            Guide.start('debts', [
                { target: '.btn.btn-primary[onclick*="addDebt"]', text: 'Haz clic aqui para agregar una <strong>nueva deuda</strong>: nombre del acreedor y valor inicial.', arrow: 'top' },
                { target: '.product-card:first-child .product-info', text: 'Cada tarjeta muestra una deuda. Puedes <strong>editar el nombre</strong> directamente haciendo clic.', arrow: 'top' },
                { target: '.product-card:first-child input[type="number"]', text: 'Edita el <strong>valor inicial, saldo actual y cuota mensual</strong> directamente. Los cambios se guardan solos.', arrow: 'top' },
                { target: '.kpi.orange', text: 'Aqui ves tu <strong>deuda total actual</strong>. La barra de progreso muestra cuanto has pagado de cada deuda.', arrow: 'top' }
            ]);
        });
    }

    renderDebtCard(d) {
        const paid = d.initialAmount - d.currentAmount;
        const pct = d.initialAmount > 0 ? Math.round((paid / d.initialAmount) * 100) : 0;
        const color = pct > 66 ? 'green' : pct > 33 ? 'orange' : 'red';

        return `
        <div class="product-card" style="flex-wrap:wrap;gap:var(--spacing-sm)">
            <div class="product-info" style="min-width:180px">
                <div class="product-name">
                    <input class="inline-input" value="${d.name}" style="font-weight:600;padding:2px 4px"
                        onchange="app.currentModule.onEdit(${d.id},'name',this.value)">
                </div>
                <div class="product-detail" style="display:flex;align-items:center;gap:8px;margin-top:4px">
                    <span>${pct}% pagado</span>
                    <div class="progress-bar" style="width:80px">
                        <div class="progress ${color}" style="width:${pct}%"></div>
                    </div>
                </div>
            </div>
            <div style="display:flex;gap:var(--spacing-lg);align-items:center;flex-wrap:wrap">
                <div style="text-align:center">
                    <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase">Inicial</div>
                    <input class="inline-input text-center" type="number" value="${d.initialAmount}" style="width:130px;font-weight:600;font-size:0.85rem"
                        onchange="app.currentModule.onEditNum(${d.id},'initialAmount',this.value)">
                </div>
                <div style="text-align:center">
                    <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase">Saldo actual</div>
                    <input class="inline-input text-center text-danger" type="number" value="${d.currentAmount}" style="width:130px;font-weight:700;font-size:0.85rem"
                        onchange="app.currentModule.onEditNum(${d.id},'currentAmount',this.value)">
                </div>
                <div style="text-align:center">
                    <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase">Cuota mensual</div>
                    <input class="inline-input text-center" type="number" value="${d.monthlyPayment || 0}" style="width:130px;font-weight:600;font-size:0.85rem"
                        onchange="app.currentModule.onEditNum(${d.id},'monthlyPayment',this.value)">
                </div>
            </div>
            <div class="product-actions">
                <button class="btn-icon danger" onclick="app.currentModule.deleteDebt(${d.id})" title="Eliminar">✕</button>
            </div>
        </div>`;
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
            name, initialAmount: amount, currentAmount: amount,
            monthlyPayment: 0, startDate: new Date().toISOString().split('T')[0]
        });
        this.render();
        showToast('Deuda creada', 'success');
    }

    deleteDebt(id) {
        if (!confirm('¿Eliminar esta deuda?')) return;
        financeData.deleteDebt(id);
        this.render();
        showToast('Deuda eliminada', 'warning');
    }

    renderChart(debts) {
        const el = document.getElementById('debtChart');
        if (!el || !debts.length) return;
        if (this.charts.dist) this.charts.dist.destroy();

        const style = getComputedStyle(document.documentElement);
        const gridColor = style.getPropertyValue('--chart-grid').trim() || '#2E2E2E';
        const textColor = style.getPropertyValue('--chart-text').trim() || '#71717a';
        const colors = ['#ef4444','#f97316','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#f59e0b'];

        this.charts.dist = new Chart(el, {
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
                    x: { ticks: { color: textColor, callback: v => fmtShort(v) }, grid: { color: gridColor } },
                    y: { ticks: { color: textColor, font: { size: 11 } }, grid: { display: false } }
                }
            }
        });
    }
}
