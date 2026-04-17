/**
 * Módulo Configuración
 */
class Settings {
    constructor(container) {
        this.container = container;
    }

    render() {
        const settings = financeData.getSettings();
        const dataSize = (localStorage.getItem('finanzas_v1') || '').length;
        const lastUpdate = localStorage.getItem('finanzas_lastUpdate');

        this.container.innerHTML = `
            <h1>Configuración</h1>

            <div class="card">
                <div class="card-header"><h3>General</h3></div>
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
                            <option value="biweekly" ${settings.periodType === 'biweekly' ? 'selected' : ''}>Quincenal</option>
                            <option value="monthly" ${settings.periodType === 'monthly' ? 'selected' : ''}>Mensual</option>
                            <option value="custom" ${settings.periodType === 'custom' ? 'selected' : ''}>Personalizado</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Guardar Configuración</button>
                </form>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Datos</h3>
                    <span class="text-muted" style="font-size:0.8rem">${(dataSize / 1024).toFixed(2)} KB</span>
                </div>

                <h3 class="mb-sm">Exportar</h3>
                <p class="text-muted mb-md" style="font-size:0.85rem">Descarga un respaldo de tus datos</p>
                <div class="btn-group mb-lg">
                    <button class="btn btn-secondary" onclick="app.currentModule.exportJSON()">JSON</button>
                    <button class="btn btn-secondary" onclick="app.currentModule.exportCSV()">CSV</button>
                </div>

                <h3 class="mb-sm">Importar</h3>
                <form onsubmit="app.currentModule.importData(event)">
                    <div class="form-group">
                        <label>Pega el JSON exportado</label>
                        <textarea id="importData" rows="4" placeholder="{ ... }" style="font-family:monospace;font-size:0.8rem"></textarea>
                    </div>
                    <button type="submit" class="btn btn-secondary">Importar</button>
                </form>
            </div>

            <div class="card" style="border-left:3px solid var(--danger)">
                <div class="card-header"><h3>Zona de Peligro</h3></div>
                <p class="text-muted mb-md" style="font-size:0.85rem">Estas acciones no se pueden deshacer</p>
                <button class="btn btn-danger" onclick="app.currentModule.resetData()">Resetear Todos los Datos</button>
            </div>

            <div class="card">
                <div class="card-header"><h3>Información</h3></div>
                <p style="font-size:0.85rem"><strong>Versión:</strong> 2.0.0</p>
                <p style="font-size:0.85rem"><strong>Almacenamiento:</strong> localStorage</p>
                <p style="font-size:0.85rem"><strong>Privacidad:</strong> Todos tus datos son locales</p>
                <p style="font-size:0.85rem"><strong>Última actualización:</strong> ${lastUpdate ? new Date(lastUpdate).toLocaleString('es-CO') : 'Hoy'}</p>
            </div>
        `;
    }

    saveSettings(event) {
        event.preventDefault();
        financeData.updateSettings({
            currency: document.getElementById('currency').value,
            periodType: document.getElementById('periodType').value
        });
        showToast('Configuración guardada', 'success');
    }

    exportJSON() {
        this.download(financeData.exportJSON(), 'finanzas-backup.json', 'application/json');
        showToast('JSON descargado', 'success');
    }

    exportCSV() {
        let csv = 'Tipo,Nombre,Valor Inicial,Saldo Actual,Cuota Mensual\n';
        financeData.getDebts().forEach(d => {
            csv += `"Deuda","${d.name}","${d.initialAmount}","${d.currentAmount}","${d.monthlyPayment}"\n`;
        });
        csv += '\nTipo,Categoría,Descripción,Monto,Fecha\n';
        financeData.getExpenses().forEach(e => {
            csv += `"Gasto","${e.category}","${e.description || ''}","${e.amount}","${e.date}"\n`;
        });
        this.download(csv, 'finanzas-export.csv', 'text/csv');
        showToast('CSV descargado', 'success');
    }

    importData(event) {
        event.preventDefault();
        const json = document.getElementById('importData').value.trim();
        if (!json) { showToast('Pega el JSON primero', 'error'); return; }
        if (financeData.importJSON(json)) {
            showToast('Datos importados correctamente', 'success');
            setTimeout(() => location.reload(), 500);
        } else {
            showToast('JSON inválido', 'error');
        }
    }

    resetData() {
        if (!confirm('¿REALMENTE quieres resetear TODOS los datos?')) return;
        if (!confirm('Última oportunidad. ¿Estás seguro?')) return;
        financeData.resetData();
        showToast('Datos reseteados', 'warning');
        setTimeout(() => location.reload(), 500);
    }

    download(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
    }
}
