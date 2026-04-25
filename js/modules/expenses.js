/**
 * Módulo Gastos Hormiga
 */
class Expenses {
    constructor(container) {
        this.container = container;
        this.charts = {};
    }

    render() {
        const expenses = financeData.getExpenses();
        const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
        const monthlyTarget = 500000;
        const pct = Math.min(Math.round((total / monthlyTarget) * 100), 100);

        this.container.innerHTML = `
            <div class="flex-between mb-lg">
                <h1>Gastos Hormiga</h1>
                <button class="btn btn-primary" onclick="app.currentModule.showAddModal()">+ Nuevo Gasto</button>
            </div>

            <div class="grid grid-3 mb-md">
                <div class="kpi red">
                    <div class="kpi-label">Total Este Mes</div>
                    <div class="kpi-value">${fmt(total)}</div>
                </div>
                <div class="kpi blue">
                    <div class="kpi-label">Meta Mensual</div>
                    <div class="kpi-value">${fmt(monthlyTarget)}</div>
                </div>
                <div class="kpi ${total <= monthlyTarget ? 'green' : 'orange'}">
                    <div class="kpi-label">Disponible</div>
                    <div class="kpi-value">${fmt(monthlyTarget - total)}</div>
                </div>
            </div>

            <div class="section">
                <div class="section-header" onclick="toggleSection(this)">
                    <h3>🎯 Progreso (${pct}%)</h3>
                    <span class="section-toggle">▾</span>
                </div>
                <div class="section-body">
                    <div class="progress-bar" style="height:10px;margin-bottom:8px">
                        <div class="progress ${total > monthlyTarget ? 'red' : total > monthlyTarget * 0.7 ? 'orange' : 'green'}" style="width:${pct}%"></div>
                    </div>
                    <p class="text-muted" style="font-size:0.8rem">${pct}% de la meta consumido</p>
                </div>
            </div>

            <div class="section">
                <div class="section-header" onclick="toggleSection(this)">
                    <h3>📊 Por Categoría</h3>
                    <span class="section-toggle">▾</span>
                </div>
                <div class="section-body">
                    <div class="chart-container"><canvas id="expChart"></canvas></div>
                </div>
            </div>

            <div class="section">
                <div class="section-header" onclick="toggleSection(this)">
                    <h3>🐜 Historial (${expenses.length})</h3>
                    <span class="section-toggle">▾</span>
                </div>
                <div class="section-body" style="padding:0 var(--spacing-sm) var(--spacing-sm)">
                    ${this.renderTable(expenses)}
                </div>
            </div>

            <div id="expenseModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">Nuevo Gasto</div>
                    <form onsubmit="app.currentModule.saveExpense(event)">
                        <div class="form-group">
                            <label>Categoría *</label>
                            <select id="expCat" required>
                                <option value="">Selecciona...</option>
                                ${CATEGORIAS.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Monto *</label>
                            <input type="number" id="expAmount" required>
                        </div>
                        <div class="form-group">
                            <label>Descripción</label>
                            <input type="text" id="expDesc" placeholder="Detalle...">
                        </div>
                        <div class="form-group">
                            <label>Fecha</label>
                            <input type="date" id="expDate">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="app.currentModule.closeModal()">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        setTimeout(() => this.renderChart(expenses), 50);
    }

    renderTable(expenses) {
        if (!expenses.length) return '<div style="padding:var(--spacing-lg)"><p class="text-muted">Sin gastos registrados</p></div>';
        const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
        let html = '<div class="table-container"><table><thead><tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th class="text-right">Monto</th><th></th></tr></thead><tbody>';
        sorted.forEach(e => {
            html += `<tr>
                <td>${new Date(e.date || Date.now()).toLocaleDateString('es-CO')}</td>
                <td>${e.category}</td>
                <td>${e.description || '—'}</td>
                <td class="text-right font-bold">${fmt(e.amount)}</td>
                <td><button class="btn-icon danger" onclick="app.currentModule.deleteExpense(${e.id})">✕</button></td>
            </tr>`;
        });
        html += '</tbody></table></div>';
        return html;
    }

    showAddModal() {
        document.getElementById('expenseModal').classList.add('active');
        document.getElementById('expDate').value = new Date().toISOString().split('T')[0];
    }
    closeModal() { document.getElementById('expenseModal').classList.remove('active'); }

    saveExpense(event) {
        event.preventDefault();
        const category = document.getElementById('expCat').value;
        const amount = parseFloat(document.getElementById('expAmount').value);
        const description = document.getElementById('expDesc').value;
        const date = document.getElementById('expDate').value;
        if (!category || !amount) { showToast('Completa categoría y monto', 'error'); return; }
        financeData.addExpense({ category, amount, description, date: date || new Date().toISOString().split('T')[0] });
        this.closeModal();
        this.render();
        showToast('Gasto registrado', 'success');
    }

    deleteExpense(id) {
        if (!confirm('¿Eliminar?')) return;
        financeData.data.expenses.items = financeData.getExpenses().filter(e => e.id !== id);
        financeData.saveData();
        this.render();
        showToast('Eliminado', 'warning');
    }

    renderChart(expenses) {
        const ctx = document.getElementById('expChart');
        if (!ctx || !expenses.length) return;
        if (this.charts.exp) this.charts.exp.destroy();
        const cats = {};
        expenses.forEach(e => { cats[e.category || 'Otro'] = (cats[e.category || 'Otro'] || 0) + (e.amount || 0); });
        const colors = ['#3b82f6','#8b5cf6','#ec4899','#f97316','#10b981','#06b6d4','#ef4444','#f59e0b'];
        this.charts.exp = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(cats),
                datasets: [{ data: Object.values(cats), backgroundColor: colors.slice(0, Object.keys(cats).length), borderColor: '#1e293b', borderWidth: 2 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 10 } } }
            }
        });
    }
}
