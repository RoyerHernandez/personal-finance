/**
 * Módulo Configuración
 * Ajustes generales, importar/exportar datos
 */

class Settings {
    constructor(container) {
        this.container = container;
    }

    render() {
        const settings = financeData.getSettings();
        const dataSize = (localStorage.getItem('financeAppData') || '').length;

        this.container.innerHTML = `
            <div class="settings">
                <h1>⚙️ Configuración</h1>

                <!-- Configuración General -->
                <div class="card">
                    <div class="card-header">
                        <h3>Configuración General</h3>
                    </div>
                    <form onsubmit="app.currentModule.saveSettings(event)">
                        <div class="form-group">
                            <label>Moneda</label>
                            <select id="currency">
                                <option value="COP" ${settings.currency === 'COP' ? 'selected' : ''}>Pesos Colombianos (COP)</option>
                                <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>Dólares (USD)</option>
                                <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>Euros (EUR)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Tipo de Período</label>
                            <select id="periodType">
                                <option value="monthly" ${settings.periodType === 'monthly' ? 'selected' : ''}>Mensual</option>
                                <option value="biweekly" ${settings.periodType === 'biweekly' ? 'selected' : ''}>Quincenal</option>
                                <option value="custom" ${settings.periodType === 'custom' ? 'selected' : ''}>Personalizado</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">Guardar Configuración</button>
                    </form>
                </div>

                <!-- Datos e Importar/Exportar -->
                <div class="card">
                    <div class="card-header">
                        <h3>Datos</h3>
                        <p class="text-muted">Tamaño: ${(dataSize / 1024).toFixed(2)} KB</p>
                    </div>

                    <h4 style="margin-bottom: var(--spacing-md);">Importar Datos</h4>
                    <form onsubmit="app.currentModule.importData(event)">
                        <div class="form-group">
                            <label>Pega aquí el JSON exportado</label>
                            <textarea id="importData" placeholder="Pega el contenido JSON aquí..." rows="6" style="font-family: monospace; font-size: 0.875rem;"></textarea>
                        </div>
                        <button type="submit" class="btn btn-secondary">Importar</button>
                    </form>

                    <h4 style="margin: var(--spacing-lg) 0 var(--spacing-md) 0;">Exportar Datos</h4>
                    <p class="text-muted" style="margin-bottom: var(--spacing-md);">Descarga un respaldo de todos tus datos en formato JSON</p>
                    <button class="btn btn-secondary" onclick="app.currentModule.exportData()">Descargar JSON</button>

                    <h4 style="margin: var(--spacing-lg) 0 var(--spacing-md) 0;">CSV (Para hojas de cálculo)</h4>
                    <p class="text-muted" style="margin-bottom: var(--spacing-md);">Exporta tus deudas y gastos en CSV para abrir en Excel/Sheets</p>
                    <button class="btn btn-secondary" onclick="app.currentModule.exportCSV()">Descargar CSV</button>
                </div>

                <!-- Peligro -->
                <div class="card" style="border-left: 4px solid var(--danger);">
                    <div class="card-header">
                        <h3>Zona de Peligro</h3>
                    </div>
                    <p class="text-muted" style="margin-bottom: var(--spacing-lg);">Estas acciones no se pueden deshacer</p>
                    <button class="btn btn-danger" onclick="app.currentModule.resetData()">Resetear Todos los Datos</button>
                </div>

                <!-- Información -->
                <div class="card">
                    <div class="card-header">
                        <h3>Información</h3>
                    </div>
                    <p><strong>Versión:</strong> 1.0.0</p>
                    <p><strong>Almacenamiento:</strong> localStorage del navegador</p>
                    <p><strong>Privacidad:</strong> Todos tus datos se almacenan localmente. No se envía nada a servidores.</p>
                    <p><strong>Última actualización:</strong> <span id="lastUpdate">-</span></p>
                </div>
            </div>
        `;

        this.updateLastChangeTime();
    }

    saveSettings(event) {
        event.preventDefault();
        const currency = document.getElementById('currency').value;
        const periodType = document.getElementById('periodType').value;

        financeData.updateSettings({
            currency,
            periodType
        });

        alert('Configuración guardada');
    }

    exportData() {
        const json = financeData.exportJSON();
        this.downloadFile(json, 'finanzas-backup.json', 'application/json');
    }

    exportCSV() {
        const debts = financeData.getDebts();
        let csv = 'Tipo,Nombre,Monto Inicial,Saldo Actual,Cuota Mensual,Fecha de Inicio\n';

        debts.forEach(debt => {
            csv += `"Deuda","${debt.name}","${debt.initialAmount}","${debt.currentAmount}","${debt.monthlyPayment}","${debt.startDate}"\n`;
        });

        const expenses = financeData.getExpenses();
        csv += '\nTipo,Categoría,Descripción,Monto,Fecha\n';

        expenses.forEach(expense => {
            csv += `"Gasto","${expense.category}","${expense.description || ''}","${expense.amount}","${expense.date}"\n`;
        });

        this.downloadFile(csv, 'finanzas-export.csv', 'text/csv');
    }

    importData(event) {
        event.preventDefault();
        const jsonText = document.getElementById('importData').value.trim();

        if (!jsonText) {
            alert('Pega el contenido JSON');
            return;
        }

        if (financeData.importJSON(jsonText)) {
            alert('Datos importados correctamente');
            setTimeout(() => location.reload(), 500);
        } else {
            alert('Error al importar. Verifica que el JSON sea válido');
        }
    }

    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    resetData() {
        if (!confirm('¿REALMENTE quieres resetear TODOS los datos? ¡No se puede deshacer!')) {
            return;
        }
        if (!confirm('Este es el último aviso. ¿Estás seguro?')) {
            return;
        }

        financeData.resetData();
        alert('Datos reseteados. La página se recargará.');
        setTimeout(() => location.reload(), 500);
    }

    updateLastChangeTime() {
        const lastUpdate = localStorage.getItem('financeAppLastUpdate');
        const element = document.getElementById('lastUpdate');
        if (element) {
            if (lastUpdate) {
                const date = new Date(lastUpdate);
                element.textContent = date.toLocaleString('es-CO');
            } else {
                element.textContent = 'Hoy';
            }
        }
    }
}

// Actualiza el timestamp cuando cambian los datos
const originalSaveData = financeData.saveData.bind(financeData);
financeData.saveData = function() {
    originalSaveData();
    localStorage.setItem('financeAppLastUpdate', new Date().toISOString());
};
