/**
 * Módulo Ahorros - Seguimiento de cuentas de ahorro
 */
class Savings {
    constructor(container) {
        this.container = container;
        this.charts = {};
    }

    render() {
        const accounts = financeData.getSavings();
        const total = financeData.getTotalSavings();
        const count = accounts.length;
        const highest = accounts.length ? Math.max(...accounts.map(a => a.balance || 0)) : 0;

        this.container.innerHTML = `
            <div class="page-content">
            <div class="flex-between mb-lg">
                <h1>Ahorros</h1>
                <button class="btn btn-primary" id="btnAddSaving" onclick="app.currentModule.addAccount()">+ Nueva Cuenta</button>
            </div>

            <div class="grid grid-3 mb-md">
                <div class="kpi green">
                    <div class="kpi-label">Total Ahorrado</div>
                    <div class="kpi-value">${fmt(total)}</div>
                </div>
                <div class="kpi blue">
                    <div class="kpi-label"># Cuentas</div>
                    <div class="kpi-value">${count}</div>
                </div>
                <div class="kpi orange">
                    <div class="kpi-label">Mayor Ahorro</div>
                    <div class="kpi-value">${fmt(highest)}</div>
                </div>
            </div>

            <div class="section mb-md">
                <div class="section-header" onclick="toggleSection(this)">
                    <h3><span class="material-symbols-rounded" style="font-size:20px;vertical-align:middle">donut_large</span> Distribucion</h3>
                    <span class="section-toggle">&#x25BE;</span>
                </div>
                <div class="section-body">
                    ${accounts.length
                        ? '<div class="chart-container"><canvas id="savingsChart" width="400" height="260"></canvas></div>'
                        : '<p class="text-muted" style="padding:24px 0;text-align:center">Agrega una cuenta de ahorro para ver la grafica</p>'}
                </div>
            </div>

            <div class="section">
                <div class="section-header" onclick="toggleSection(this)">
                    <h3><span class="material-symbols-rounded" style="font-size:20px;vertical-align:middle">savings</span> Mis Cuentas (${count})</h3>
                    <span class="section-toggle">&#x25BE;</span>
                </div>
                <div class="section-body" style="padding:0">
                    ${accounts.length ? `
                    <div class="table-container">
                        <table class="savings-table" style="min-width:600px">
                            <thead><tr>
                                <th>Entidad</th>
                                <th>Tipo</th>
                                <th class="text-right">Saldo</th>
                                <th class="text-right">Tasa % E.A.</th>
                                <th>Notas</th>
                                <th></th>
                            </tr></thead>
                            <tbody>
                                ${accounts.map(a => this.renderRow(a)).join('')}
                            </tbody>
                            <tfoot>
                                <tr style="font-weight:700;border-top:2px solid var(--border-color)">
                                    <td colspan="2">Total</td>
                                    <td class="text-right text-success">${fmt(total)}</td>
                                    <td colspan="3"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    ` : '<div style="padding:var(--spacing-lg)"><p class="text-muted">Sin cuentas de ahorro. Haz clic en "+ Nueva Cuenta" para empezar.</p></div>'}
                </div>
            </div>
            </div>
        `;

        if (accounts.length) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => this.renderChart(accounts));
            });
        }
        this.startGuide();
    }

    startGuide() {
        requestAnimationFrame(() => {
            Guide.start('savings', [
                { target: '#btnAddSaving', text: 'Agrega una <strong>cuenta de ahorro</strong>: banco, cooperativa, fintech o cualquier entidad donde tengas dinero guardado.', arrow: 'top' },
                { target: '.savings-table thead th:nth-child(2)', text: 'Selecciona el <strong>tipo de cuenta</strong>: cuenta de ahorros, CDT, fondo, programado, etc.', arrow: 'top' },
                { target: '.savings-table thead th:nth-child(3)', text: 'Ingresa el <strong>saldo actual</strong> de la cuenta. El total se calcula automaticamente.', arrow: 'top' },
                { target: '.kpi.green', text: 'Aqui ves el <strong>total de todos tus ahorros</strong> sumados.', arrow: 'top' }
            ]);
        });
    }

    renderRow(a) {
        const TIPOS = ['Cuenta de ahorros', 'CDT', 'Fondo', 'Ahorro programado', 'Billetera digital', 'Otro'];
        return `<tr>
            <td style="min-width:140px"><input class="inline-input" value="${a.entity}" style="font-weight:600" onchange="app.currentModule.onEdit(${a.id},'entity',this.value)"></td>
            <td>
                <select class="inline-select" onchange="app.currentModule.onEdit(${a.id},'type',this.value)">
                    ${TIPOS.map(t => `<option value="${t}" ${a.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
            </td>
            <td><input class="inline-input text-right text-success" type="number" value="${a.balance || 0}" style="font-weight:700" onchange="app.currentModule.onEditNum(${a.id},'balance',this.value)"></td>
            <td><input class="inline-input text-right" type="number" step="0.01" value="${a.rate || 0}" style="width:80px" onchange="app.currentModule.onEditNum(${a.id},'rate',this.value)"></td>
            <td><input class="inline-input" value="${a.notes || ''}" placeholder="..." onchange="app.currentModule.onEdit(${a.id},'notes',this.value)"></td>
            <td><button class="btn-icon danger" onclick="app.currentModule.deleteAccount(${a.id})" title="Eliminar"><span class="material-symbols-rounded" style="font-size:18px">close</span></button></td>
        </tr>`;
    }

    onEdit(id, field, value) {
        financeData.updateSaving(id, { [field]: value });
        showToast('Guardado', 'success');
    }

    onEditNum(id, field, value) {
        financeData.updateSaving(id, { [field]: parseFloat(value) || 0 });
        this.render();
        showToast('Guardado', 'success');
    }

    addAccount() {
        const entity = prompt('Nombre de la entidad (ej: Bancolombia, Littio, Cooperativa):');
        if (!entity) return;
        financeData.addSaving({
            entity, type: 'Cuenta de ahorros', balance: 0, rate: 0, notes: ''
        });
        this.render();
        showToast('Cuenta agregada', 'success');
    }

    deleteAccount(id) {
        if (!confirm('¿Eliminar esta cuenta de ahorro?')) return;
        financeData.deleteSaving(id);
        this.render();
        showToast('Cuenta eliminada', 'warning');
    }

    renderChart(accounts) {
        const el = document.getElementById('savingsChart');
        if (!el || !accounts.length) return;
        if (this.charts.dist) this.charts.dist.destroy();

        const style = getComputedStyle(document.documentElement);
        const textColor = style.getPropertyValue('--chart-text').trim() || '#71717a';
        const borderColor = style.getPropertyValue('--bg-section').trim() || '#1A1A1A';
        const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#f97316', '#14b8a6'];

        this.charts.dist = new Chart(el, {
            type: 'doughnut',
            data: {
                labels: accounts.map(a => a.entity),
                datasets: [{
                    data: accounts.map(a => a.balance || 0),
                    backgroundColor: colors.slice(0, accounts.length),
                    borderColor: borderColor,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: textColor, padding: 10 } }
                }
            }
        });
    }
}
