# App de Finanzas Personales

Una aplicación web de una sola página (SPA) para gestionar tus finanzas personales sin necesidad de servidor ni base de datos.

## 🎯 Características

- **Dashboard Principal**: Resumen de ingresos, gastos y deudas con gráficos interactivos
- **Gestión Flexible de Períodos**: Soporta quincenas, meses o períodos personalizados
- **Control de Deudas**: Seguimiento de deudas con progreso visual y cálculos de amortización
- **Registro de Gastos**: Categorización de gastos pequeños (gastos hormiga) con metas de ahorro
- **Fuentes de Ingresos**: Registro y seguimiento de múltiples fuentes de ingresos
- **Gráficos Interactivos**: Visualización con Chart.js
- **Almacenamiento Local**: Los datos se guardan en tu navegador (sin servidor)
- **Importar/Exportar**: Respaldos en JSON y CSV

## 🚀 Inicio Rápido

### Sin instalación

1. Abre `index.html` en tu navegador
2. Comienza a registrar tus ingresos y gastos
3. Los datos se guardan automáticamente en tu navegador

### Con servidor local (recomendado)

```bash
# Python 3
python -m http.server 8000

# Node.js (si tienes http-server instalado)
http-server

# O usa cualquier servidor local
```

Luego abre `http://localhost:8000`

## 📁 Estructura del Proyecto

```
finanzas-app/
├── index.html                    # Página principal
├── css/
│   └── styles.css              # Estilos CSS con variables
├── js/
│   ├── app.js                  # Router y orquestación
│   ├── data.js                 # Gestión de datos y localStorage
│   └── modules/
│       ├── dashboard.js        # Dashboard y resumen
│       ├── periods.js          # Gestión de períodos
│       ├── debts.js            # Control de deudas
│       ├── expenses.js         # Gastos hormiga
│       ├── income.js           # Fuentes de ingresos
│       └── settings.js         # Configuración
├── lib/
│   └── chart.min.js            # Chart.js (librería de gráficos)
└── README.md                    # Este archivo
```

## 💾 Almacenamiento de Datos

Los datos se almacenan en **localStorage** de tu navegador. No se envía nada a servidores externos. Esto significa:

- ✅ Privacidad total
- ✅ Funciona offline
- ✅ Sin costos de servidor
- ⚠️ Los datos se pierden si limpias el historial del navegador

### Respaldos

Siempre puedes hacer respaldos:
1. Ve a **Configuración**
2. Haz clic en "Descargar JSON"
3. Guarda el archivo en un lugar seguro

Para restaurar, pega el contenido en la sección "Importar Datos".

## 🗂️ Modelos de Datos

### Períodos (Quincenas, Meses, etc.)

```json
{
  "Período 1": {
    "name": "Período 1",
    "income": 2200000,
    "items": [
      {
        "id": 1,
        "name": "Cuota de la Casa",
        "type": "expense",
        "amount": 450000,
        "debt": 14749153
      }
    ]
  }
}
```

### Deudas

```json
{
  "id": 1,
  "name": "Cuota de la Casa",
  "initialAmount": 14749153,
  "currentAmount": 14749153,
  "monthlyPayment": 450000,
  "startDate": "2024-01-01"
}
```

### Gastos Hormiga

```json
{
  "id": 1234567890,
  "category": "Comida",
  "amount": 25000,
  "description": "Almuerzo",
  "date": "2024-01-15"
}
```

## 🎨 Personalización

### Variables CSS

Edita `css/styles.css` para cambiar colores:

```css
:root {
    --primary: #2563eb;
    --success: #10b981;
    --danger: #ef4444;
    --warning: #f59e0b;
}
```

## 🚀 Despliegue

### GitHub Pages (Recomendado - Gratuito)

```bash
# Asume que ya está inicializado como repositorio git
git add .
git commit -m "Inicializa app de finanzas"
git push origin main

# Ve a GitHub: Settings → Pages → Source: main/root
# Tu app estará en https://usuario.github.io/finanzas-personales
```

### Netlify

1. Crea cuenta en [netlify.com](https://netlify.com)
2. Arrastra la carpeta al dashboard
3. Tu app se publica automáticamente

### Vercel

```bash
npm i -g vercel
vercel
```

## 🛠️ Desarrollo

### Agregar nuevos módulos

Crea un archivo en `js/modules/tumodulo.js`:

```javascript
class TuModulo {
    constructor(container) {
        this.container = container;
    }

    render() {
        this.container.innerHTML = `
            <h1>Tu Módulo</h1>
            <!-- contenido -->
        `;
    }
}
```

Luego añade en `index.html`:

```html
<script src="js/modules/tumodulo.js"></script>
```

Y en `js/app.js` en el switch:

```javascript
case 'tumodulo':
    this.currentModule = new TuModulo(this.container);
    break;
```

## 📊 Gráficos

La app usa [Chart.js](https://www.chartjs.org/) para gráficos. Se incluye localmente sin necesidad de CDN.

## ⚙️ Navegadores Soportados

- ✅ Chrome/Edge (última versión)
- ✅ Firefox (última versión)
- ✅ Safari (última versión)
- ✅ iOS Safari 13+
- ✅ Android Chrome

## 📝 Licencia

Uso personal. Libre para modificar y distribuir.

## 🤝 Contribuciones

¿Quieres mejorar la app? Siéntete libre de hacer un fork y enviar cambios.

## 📧 Soporte

Si encuentras un bug o tienes una sugerencia, abre un issue en el repositorio.

---

**Nota de Privacidad**: Esta aplicación es completamente local. Tus datos nunca se envían a ningún servidor. Haz respaldos regularmente en Configuración.