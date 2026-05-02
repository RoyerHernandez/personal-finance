/**
 * Modulo Ingresos - Con guia de primera carga
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
        const diff = totalReal - totalEstimado;
        const showGuide = !localStorage.getItem('finanzas_guide_income_done');

        this.container.innerHTML = `
            <div class="page-content">
                <div class="flex-between mb-lg">
                    <h1>Ingresos</h1>
                    <button class="btn btn-primary" onclick="app.currentModule.addSource()">+ Nueva Fuente</button>
                </div>

                ${showGuide ? `
                <div class="onboarding" id="incomeGuide">
                    <div class="onboarding-title">
                        <span class="material-symbols-rounded">school</span>
                        Como agregar tus ingresos
                    </div>
                    <ol class="onboarding-steps">
                        <li>Haz clic en <strong>"+ Nueva Fuente"</strong> y escribe el nombre de tu ingreso (ej: <em>Salario Movistar</em>, <em>Freelance</em>, <em>Arriendo</em>)</li>
                        <li>En la columna <strong>Frecuencia</strong>, selecciona cada cuanto recibes ese ingreso: quincenal, mensual, semanal, etc.</li>
                        <li>En <strong>Estimado</strong> escribe cuanto esperas recibir (ej: tu salario bruto). Este es tu presupuesto planificado.</li>
                        <li>En <strong>Real</strong> escribe cuanto recibiste realmente. La <strong>Diferencia</strong> se calcula sola: verde si recibiste mas, rojo si fue menos.</li>
                        <li>En <strong>Periodo</strong> asocia este ingreso al periodo correspondiente (ej: <em>Abril 2026</em>). Esto actualiza el resumen del Dashboard automaticamente.</li>
                        <li>Repite para cada fuente de ingreso. Puedes editar cualquier campo directamente en la tabla.</li>
                    </ol>
                    <button class="onboarding-dismiss" onclick="app.currentModule.dismissGuide()">Entendido, no mostrar de nuevo</button>
                </div>
                ` : ''}

                <div class="grid grid-3 mb-md">
                    <div class="kpi green">
                        <div class="kpi-label">Total Estimado</div>
                        <div class="kpi-value">${fmt(totalEstimado)}</div>
                    </div>
                    <div class="kpi blue">
                        <div class="kpi-label">Total Real</div>
                        <div class="kpi-value">${fmt(totalReal)}</div>
                    </div>
                    <div class="kpi ${diff >= 0 ? 'green' : 'red'}">
                        <div class="kpi-label">Diferencia</div>
                        <div class="kpi-value">${fmt(diff)}</div>
                    </div>
                </div>

                <div class="section mb-md">
                    <div class="section-header" onclick="toggleSection(this)">
                        <h3><span class="material-symbols-rounded" style="font-size:20px;vertical-align:middle">bar_chart</span> Fuentes de Ingreso</h3>
                        <span class="section-toggle">&#x25BE;</span>
                    </div>
                    <div class="section-body">
                        ${sources.length
                            ? '<div class="chart-container"><canvas id="incomeChart" width="400" height="260"></canvas></div>'
                            : '<p class="text-muted" style="padding:24px 0;text-align:center">Agrega una fuente de ingreso para ver la grafica</p>'}
                    </div>
                </div>

                <div class="section">
                    <div class="section-header" onclick="toggleSection(this)">
                        <h3><span class="material-symbols-rounded" style="font-size:20px;vertical-align:middle">account_balance</span> Detalle de Fuentes (${sources.length})</h3>
                        <span class="section-toggle">&#x25BE;</span>
                    </div>
                    <div class="section-body" style="padding:0">
                        ${sources.length ? `
                        <div class="table-container">
                            <table style="min-width:600px">
                                <thead><tr>
                                    <th>Fuente</th>
                                    <th>Frecuencia</th>
                                    <th class="text-right">Estimado</th>
                                    <th class="text-right">Real</th>
                                    <th>Periodo</th>
                                    <th class="text-right">Diferencia</th>
                                    <th></th>
                                </tr></thead>
                                <tbody>
                                    ${sources.map((src, i) => this.renderRow(src, i, periods)).join('')}
                                </tbody>
                                <tfoot>
                                    <tr style="font-weight:700;border-top:2px solid var(--border-color)">
                                        <td colspan="2">Totales</td>
                                        <td class="text-right text-success">${fmt(totalEstimado)}</td>
                                        <td class="text-right text-success">${fmt(totalReal)}</td>
                                        <td></td>
                                        <td class="text-right ${diff >= 0 ? 'text-success' : 'text-danger'}">${fmt(diff)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        ` : '<div style="padding:var(--spacing-lg)"><p class="text-muted">Sin fuentes de ingreso. Haz clic en "+ Nueva Fuente" para empezar.</p></div>'}
                    </div>
                </div>
            </div>
        `;

        if (sources.length) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => this.renderChart(sources));
            });
        }
    }

    dismissGuide() {
        localStorage.setItem('finanzas_guide_income_done', '1');
        const el = document.getElementById('incomeGuide');
        if (el) el.remove();
    }

    renderRow(src, idx, periods) {
        const diff = (src.real || 0) - (src.estimado || 0);
        return `<tr>
            <td style="min-width:120px"><input class="inline-input" value="${src.name}" onchange="app.currentModule.onEdit(${idx},'name',this.value)"></td>
            <td>
                <select class="inline-select" onchange="app.currentModule.onEdit(${idx},'frequency',this.value)">
                    ${FRECUENCIAS.map(f => `<option value="${f}" ${src.frequency === f ? 'selected' : ''}>${f}</option>`).join('')}
                </select>
            </td>
            <td><input class="inline-input text-right" type="number" value="${src.estimado || 0}" onchange="app.currentModule.onEditNum(${idx},'estimado',this.value)"></td>
            <td><input class="inline-input text-right" type="number" value="${src.real || 0}" onchange="app.currentModule.onEditNum(${idx},'real',this.value)"></td>
            <td>
                <select class="inline-select" onchange="app.currentModule.onEdit(${idx},'period',this.value)">
                    <option value="">--</option>
                    ${periods.map(p => `<option value="${p}" ${src.period === p ? 'selected' : ''}>${p}</option>`).join('')}
                </select>
            </td>
            <td class="text-right font-bold ${diff >= 0 ? 'text-success' : 'text-danger'}">${fmt(diff)}</td>
            <td><button class="btn-icon danger" onclick="app.currentModule.deleteSource(${idx})" title="Eliminar"><span class="material-symbols-rounded" style="font-size:18px">close</span></button></td>
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
        if (!confirm('Eliminar esta fuente?')) return;
        const sources = financeData.getIncomeSources();
        sources.splice(idx, 1);
        financeData.data.income.sources = sources;
        financeData.saveData();
        this.render();
        showToast('Eliminada', 'warning');
    }

    renderChart(sources) {
        const el = document.getElementById('incomeChart');
        if (!el || !sources.length) return;
        if (this.charts.income) this.charts.income.destroy();

        const style = getComputedStyle(document.documentElement);
        const gridColor = style.getPropertyValue('--chart-grid').trim() || '#2E2E2E';
        const textColor = style.getPropertyValue('--chart-text').trim() || '#71717a';

        this.charts.income = new Chart(el, {
            type: 'bar',
            data: {
                labels: sources.map(s => s.name),
                datasets: [
                    { label: 'Estimado', data: sources.map(s => s.estimado || 0), backgroundColor: 'rgba(16,185,129,0.4)', borderRadius: 4 },
                    { label: 'Real', data: sources.map(s => s.real || 0), backgroundColor: 'rgba(59,130,246,0.7)', borderRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: textColor } } },
                scales: {
                    x: { ticks: { color: textColor }, grid: { color: gridColor } },
                    y: { beginAtZero: true, ticks: { color: textColor, callback: v => fmtShort(v) }, grid: { color: gridColor } }
                }
            }
        });
    }
}
