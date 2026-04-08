/**
 * Módulo Gastos Hormiga
 * Registro de gastos pequeños y seguimiento
 */

class Expenses {
    constructor(container) {
        this.container = container;
        this.chartInstances = {};
    }

    render() {
        const expenses = financeData.getExpenses();
        const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const monthlyTarget = 500000; // Meta mensual de gastos hormiga

        this.container.innerHTML = `
            <div class="expenses">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                    <h1>🐜 Gastos Hormiga</h1>
                    <button class="btn btn-primary" onclick="app.currentModule.showAddExpenseModal()">
                        + Nuevo Gasto
                    </button>
                </div>

                <!-- KPIs -->
                <div class="grid grid-3">
                    <div class="kpi">
                        <div class="kpi-label">Total Este Mes</div>
                        <div class="kpi-value">${this.formatCurrency(totalExpenses)}</div>
                    </div>
                    <div class="kpi">
                        <div class="kpi-label">Meta Mensual</div>
                        <div class="kpi-value">${this.formatCurrency(monthlyTarget)}</div>
                    </div>
                    <div class="kpi ${totalExpenses > monthlyTarget ? 'warning' : 'success'}">
                        <div class="kpi-label">Diferencia</div>
                        <div class="kpi-value">${this.formatCurrency(monthlyTarget - totalExpenses)}</div>
                    </div>
                </div>

                <!-- Barra de progreso -->
                <div class="card">
                    <h3>Progreso hacia Meta</h3>
                    <p class="text-muted">${Math.round((totalExpenses / monthlyTarget) * 100)}% de la meta</p>
                    <div class="progress-bar">
                        <div class="progress ${totalExpenses > monthlyTarget ? 'danger' : ''}" style="width: ${Math.min((totalExpenses / monthlyTarget) * 100, 100)}%"></div>
                    </div>
                </div>

                <!-- Gastos por Categoría -->
                <div class="card">
                    <h3>Gastos por Categoría</h3>
                    <div class="chart-container">
                        <canvas id="expensesChart"></canvas>
                    </div>
                </div>

                <!-- Tabla de Gastos -->
                <div class="card">
                    <h3>Historial de Gastos</h3>
                    ${this.renderExpensesTable(expenses)}
                </div>

                <!-- Modal para agregar gasto -->
                <div id="expenseModal" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">Nuevo Gasto</div>
                        <form onsubmit="app.currentModule.saveExpense(event)">
                            <div class="form-group">
                                <label>Categoría *</label>
                                <select id="expenseCategory" required>
                                    <option value="">Selecciona...</option>
                                    <option value="Comida">Comida</option>
                                    <option value="Transporte">Transporte</option>
                                    <option value="Entretenimiento">Entretenimiento</option>
                                    <option value="Salud">Salud</option>
                                    <option value="Compras">Compras</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Monto *</label>
                                <input type="number" id="expenseAmount" placeholder="0" required>
                            </div>
                            <div class="form-group">
                                <label>Descripción</label>
                                <textarea id="expenseDescription" placeholder="Detalles del gasto..." rows="3"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Fecha</label>
                                <input type="date" id="expenseDate">
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

        setTimeout(() => {
            this.renderExpensesChart(expenses);
        }, 100);
    }

    renderExpensesChart(expenses) {
        const ctx = document.getElementById('expensesChart');
        if (this.chartInstances.expenses) {
            this.chartInstances.expenses.destroy();
        }

        // Agrupar por categoría
        const categoryData = {};
        expenses.forEach(expense => {
            const category = expense.category || 'Sin categoría';
            categoryData[category] = (categoryData[category] || 0) + (expense.amount || 0);
        });

        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);
        const colors = [
            'rgba(59, 130, 246, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(99, 102, 241, 0.8)'
        ];

        this.chartInstances.expenses = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors.slice(0, data.length),
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderExpensesTable(expenses) {
        if (expenses.length === 0) {
            return '<p class="text-muted">Sin gastos registrados</p>';
        }

        // Ordena por fecha descendente
        const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

        let html = '<div class="table-container"><table><thead><tr>';
        html += '<th>Fecha</th><th>Categoría</th><th>Descripción</th><th class="text-right">Monto</th><th>Acciones</th>';
        html += '</tr></thead><tbody>';

        sorted.forEach((expense, idx) => {
            const date = new Date(expense.date || new Date()).toLocaleDateString('es-CO');
            html += `<tr>
                <td>${date}</td>
                <td>${expense.category || 'Sin categoría'}</td>
                <td>${expense.description || '-'}</td>
                <td class="text-right font-bold">${this.formatCurrency(expense.amount)}</td>
                <td>
                    <button class="btn btn-danger btn-small" onclick="app.currentModule.deleteExpense(${idx})">Eliminar</button>
                </td>
            </tr>`;
        });

        html += '</tbody></table></div>';
        return html;
    }

    showAddExpenseModal() {
        document.getElementById('expenseModal').classList.add('active');
        document.getElementById('expenseCategory').value = '';
        document.getElementById('expenseAmount').value = '';
        document.getElementById('expenseDescription').value = '';
        document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    }

    saveExpense(event) {
        event.preventDefault();
        const category = document.getElementById('expenseCategory').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const description = document.getElementById('expenseDescription').value;
        const date = document.getElementById('expenseDate').value;

        if (!category || !amount) {
            alert('Completa categoría y monto');
            return;
        }

        financeData.addExpense({
            category,
            amount,
            description,
            date: date || new Date().toISOString().split('T')[0]
        });

        this.closeModal();
        this.render();
    }

    deleteExpense(index) {
        if (!confirm('¿Eliminar este gasto?')) return;
        const expenses = financeData.getExpenses();
        expenses.splice(index, 1);
        financeData.data.expenses.items = expenses;
        financeData.saveData();
        this.render();
    }

    closeModal() {
        document.getElementById('expenseModal').classList.remove('active');
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value || 0);
    }
}
