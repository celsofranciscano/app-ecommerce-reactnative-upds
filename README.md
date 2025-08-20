# 📱 Sistema CRUD con Carrito de Compras - React Native

Una aplicación completa de React Native con Expo que implementa un sistema de gestión empresarial con carrito de compras, desarrollada para práctica universitaria.

## 🚀 Características Principales

### 👥 Sistema de Roles
- **Administrador**: Gestión completa de usuarios, productos y pedidos
- **Cliente**: Navegación de productos, carrito de compras y gestión de pedidos
- **Autenticación**: Sistema de login/registro con control de acceso por roles

### 🛍️ Funcionalidades de Tienda
- Catálogo de productos con precios en bolivianos (Bs.)
- Carrito de compras con selección de cantidad
- Gestión automática de inventario (reducción/restauración de stock)
- Confirmación y seguimiento de pedidos

### ⚙️ Panel de Administración
- **CRUD de Usuarios**: Crear, leer, actualizar y eliminar usuarios
- **CRUD de Productos**: Gestión completa del inventario
- **CRUD de Pedidos**: Administración y seguimiento de pedidos
- **Control de Stock**: Monitoreo automático del inventario

### 💾 Base de Datos Local
- Persistencia con AsyncStorage
- Datos iniciales precargados
- Actualización en tiempo real de la interfaz

## 📁 Estructura del Proyecto

\`\`\`
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Navegación por tabs con control de roles
│   │   ├── index.tsx            # Tienda de productos (solo clientes)
│   │   ├── cart.tsx             # Carrito de compras (solo clientes)
│   │   ├── orders.tsx           # Pedidos del cliente (solo clientes)
│   │   ├── admin.tsx            # Panel administrativo (solo admins)
│   │   └── profile.tsx          # Perfil y autenticación
│   └── _layout.tsx              # Layout principal
├── components/
│   └── admin/
│       ├── ProductsAdmin.tsx    # Gestión de productos
│       ├── UsersAdmin.tsx       # Gestión de usuarios
│       └── OrdersAdmin.tsx      # Gestión de pedidos
├── services/
│   └── storage.ts               # Servicio de base de datos local
└── README.md
\`\`\`

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- Expo CLI
- React Native development environment

### Pasos de Instalación

1. **Clonar el repositorio**
\`\`\`bash
git clone [url-del-repositorio]
cd react-native-crud-app
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
\`\`\`

3. **Instalar dependencias específicas**
\`\`\`bash
npm install @react-native-async-storage/async-storage
npm install @expo/vector-icons
npm install expo-router
\`\`\`

4. **Ejecutar la aplicación**
\`\`\`bash
npx expo start
\`\`\`

## 👤 Usuarios por Defecto

### Administrador
- **Email**: `admin@app.com`
- **Contraseña**: `admin123`
- **Permisos**: Acceso completo al panel administrativo

### Cliente
- **Email**: `cliente@app.com`
- **Contraseña**: `cliente123`
- **Permisos**: Acceso a tienda, carrito y pedidos

## 📱 Uso de la Aplicación

### Para Clientes

1. **Iniciar Sesión**
   - Usar credenciales de cliente o registrarse como nuevo usuario
   - Los nuevos usuarios se registran automáticamente como clientes

2. **Navegar Productos**
   - Ver catálogo completo con precios en bolivianos
   - Verificar stock disponible

3. **Agregar al Carrito**
   - Seleccionar cantidad deseada
   - El stock se reduce automáticamente
   - Validación de stock disponible

4. **Gestionar Carrito**
   - Modificar cantidades
   - Eliminar productos (restaura stock)
   - Ver total en bolivianos

5. **Realizar Pedido**
   - Confirmar compra desde el carrito
   - Ver historial de pedidos en la tab "Pedidos"

### Para Administradores

1. **Iniciar Sesión**
   - Usar credenciales de administrador

2. **Gestión de Productos**
   - Crear nuevos productos con precio y stock
   - Editar información y precios
   - Eliminar productos del catálogo
   - Monitorear niveles de inventario

3. **Gestión de Usuarios**
   - Ver lista completa de usuarios
   - Crear nuevos usuarios (clientes o admins)
   - Editar información de usuarios
   - Eliminar cuentas de usuario

4. **Gestión de Pedidos**
   - Ver todos los pedidos del sistema
   - Actualizar estado de pedidos
   - Monitorear ventas y estadísticas

## 🔧 Tecnologías Utilizadas

- **React Native**: Framework principal
- **Expo**: Plataforma de desarrollo
- **Expo Router**: Navegación basada en archivos
- **AsyncStorage**: Base de datos local
- **TypeScript**: Tipado estático
- **React Hooks**: Gestión de estado

## 💰 Sistema de Moneda

Todos los precios se muestran en **bolivianos (Bs.)** con formato:
- Productos: `Bs. 25.50`
- Totales: `Total: Bs. 125.75`

## 🔄 Actualización en Tiempo Real

La aplicación implementa un sistema de listeners que actualiza automáticamente:
- Inventario de productos
- Contenido del carrito
- Lista de pedidos
- Navegación por roles
- Estado de autenticación

## 🛡️ Seguridad y Roles

### Control de Acceso
- **Clientes**: Solo pueden acceder a tienda, carrito y sus pedidos
- **Administradores**: Solo pueden acceder al panel administrativo
- **Navegación Dinámica**: Las tabs se muestran según el rol del usuario

### Validaciones
- Autenticación requerida para todas las funciones
- Verificación de permisos en cada acción
- Validación de stock antes de agregar al carrito
- Emails únicos en el registro

## 📊 Datos Iniciales

La aplicación incluye datos de ejemplo:
- 2 usuarios (admin y cliente)
- 6 productos con stock variado
- Precios en bolivianos

## 🐛 Solución de Problemas

### La aplicación no inicia
\`\`\`bash
npx expo install --fix
npx expo start --clear
\`\`\`

### Problemas con AsyncStorage
\`\`\`bash
npm uninstall @react-native-async-storage/async-storage
npm install @react-native-async-storage/async-storage
\`\`\`

### Datos no se actualizan
- Verificar que los listeners estén funcionando
- Reiniciar la aplicación si es necesario

## 📝 Notas de Desarrollo

- La aplicación usa AsyncStorage como base de datos local
- Los cambios se reflejan inmediatamente en la interfaz
- El sistema de roles es estricto y seguro
- Todos los precios están en bolivianos (Bs.)

## 🎓 Propósito Académico

Este proyecto fue desarrollado como práctica universitaria para demostrar:
- Desarrollo de aplicaciones móviles con React Native
- Implementación de sistemas CRUD
- Gestión de estado y persistencia local
- Control de acceso y autenticación
- Diseño de interfaces de usuario móviles

---

**Desarrollado con ❤️ para práctica universitaria**
