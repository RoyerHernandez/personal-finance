/**
 * Módulo Configuración
 */
class Settings {
    constructor(container) { this.container = container; }

    render() {
        const settings = financeData.getSettings();
        const dataSize = (localStorage.getItem('finanzas_v1') || '').length;
        const lastUpdate = localStorage.getItem('finanzas_lastUpdate');

        this.container.innerHTML = `
            <div class="page-content">
            <h1 class="mb-lg">Configuracion</h1>

            <div class="section">
                <div class="section-header" onclick="toggleSection(this)">
                    <h3>⚙️ General</h3>
                    <span class="section-toggle">▾</span>
                </div>
                <div class="section-body">
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
            </div>

            <div class="section">
                <div class="section-header" onclick="toggleSection(this)">
                    <h3>📦 Datos</h3>
                    <div class="section-header-right">
                        <span class="text-muted" style="font-size:0.75rem">${(dataSize / 1024).toFixed(2)} KB</span>
                        <span class="section-toggle">▾</span>
                    </div>
                </div>
                <div class="section-body">
                    <h3>Exportar</h3>
                    <p class="text-muted mb-md" style="font-size:0.82rem">Descarga un respaldo de tus datos</p>
                    <div class="btn-group mb-lg">
                        <button class="btn btn-secondary" onclick="app.currentModule.exportJSON()">📄 JSON</button>
                        <button class="btn btn-secondary" onclick="app.currentModule.exportCSV()">📊 CSV</button>
                    </div>

                    <h3 class="mt-md">Importar</h3>
                    <div class="file-upload" id="fileUploadArea">
                        <span class="material-symbols-rounded" style="font-size:36px;color:var(--accent);margin-bottom:8px">upload_file</span>
                        <p style="margin:0 0 4px"><strong>Arrastra tu archivo JSON aqui</strong></p>
                        <p class="text-muted" style="font-size:0.8rem;margin:0 0 8px">o haz clic para seleccionar</p>
                        <input type="file" id="importFile" accept=".json" style="display:none">
                        <button type="button" class="btn btn-secondary btn-small" onclick="document.getElementById('importFile').click()">Seleccionar archivo</button>
                        <p id="fileName" class="text-muted" style="font-size:0.75rem;margin-top:8px"></p>
                    </div>
                    <p class="text-muted" style="font-size:0.8rem;margin:12px 0 8px">O pega el JSON directamente:</p>
                    <form onsubmit="app.currentModule.importData(event)">
                        <div class="form-group">
                            <textarea id="importData" rows="3" placeholder="{ ... }" style="font-family:monospace;font-size:0.8rem"></textarea>
                        </div>
                        <button type="submit" class="btn btn-secondary">Importar</button>
                    </form>
                </div>
            </div>

            <div class="section" style="border-color:var(--danger)">
                <div class="section-header" onclick="toggleSection(this)">
                    <h3>⚠️ Zona de Peligro</h3>
                    <span class="section-toggle">▾</span>
                </div>
                <div class="section-body">
                    <p class="text-muted mb-md" style="font-size:0.82rem">Esta acción no se puede deshacer</p>
                    <button class="btn btn-danger" onclick="app.currentModule.resetData()">Resetear Todos los Datos</button>
                </div>
            </div>

            <div class="section">
                <div class="section-header" onclick="toggleSection(this)">
                    <h3>ℹ️ Información</h3>
                    <span class="section-toggle">▾</span>
                </div>
                <div class="section-body">
                    <p style="font-size:0.82rem"><strong>Versión:</strong> 2.0.0</p>
                    <p style="font-size:0.82rem"><strong>Almacenamiento:</strong> localStorage</p>
                    <p style="font-size:0.82rem"><strong>Privacidad:</strong> Todos tus datos son locales</p>
                    <p style="font-size:0.82rem"><strong>Última actualización:</strong> ${lastUpdate ? new Date(lastUpdate).toLocaleString('es-CO') : 'Hoy'}</p>
                </div>
            </div>
            </div>
        `;
        this.setupFileUpload();
    }

    setupFileUpload() {
        const area = document.getElementById('fileUploadArea');
        const input = document.getElementById('importFile');
        if (!area || !input) return;

        input.addEventListener('change', (e) => {
            if (e.target.files.length) this.handleFile(e.target.files[0]);
        });

        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.add('dragover');
        });
        area.addEventListener('dragleave', () => area.classList.remove('dragover'));
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.classList.remove('dragover');
            if (e.dataTransfer.files.length) this.handleFile(e.dataTransfer.files[0]);
        });
    }

    handleFile(file) {
        if (!file.name.endsWith('.json')) {
            showToast('Solo archivos .json', 'error');
            return;
        }
        document.getElementById('fileName').textContent = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            const json = e.target.result;
            if (!confirm('¿Importar datos desde ' + file.name + '? Esto reemplazará tus datos actuales.')) return;
            if (financeData.importJSON(json)) {
                showToast('Importado correctamente', 'success');
                setTimeout(() => location.reload(), 500);
            } else {
                showToast('JSON inválido', 'error');
            }
        };
        reader.readAsText(file);
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
        if (!json) { showToast('Pega el JSON', 'error'); return; }
        if (financeData.importJSON(json)) {
            showToast('Importado correctamente', 'success');
            setTimeout(() => location.reload(), 500);
        } else {
            showToast('JSON inválido', 'error');
        }
    }

    resetData() {
        if (!confirm('¿REALMENTE quieres resetear TODOS los datos?')) return;
        if (!confirm('Última oportunidad. ¿Seguro?')) return;
        financeData.resetData();
        showToast('Datos reseteados', 'warning');
        setTimeout(() => location.reload(), 500);
    }

    download(content, filename, type) {
        const blob = new Blob([content], { type });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(a.href);
        a.remove();
    }
}
