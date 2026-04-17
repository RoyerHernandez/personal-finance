/**
 * Módulo Ingresos - Con edición inline
 */
class Income {
    constructor(container) {
        this.container = container;
        this.charts = {};
    }

    render() {
        const sources = financeData.getIncomeSources();
        const periods = Object.keys(financeData.getPeriods());
        const totalEstimado = sources.reduce((s, src) => s + (src.estimado || 0), 0);
        const totalReal = sources.reduce((s, src) => s + (src.real || 0), 0);

        this.container.innerHTML = `
            <div class="flex-between mb-lg">
                <h1>Ingresos</h1>
                <button class="btn btn-primary" onclick="app.currentModule.addSource()">+ Nueva Fuente</button>
            </div>

            <div class="grid grid-3">
                <div class="kpi green">
                    <div class="kpi-label">Total Estimado</div>
                    <div class="kpi-value">${fmt(totalEstimado)}</div>
                </div>
                <div class="kpi blue">
                    <div class="kpi-label">Total Real</div>
                    <div class="kpi-value">${fmt(totalReal)}</div>
                </div>
                <div class="kpi ${totalReal - totalEstimado >= 0 ? 'green' : 'red'}">
                    <div class="kpi-label">Diferencia</div>
                    <div class="kpi-value">${fmt(totalReal - totalEstimado)}</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><h3>Fuentes de Ingreso</h3></div>
                <div class="chart-container"><canvas id="incomeChart"></canvas></div>
            </div>

            <div class="card">
                <div class="card-header"><h3>Detalle</h3></div>
                <div class="table-container">
                    <table>
                        <thead><tr>
                            <th>Fuente</th>
                            <th>Frecuencia</th>
                            <th class="text-right">Estimado</th>
                            <th class="text-right">Real</th>
                            <th>Período</th>
                            <th class="text-right">Diferencia</th>
                            <th></th>
                        </tr></thead>
                        <tbody>
                            ${sources.map((src, i) => this.renderRow(src, i, periods)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        setTimeout(() => this.renderChart(sources), 50);
    }

    renderRow(src, idx, periods) {
        const diff = (src.real || 0) - (src.estimado || 0);
        return `<tr>
            <td><input class="inline-input" value="${src.name}" onchange="app.currentModule.onEdit(${idx}, 'name', this.value)"></td>
            <td>
                <select class="inline-select" onchange="app.currentModule.onEdit(${idx}, 'frequency', this.value)">
                    ${FRECUENCIAS.map(f => `<option value="${f}" ${src.frequency === f ? 'selected' : ''}>${f}</option>`).join('')}
                </select>
            </td>
            <td><input class="inline-input text-right" type="number" value="${src.estimado || 0}" onchange="app.currentModule.onEditNum(${idx}, 'estimado', this.value)"></td>
            <td><input class="inline-input text-right" type="number" value="${src.real || 0}" onchange="app.currentModule.onEditNum(${idx}, 'real', this.value)"></td>
            <td>
                <select class="inline-select" onchange="app.currentModule.onEdit(${idx}, 'period', this.value)">
                    <option value="">—</option>
                    ${periods.map(p => `<option value="${p}" ${src.period === p ? 'selected' : ''}>${p}</option>`).join('')}
                </select>
            </td>
            <td class="text-right font-bold ${diff >= 0 ? 'text-success' : 'text-danger'}">${fmt(diff)}</td>
            <td><button class="btn-icon danger" onclick="app.currentModule.deleteSource(${idx})" title="Eliminar">✕</button></td>
        </tr>`;
    }

    onEdit(idx, field, value) {
        const sources = financeData.getIncomeSources();
        if (sources[idx]) {
            sources[idx][field] = value;
            financeData.data.income.sources = sources;
            financeData.saveData();
            showToast('Guardado', 'success');
        }
    }

    onEditNum(idx, field, value) {
        const sources = financeData.getIncomeSources();
        if (sources[idx]) {
            sources[idx][field] = parseFloat(value) || 0;
            financeData.data.income.sources = sources;
            financeData.saveData();
            this.render();
            showToast('Guardado', 'success');
        }
    }

    addSource() {
        const name = prompt('Nombre de la fuente de ingreso:');
        if (!name) return;
        const sources = financeData.getIncomeSources();
        sources.push({ id: Date.now(), name, frequency: 'mensual', estimado: 0, real: 0, period: '' });
        financeData.data.income.sources = sources;
        financeData.saveData();
        this.render();
        showToast('Fuente creada', 'success');
    }

    deleteSource(idx) {
        if (!confirm('¿Eliminar esta fuente?')) return;
        const sources = financeData.getIncomeSources();
        sources.splice(idx, 1);
        financeData.data.income.sources = sources;
        financeData.saveData();
        this.render();
        showToast('Fuente eliminada', 'warning');
    }

    renderChart(sources) {
        const ctx = document.getElementById('incomeChart');
        if (!ctx) return;
        if (this.charts.income) this.charts.income.destroy();

        this.charts.income = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sources.map(s => s.name),
                datasets: [
                    { label: 'Estimado', data: sources.map(s => s.estimado || 0), backgroundColor: 'rgba(16,185,129,0.5)', borderRadius: 4 },
                    { label: 'Real', data: sources.map(s => s.real || 0), backgroundColor: 'rgba(59,130,246,0.7)', borderRadius: 4 }
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
}
