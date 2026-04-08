cat > CLAUDE.md << 'EOF'
# Proyecto: App de Finanzas Personales (SPA)

Construye una Single Page Application completa de finanzas personales.
No uses frameworks. Solo HTML, CSS y JavaScript vanilla + Chart.js.

## Estructura de archivos a crear

personal-finance/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── data.js
│   ├── app.js
│   └── modules/
│       ├── dashboard.js
│       ├── periodos.js
│       ├── deudas.js
│       └── ingresos.js
└── lib/
    └── chart.umd.min.js  (descarga desde jsDelivr)

## Datos reales del usuario (Google Sheets colombiano, moneda COP)

### Periodo "Quincena 1-15":
- Cuota Natación Emily: ingreso $2,200,000
- Cuta de la Casa: egreso $450,000 / deuda total $14,749,153
- Credito Davivienda: deuda total $2,200,000
- Av Villas: egreso $1,740,000 / deuda total $12,757,000
- TC Finandina: egreso $390,000 / deuda total $3,400,000
- Tigo: sin monto
- Almuerzos: saldo $200,000
- Transportes: saldo $70,000
- Movistar mio: egreso $323,000
- Movistar Laus: egreso $51,000
- Universidad Laus: egreso $1,250,000
- Cadena, Apartamento, Ahorro Littio: sin monto

### Periodo "Quincena 15-30":
- Movistar: ingreso $3,000,000 / egreso $160,000
- Bancolombia TC: egreso $475,186 / deuda total $7,598,276
- TC Cooperativa: egreso $260,000 / deuda total $2,500,000
- Ahorro Programado Cooperativa: saldo $71,000
- Fincomercio: deuda total $4,500,000
- Almuerzos: saldo $200,000
- Transportes: saldo $70,000
- Recibos: egreso $200,000
- Abuelo: saldo $60,000
- Skandia: egreso $350,000
- Apartamento: egreso $1,090,000
- Impuesto: egreso $300,000

### Deuda total: $47,704,429 COP

## Funcionalidades requeridas

### index.html
- Layout con sidebar izquierdo colapsable y área principal
- 4 secciones navegables: Dashboard, Períodos de Pago, Deudas y Créditos, Ingresos
- Sin recarga de página (SPA router con hash o sección visible/oculta)
- Topbar con fecha actual, botón Guardar
- Toast de notificaciones

### css/styles.css
- Tema oscuro (dark mode): fondo #0f172a, superficie #1e293b
- Dashboard estilo fintech moderno
- Cards de resumen con colores: verde (ingresos), rojo (egresos), azul (neto), naranja (deuda)
- Tablas con edición inline
- Barras de progreso para deudas
- Modal para crear períodos
- Responsive (mobile-friendly)
- Sin Bootstrap, sin Tailwind, CSS puro con variables

### js/data.js
- Objeto DB con toda la lógica de persistencia en localStorage (clave: 'finanzas_v1')
- SEED con los datos reales del usuario precargados
- CRUD completo: periodos, items de periodo, deudas, ingresos
- Soporte flexible para tipo de periodo: "quincena", "mensual", "personalizado"
- Helpers: calcPeriodo(p) retorna {totIngreso, totEgreso, totSaldo, neto}
- calcDeudaTotal() suma todos los saldoActual
- Función fmt(n) formatea COP: Intl.NumberFormat('es-CO', {style:'currency', currency:'COP', minimumFractionDigits:0})
- Arrays CATEGORIAS y FRECUENCIAS

### js/app.js
- DOMContentLoaded: carga DB, inicializa fecha, router de secciones
- Router: navigate(name) muestra/oculta secciones, actualiza nav activo, llama init de cada módulo
- Sidebar toggle (colapsar desktop, abrir mobile)
- Botón guardar llama DB.save()
- showToast(msg, type) para notificaciones
- openModal(id) / closeModal(id)

### js/modules/dashboard.js - función initDashboard()
- 4 cards KPI: total ingresos, total egresos, flujo neto (verde si positivo, rojo si negativo), deuda total
- Gráfica doughnut: distribución de egresos por categoría (Chart.js)
- Gráfica bar: ingresos vs egresos por período (Chart.js)
- Tabla resumen de todos los períodos

### js/modules/periodos.js - función initPeriodos()
- Select para cambiar entre períodos
- Badge que muestra el tipo (quincena/mensual/personalizado)
- 4 stats del período seleccionado: ingresos, egresos, saldo disponible, flujo neto
- Tabla editable inline: concepto, categoría, saldo, ingreso, egreso, estado (pendiente/pagado/vencido)
- Totales en el footer de la tabla
- Botón "+ Nuevo Período" abre modal con: nombre, tipo, fecha inicio, fecha fin
- Botón "Eliminar Período" con confirmación
- Botón "+ Agregar" añade fila vacía al período actual
- Botón eliminar por fila con confirmación
- Cambios se guardan automáticamente en localStorage al editar

### js/modules/deudas.js - función initDeudas()
- 3 cards: deuda total actual, total pagado, número de deudas
- Tabla con: acreedor (editable), valor inicial (editable), saldo actual (editable), pagado (calculado), barra de progreso %, botón eliminar
- Color de barra: verde >66%, naranja >33%, rojo <=33%
- Botón "+ Nueva Deuda" usa prompt() para nombre y valor inicial
- Cambios guardan automáticamente

### js/modules/ingresos.js - función initIngresos()
- Tabla con: fuente (editable), frecuencia (select: quincenal/mensual/semanal/única vez/anual), monto estimado (editable), monto real (editable), período asociado (select), diferencia (calculada, verde si positivo)
- Botón "+ Nueva Fuente" usa prompt()
- Cambios guardan automáticamente

## Importante
- Chart.js se descarga desde: https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js
- Todos los archivos JS se cargan con defer en index.html en este orden: data.js, dashboard.js, periodos.js, deudas.js, ingresos.js, app.js
- Los datos del SEED deben ser exactamente los del usuario, no datos de ejemplo genéricos
- La app debe funcionar abriendo index.html directamente en el browser (file://) sin servidor
EOF