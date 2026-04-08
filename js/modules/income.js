/**
 * Módulo Ingresos
 * Registro de fuentes de ingreso y seguimiento
 */

class Income {
    constructor(container) {
        this.container = container;
        this.chartInstances = {};
    }

    render() {
        const sources = financeData.getIncomeSources();
        const totalIncome = sources.reduce((sum, s) => sum + (s.monthlyAmount || 0), 0);

        this.container.innerHTML = `
            <div class="income">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                    <h1>💰 Ingresos</h1>
                    <button class="btn btn-primary" onclick="app.currentModule.showAddSourceModal()">
                        + Nueva Fuente
                    </button>
                </div>

                <!-- KPI -->
                <div class="grid grid-2">
                    <div class="kpi positive">
                        <div class="kpi-label">Ingreso Mensual Total</div>
                        <div class="kpi-value">${this.formatCurrency(totalIncome)}</div>
                    </div>
                    <div class="kpi">
                        <div class="kpi-label">Cantidad de Fuentes</div>
                        <div class="kpi-value">${sources.length}</div>
                    </div>
                </div>

                <!-- Distribución de Ingresos -->
                <div class="card">
                    <h3>Fuentes de Ingreso</h3>
                    <div class="chart-container">
                        <canvas id="incomeChart"></canvas>
                    </div>
                </div>

                <!-- Tabla de Fuentes -->
                <div class="card">
                    <h3>Detalle de Fuentes</h3>
                    ${this.renderSourcesTable(sources)}
                </div>

                <!-- Modal para agregar fuente -->
                <div id="sourceModal" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">Nueva Fuente de Ingreso</div>
                        <form onsubmit="app.currentModule.saveSource(event)">
                            <div class="form-group">
                                <label>Nombre de la Fuente *</label>
                                <input type="text" id="sourceName" placeholder="Ej: Salario principal" required>
                            </div>
                            <div class="form-group">
                                <label>Monto Mensual *</label>
                                <input type="number" id="sourceAmount" placeholder="0" required>
                            </div>
                            <div class="form-group">
                                <label>Descripción</label>
                                <textarea id="sourceDescription" placeholder="Detalles..." rows="3"></textarea>
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
            this.renderIncomeChart(sources);
        }, 100);
    }

    renderIncomeChart(sources) {
        const ctx = document.getElementById('incomeChart');
        if (this.chartInstances.income) {
            this.chartInstances.income.destroy();
        }

        const labels = sources.map(s => s.name);
        const data = sources.map(s => s.monthlyAmount);
        const colors = [
            'rgba(16, 185, 129, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(139, 92, 246, 0.8)'
        ];

        this.chartInstances.income = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Ingreso Mensual',
                    data,
                    backgroundColor: colors.slice(0, data.length),
                    borderColor: colors.slice(0, data.length).map(c => c.replace('0.8', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrencyShort(value)
                        }
                    }
                }
            }
        });
    }

    renderSourcesTable(sources) {
        if (sources.length === 0) {
            return '<p class="text-muted">Sin fuentes de ingreso. Añade una.</p>';
        }

        let html = '<div class="table-container"><table><thead><tr>';
        html += '<th>Fuente</th><th class="text-right">Monto Mensual</th><th>% del Total</th><th>Acciones</th>';
        html += '</tr></thead><tbody>';

        const totalIncome = sources.reduce((sum, s) => sum + (s.monthlyAmount || 0), 0);

        sources.forEach((source, idx) => {
            const percentage = totalIncome > 0 ? Math.round((source.monthlyAmount / totalIncome) * 100) : 0;
            html += `<tr>
                <td><strong>${source.name}</strong></td>
                <td class="text-right font-bold text-success">${this.formatCurrency(source.monthlyAmount)}</td>
                <td>${percentage}%</td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="app.currentModule.editSource(${idx})">Editar</button>
                    <button class="btn btn-danger btn-small" onclick="app.currentModule.deleteSource(${idx})">Eliminar</button>
                </td>
            </tr>`;
        });

        html += '</tbody></table></div>';
        return html;
    }

    showAddSourceModal() {
        document.getElementById('sourceModal').classList.add('active');
        document.getElementById('sourceName').value = '';
        document.getElementById('sourceAmount').value = '';
        document.getElementById('sourceDescription').value = '';
        this.editingIndex = null;
    }

    editSource(index) {
        const source = financeData.getIncomeSources()[index];
        if (!source) return;

        document.getElementById('sourceModal').classList.add('active');
        document.getElementById('sourceName').value = source.name;
        document.getElementById('sourceAmount').value = source.monthlyAmount;
        document.getElementById('sourceDescription').value = source.description || '';
        this.editingIndex = index;
    }

    saveSource(event) {
        event.preventDefault();
        const name = document.getElementById('sourceName').value.trim();
        const amount = parseFloat(document.getElementById('sourceAmount').value);
        const description = document.getElementById('sourceDescription').value;

        if (!name || !amount) {
            alert('Completa nombre y monto');
            return;
        }

        const sources = financeData.getIncomeSources();
        const sourceData = { name, monthlyAmount: amount, description };

        if (this.editingIndex !== null && this.editingIndex !== undefined) {
            sources[this.editingIndex] = { ...sources[this.editingIndex], ...sourceData };
            this.editingIndex = null;
        } else {
            sourceData.id = Date.now();
            sources.push(sourceData);
        }

        financeData.data.income.sources = sources;
        financeData.saveData();

        this.closeModal();
        this.render();
    }

    deleteSource(index) {
        if (!confirm('¿Eliminar esta fuente de ingreso?')) return;
        const sources = financeData.getIncomeSources();
        sources.splice(index, 1);
        financeData.data.income.sources = sources;
        financeData.saveData();
        this.render();
    }

    closeModal() {
        document.getElementById('sourceModal').classList.remove('active');
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value || 0);
    }

    formatCurrencyShort(value) {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
            return (value / 1000).toFixed(0) + 'K';
        }
        return value;
    }
}
