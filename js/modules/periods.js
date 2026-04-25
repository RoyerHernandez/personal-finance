/**
 * Módulo Períodos - Edición inline completa
 */
class Periods {
    constructor(container) {
        this.container = container;
        this.selectedPeriod = Object.keys(financeData.getPeriods())[0] || null;
    }

    render() {
        const periods = financeData.getPeriods();
        const names = Object.keys(periods);

        this.container.innerHTML = `
            <div class="flex-between mb-lg">
                <h1>Períodos de Pago</h1>
                <button class="btn btn-primary" onclick="app.currentModule.showCreateModal()">+ Nuevo Período</button>
            </div>

            ${names.length ? `
                <div class="mb-md" style="display:flex;gap:var(--spacing-sm);align-items:center;flex-wrap:wrap;">
                    <select id="periodSelect" style="padding:8px 14px;background:var(--bg-surface);border:1px solid var(--border-color);color:var(--text-primary);border-radius:var(--radius);font-size:0.9rem;min-width:200px">
                        ${names.map(n => `<option value="${n}" ${n === this.selectedPeriod ? 'selected' : ''}>${n}</option>`).join('')}
                    </select>
                    ${this.selectedPeriod && periods[this.selectedPeriod] ? `
                        <span class="badge badge-${periods[this.selectedPeriod].type || 'mensual'}">${periods[this.selectedPeriod].type || 'mensual'}</span>
                        <button class="btn btn-danger btn-small" onclick="app.currentModule.deletePeriod()">Eliminar Período</button>
                    ` : ''}
                </div>
                ${this.selectedPeriod ? this.renderPeriodDetail(this.selectedPeriod) : ''}
            ` : '<div class="alert alert-info">No hay períodos. Crea uno para empezar.</div>'}

            <div id="periodModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">Nuevo Período</div>
                    <form onsubmit="app.currentModule.savePeriod(event)">
                        <div class="form-group">
                            <label>Nombre *</label>
                            <input type="text" id="periodName" placeholder="Ej: Mayo 2026" required>
                        </div>
                        <div class="form-group">
                            <label>Tipo</label>
                            <select id="periodType">
                                <option value="mensual">Mensual</option>
                                <option value="quincena">Quincena</option>
                                <option value="personalizado">Personalizado</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Fecha inicio</label>
                            <input type="date" id="periodStart">
                        </div>
                        <div class="form-group">
                            <label>Fecha fin</label>
                            <input type="date" id="periodEnd">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="app.currentModule.closeModal()">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Crear</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const sel = document.getElementById('periodSelect');
        if (sel) {
            sel.addEventListener('change', (e) => {
                this.selectedPeriod = e.target.value;
                this.render();
            });
        }
    }

    renderPeriodDetail(name) {
        const c = financeData.calcPeriodo(name);
        const p = financeData.getPeriod(name);
        const items = p.items || [];

        return `
            <div class="stats-row">
                <div class="stat-item">
                    <div class="stat-label">Ingresos</div>
                    <div class="stat-value text-success">${fmt(c.totIngreso)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Egresos</div>
                    <div class="stat-value text-danger">${fmt(c.totEgreso)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Saldo Disp.</div>
                    <div class="stat-value text-warning">${fmt(c.totSaldo)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Flujo Neto</div>
                    <div class="stat-value ${c.neto >= 0 ? 'text-success' : 'text-danger'}">${fmt(c.neto)}</div>
                </div>
            </div>

            <div class="section">
                <div class="section-header" onclick="toggleSection(this)">
                    <h3>Items del Período (${items.length})</h3>
                    <div class="section-header-right">
                        <button class="btn btn-primary btn-small" onclick="event.stopPropagation();app.currentModule.addItem()">+ Agregar</button>
                        <span class="section-toggle">▾</span>
                    </div>
                </div>
                <div class="section-body" style="padding:0 var(--spacing-sm) var(--spacing-sm)">
                    <div class="table-container">
                        <table>
                            <thead><tr>
                                <th>Concepto</th>
                                <th>Categoría</th>
                                <th class="text-right">Saldo</th>
                                <th class="text-right">Ingreso</th>
                                <th class="text-right">Egreso</th>
                                <th>Estado</th>
                                <th>Deuda</th>
                                <th></th>
                            </tr></thead>
                            <tbody>
                                ${items.map(item => this.renderItemRow(item)).join('')}
                            </tbody>
                            <tfoot>
                                <tr style="font-weight:700;border-top:2px solid var(--border-color)">
                                    <td colspan="2">Totales</td>
                                    <td class="text-right text-warning">${fmt(c.totSaldo)}</td>
                                    <td class="text-right text-success">${fmt(c.totIngreso)}</td>
                                    <td class="text-right text-danger">${fmt(c.totEgreso)}</td>
                                    <td colspan="3"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    renderItemRow(item) {
        const debt = item.debtId ? financeData.getDebtById(item.debtId) : null;
        const debtLabel = debt ? `${debt.name}` : '—';

        return `<tr data-id="${item.id}">
            <td><input class="inline-input" value="${item.concept}" onchange="app.currentModule.onEdit(${item.id},'concept',this.value)"></td>
            <td>
                <select class="inline-select" onchange="app.currentModule.onEdit(${item.id},'category',this.value)">
                    ${CATEGORIAS.map(c => `<option value="${c}" ${item.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
            </td>
            <td><input class="inline-input text-right" type="number" value="${item.saldo || 0}" onchange="app.currentModule.onEditNum(${item.id},'saldo',this.value)"></td>
            <td><input class="inline-input text-right" type="number" value="${item.ingreso || 0}" onchange="app.currentModule.onEditNum(${item.id},'ingreso',this.value)"></td>
            <td><input class="inline-input text-right" type="number" value="${item.egreso || 0}" onchange="app.currentModule.onEditNum(${item.id},'egreso',this.value)"></td>
            <td>
                <select class="inline-select" onchange="app.currentModule.onEdit(${item.id},'estado',this.value)">
                    ${ESTADOS.map(e => `<option value="${e}" ${item.estado === e ? 'selected' : ''}>${e}</option>`).join('')}
                </select>
            </td>
            <td style="font-size:0.72rem;color:var(--text-muted);max-width:100px;overflow:hidden;text-overflow:ellipsis" title="${debtLabel}">${debtLabel}</td>
            <td><button class="btn-icon danger" onclick="app.currentModule.deleteItem(${item.id})" title="Eliminar">✕</button></td>
        </tr>`;
    }

    onEdit(itemId, field, value) {
        financeData.updateItemInPeriod(this.selectedPeriod, itemId, { [field]: value });
        showToast('Guardado', 'success');
    }

    onEditNum(itemId, field, value) {
        financeData.updateItemInPeriod(this.selectedPeriod, itemId, { [field]: parseFloat(value) || 0 });
        this.render();
        showToast('Guardado', 'success');
    }

    addItem() {
        if (!this.selectedPeriod) return;
        financeData.addItemToPeriod(this.selectedPeriod, {
            concept: 'Nuevo item', category: 'Otro',
            ingreso: 0, egreso: 0, saldo: 0,
            estado: 'pendiente', debtId: null
        });
        this.render();
        showToast('Item agregado', 'info');
    }

    deleteItem(itemId) {
        if (!confirm('¿Eliminar este item?')) return;
        financeData.deleteItemFromPeriod(this.selectedPeriod, itemId);
        this.render();
        showToast('Item eliminado', 'warning');
    }

    deletePeriod() {
        if (!confirm(`¿Eliminar "${this.selectedPeriod}"?`)) return;
        financeData.deletePeriod(this.selectedPeriod);
        const names = Object.keys(financeData.getPeriods());
        this.selectedPeriod = names[0] || null;
        this.render();
        showToast('Período eliminado', 'warning');
    }

    showCreateModal() { document.getElementById('periodModal').classList.add('active'); }
    closeModal() { document.getElementById('periodModal').classList.remove('active'); }

    savePeriod(event) {
        event.preventDefault();
        const name = document.getElementById('periodName').value.trim();
        const type = document.getElementById('periodType').value;
        const startDate = document.getElementById('periodStart').value;
        const endDate = document.getElementById('periodEnd').value;
        if (!name) { showToast('Nombre requerido', 'error'); return; }
        financeData.setPeriod(name, { type, startDate, endDate, items: [] });
        this.selectedPeriod = name;
        this.closeModal();
        this.render();
        showToast('Período creado', 'success');
    }
}
