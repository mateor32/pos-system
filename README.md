# Sistema POS Empresarial

Sistema de Punto de Venta completo con Java Spring Boot y React + TypeScript.

## Requisitos

- Java 17+
- Node.js 18+
- PostgreSQL 15+

## Configuración de Base de Datos

```bash
psql -U postgres -f init-db.sql
```

Esto crea la base de datos `pos_db` y el usuario `pos_user` con los permisos necesarios.

## Backend

```bash
cd backend
mvn spring-boot:run
```

La API queda disponible en `http://localhost:8080`.  
Al arrancar por primera vez se insertan datos de prueba automáticamente.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Credenciales por defecto

| Usuario | Contraseña | Rol           |
| ------- | ---------- | ------------- |
| admin   | admin123   | Administrador |
| gerente | gerente123 | Gerente       |
| cajero  | cajero123  | Cajero        |

## Módulos

| Ruta          | Descripción                                     |
| ------------- | ----------------------------------------------- |
| `/`           | Dashboard con KPIs, gráficas y alertas de stock |
| `/pos`        | Terminal de ventas con carrito y cobro          |
| `/inventory`  | Gestión de productos, stock y ajustes           |
| `/sales`      | Historial de ventas con filtros y cancelaciones |
| `/customers`  | CRUD de clientes con saldo de crédito           |
| `/accounting` | Gastos, flujo de caja y resumen mensual         |
| `/settings`   | Categorías, usuarios y datos del negocio        |

## Stack Tecnológico

**Backend:** Java 17 · Spring Boot 3.2 · Spring Security (JWT) · Spring Data JPA · PostgreSQL · Lombok

**Frontend:** React 18 · TypeScript · Vite 5 · TailwindCSS · React Query v5 · Zustand · Recharts · Axios
