# Documentación del Sistema POS Empresarial

## Descripción General

Este proyecto es un sistema de Punto de Venta (POS) completo, desarrollado con Java Spring Boot para el backend y React + TypeScript para el frontend. Permite gestionar ventas, inventario, clientes, gastos, usuarios y reportes, con autenticación JWT y una interfaz moderna en modo oscuro.

---

## Estructura del Proyecto

```
pos/
├── backend/           # Backend Java Spring Boot
│   ├── pom.xml        # Configuración Maven
│   └── src/main/java/com/pos/
│       ├── entity/    # Entidades JPA (User, Product, Sale, etc.)
│       ├── repository/# Repositorios JPA
│       ├── service/   # Lógica de negocio
│       ├── controller/# Controladores REST
│       ├── config/    # Seguridad, JWT, CORS
│       └── dto/       # Objetos de transferencia de datos
│   └── src/main/resources/
│       └── application.properties # Configuración
├── frontend/          # Frontend React + Vite
│   ├── package.json   # Dependencias npm
│   ├── src/
│   │   ├── pages/     # Páginas principales (Login, Dashboard, POS, etc.)
│   │   ├── components/# Componentes UI reutilizables
│   │   ├── services/  # Llamadas a API
│   │   ├── store/     # Zustand stores (auth, cart)
│   │   └── types/     # Tipos TypeScript
│   └── vite.config.ts # Proxy y configuración Vite
├── init-db.sql        # Script para crear la base de datos y usuario
└── README.md          # Instrucciones de uso
```

---

## Backend (Java Spring Boot)

- **Entidades (`entity/`)**: Representan las tablas de la base de datos (User, Product, Category, Sale, SaleItem, Customer, Expense, StockMovement).
- **Repositorios (`repository/`)**: Interfaces JPA para acceso a datos, con queries personalizadas.
- **Servicios (`service/`)**: Lógica de negocio (ventas, stock, autenticación, dashboard, etc.).
- **Controladores (`controller/`)**: Endpoints REST para cada módulo.
- **DTOs (`dto/`)**: Objetos para transferir datos entre frontend y backend.
- **Seguridad (`config/`)**: JWT, BCrypt, CORS, filtros y configuración de seguridad.
- **DataInitializer**: Inserta datos de prueba al iniciar.
- **application.properties**: Configuración de base de datos, JWT, CORS, etc.

### Principales Endpoints

- `/api/auth/login` — Login JWT
- `/api/products` — CRUD de productos
- `/api/sales` — Registrar y consultar ventas
- `/api/customers` — CRUD de clientes
- `/api/expenses` — Registrar y consultar gastos
- `/api/dashboard` — KPIs y reportes

---

## Frontend (React + TypeScript)

- **Páginas (`pages/`)**: Login, Dashboard, POS, Inventario, Ventas, Clientes, Contabilidad, Configuración.
- **Componentes UI (`components/ui/`)**: Botón, Input, Modal, Badge, Toast, Spinner, StatCard, Sidebar, Layout.
- **Servicios (`services/`)**: Llamadas a la API usando Axios, manejo de JWT.
- **Store (`store/`)**: Zustand para autenticación y carrito.
- **Tipos (`types/`)**: Interfaces TypeScript para todas las entidades y DTOs.
- **Vite Proxy**: Redirige `/api` a `http://localhost:8080` para evitar problemas de CORS.

---

## Base de Datos

- **Motor**: PostgreSQL
- **Nombre**: pos_db
- **Usuario**: pos_user
- **Contraseña**: pos_password
- **Script de creación**: `init-db.sql`

---

## Instalación y Ejecución

1. **Crear la base de datos:**
   ```bash
   psql -U postgres -f init-db.sql
   ```
2. **Arrancar el backend:**
   ```powershell
   & "C:\Users\mater\maven\apache-maven-3.9.6\bin\mvn.cmd" -f "C:\Users\mater\Desktop\pos\backend\pom.xml" spring-boot:run
   ```
3. **Arrancar el frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. **Acceder a la app:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080

---

## Credenciales por defecto

| Usuario | Contraseña | Rol           |
| ------- | ---------- | ------------- |
| admin   | admin123   | Administrador |
| gerente | gerente123 | Gerente       |
| cajero  | cajero123  | Cajero        |

---

## Funcionalidades principales

- **Login seguro** con JWT
- **Dashboard** con KPIs, gráficas y alertas
- **POS**: Terminal de ventas rápida con carrito y cobro
- **Inventario**: CRUD de productos, ajuste de stock
- **Ventas**: Historial, detalle, cancelación, impresión
- **Clientes**: CRUD y saldo de crédito
- **Contabilidad**: Gastos, flujo de caja, resumen mensual
- **Configuración**: Categorías, usuarios, datos del negocio
- **Notificaciones**: Toasts y validaciones visuales
- **Modo oscuro**: UI moderna y responsiva

---

## Contacto y soporte

Para dudas o soporte, contactar al desarrollador del proyecto.
