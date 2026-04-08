/**
 * Módulo Períodos
 * Gestión flexible de períodos (quincenas, meses, etc.)
 */

class Periods {
    constructor(container) {
        this.container = container;
        this.editingPeriod = null;
        this.editingItem = null;
    }

    render() {
        const periods = financeData.getPeriods();

        this.container.innerHTML = `
            <div class="periods">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                    <h1>📅 Períodos</h1>
                    <button class="btn btn-primary" onclick="app.currentModule.showCreatePeriodModal()">
                        + Nuevo Período
                    </button>
                </div>

                <div id="periodsContainer" class="periods-list">
                    ${this.renderPeriods(periods)}
                </div>

                <!-- Modal para crear/editar período -->
                <div id="periodModal" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">Nuevo Período</div>
                        <form onsubmit="app.currentModule.savePeriod(event)">
                            <div class="form-group">
                                <label>Nombre del Período *</label>
                                <input type="text" id="periodName" placeholder="Ej: Enero, Quincena 1" required>
                            </div>
                            <div class="form-group">
                                <label>Ingresos esperados *</label>
                                <input type="number" id="periodIncome" placeholder="Ej: 2200000" required>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" onclick="app.currentModule.closeModal()">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Crear</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Modal para añadir/editar item -->
                <div id="itemModal" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">Añadir Item</div>
                        <form onsubmit="app.currentModule.saveItem(event)">
                            <div class="form-group">
                                <label>Nombre *</label>
                                <input type="text" id="itemName" placeholder="Ej: Cuota de la casa" required>
                            </div>
                            <div class="form-group">
                                <label>Tipo *</label>
                                <select id="itemType" required onchange="app.currentModule.updateItemTypeFields()">
                                    <option value="">Selecciona...</option>
                                    <option value="expense">Gasto</option>
                                    <option value="debt">Deuda</option>
                                </select>
                            </div>
                            <div class="form-group" id="amountGroup">
                                <label>Monto (para este período)</label>
                                <input type="number" id="itemAmount" placeholder="0">
                            </div>
                            <div class="form-group" id="debtGroup" style="display: none;">
                                <label>Saldo de Deuda</label>
                                <input type="number" id="itemDebt" placeholder="0">
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" onclick="app.currentModule.closeModal()">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Re-attachear event listeners
        this.attachEventListeners();
    }

    renderPeriods(periods) {
        const periodsArray = Object.values(periods);

        if (periodsArray.length === 0) {
            return '<div class="alert alert-info">No hay períodos. Crea uno para empezar.</div>';
        }

        let html = '';
        periodsArray.forEach(period => {
            const summary = financeData.getPeriodSummary(period.name);
            html += `
                <div class="card">
                    <div class="card-header">
                        <div>
                            <h3>${period.name}</h3>
                            <p class="text-muted">Ingresos: ${this.formatCurrency(period.income || 0)}</p>
                        </div>
                        <div style="display: flex; gap: var(--spacing-md);">
                            <button class="btn btn-secondary btn-small" onclick="app.currentModule.addItemToPeriod('${period.name}')">
                                + Item
                            </button>
                            <button class="btn btn-danger btn-small" onclick="app.currentModule.deletePeriod('${period.name}')">
                                Eliminar
                            </button>
                        </div>
                    </div>

                    <!-- Resumen del período -->
                    <div class="stats-row">
                        <div class="stat-item">
                            <div class="stat-label">Ingresos</div>
                            <div class="stat-value text-success">${this.formatCurrency(summary.income)}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Gastos</div>
                            <div class="stat-value text-danger">${this.formatCurrency(summary.totalExpenses)}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Deudas</div>
                            <div class="stat-value text-warning">${this.formatCurrency(summary.totalDebts)}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Balance</div>
                            <div class="stat-value ${summary.balance >= 0 ? 'text-success' : 'text-danger'}">${this.formatCurrency(summary.balance)}</div>
                        </div>
                    </div>

                    <!-- Tabla de items -->
                    ${this.renderItemsTable(period.name, period.items || [])}
                </div>
            `;
        });

        return html;
    }

    renderItemsTable(periodName, items) {
        if (items.length === 0) {
            return '<p class="text-muted mb-lg">Sin items. Añade uno.</p>';
        }

        let html = '<div class="table-container"><table><thead><tr>';
        html += '<th>Nombre</th><th>Tipo</th><th class="text-right">Monto</th><th class="text-right">Deuda</th><th>Acciones</th>';
        html += '</tr></thead><tbody>';

        items.forEach(item => {
            html += `<tr>
                <td>${item.name}</td>
                <td>
                    <span class="badge" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600; ${
                        item.type === 'expense' ? 'background: rgba(239, 68, 68, 0.2); color: rgb(239, 68, 68);' :
                        'background: rgba(249, 115, 22, 0.2); color: rgb(249, 115, 22);'
                    }">
                        ${item.type === 'expense' ? 'Gasto' : 'Deuda'}
                    </span>
                </td>
                <td class="text-right">${this.formatCurrency(item.amount || 0)}</td>
                <td class="text-right">${this.formatCurrency(item.debt || 0)}</td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="app.currentModule.editItem('${periodName}', ${item.id})">Editar</button>
                    <button class="btn btn-danger btn-small" onclick="app.currentModule.deleteItem('${periodName}', ${item.id})">Borrar</button>
                </td>
            </tr>`;
        });

        html += '</tbody></table></div>';
        return html;
    }

    showCreatePeriodModal() {
        document.getElementById('periodModal').classList.add('active');
        document.getElementById('periodName').value = '';
        document.getElementById('periodIncome').value = '';
        this.editingPeriod = null;
    }

    savePeriod(event) {
        event.preventDefault();
        const name = document.getElementById('periodName').value.trim();
        const income = parseFloat(document.getElementById('periodIncome').value);

        if (!name || !income) {
            alert('Completa todos los campos');
            return;
        }

        financeData.setPeriod(name, {
            income,
            items: []
        });

        this.closeModal();
        this.render();
    }

    addItemToPeriod(periodName) {
        this.editingPeriod = periodName;
        this.editingItem = null;
        document.getElementById('itemModal').classList.add('active');
        document.getElementById('itemName').value = '';
        document.getElementById('itemType').value = '';
        document.getElementById('itemAmount').value = '';
        document.getElementById('itemDebt').value = '';
    }

    editItem(periodName, itemId) {
        const period = financeData.getPeriod(periodName);
        const item = period.items.find(i => i.id === itemId);

        if (!item) return;

        this.editingPeriod = periodName;
        this.editingItem = item;

        document.getElementById('itemModal').classList.add('active');
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemType').value = item.type;
        document.getElementById('itemAmount').value = item.amount || 0;
        document.getElementById('itemDebt').value = item.debt || 0;

        this.updateItemTypeFields();
    }

    updateItemTypeFields() {
        const type = document.getElementById('itemType').value;
        document.getElementById('debtGroup').style.display = type === 'debt' ? 'block' : 'none';
        document.getElementById('amountGroup').style.display = type === 'expense' ? 'block' : 'none';
    }

    saveItem(event) {
        event.preventDefault();
        const name = document.getElementById('itemName').value.trim();
        const type = document.getElementById('itemType').value;
        const amount = parseFloat(document.getElementById('itemAmount').value) || 0;
        const debt = parseFloat(document.getElementById('itemDebt').value) || 0;

        if (!name || !type) {
            alert('Completa los campos requeridos');
            return;
        }

        const itemData = {
            name,
            type,
            amount: type === 'expense' ? amount : 0,
            debt: type === 'debt' ? debt : 0
        };

        if (this.editingItem) {
            financeData.updateItemInPeriod(this.editingPeriod, this.editingItem.id, itemData);
        } else {
            financeData.addItemToPeriod(this.editingPeriod, itemData);
        }

        this.closeModal();
        this.render();
    }

    deleteItem(periodName, itemId) {
        if (!confirm('¿Eliminar este item?')) return;
        financeData.deleteItemFromPeriod(periodName, itemId);
        this.render();
    }

    deletePeriod(periodName) {
        if (!confirm(`¿Eliminar el período "${periodName}"?`)) return;
        financeData.deletePeriod(periodName);
        this.render();
    }

    closeModal() {
        document.getElementById('periodModal').classList.remove('active');
        document.getElementById('itemModal').classList.remove('active');
    }

    attachEventListeners() {
        // Los event listeners ya están en el HTML con onclick
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value || 0);
    }
}
