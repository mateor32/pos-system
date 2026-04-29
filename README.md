<div align="center">

# 🏪 POS System — Sistema de Punto de Venta Empresarial

[![CI/CD](https://github.com/mateor32/pos-system/actions/workflows/ci.yml/badge.svg)](https://github.com/mateor32/pos-system/actions/workflows/ci.yml)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.0-6DB33F?logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Solución completa de punto de venta con autenticación JWT, gestión de inventario, módulo de contabilidad y reportes en tiempo real.**

[Demo en vivo](https://pos-frontend.vercel.app) · [API Backend](https://pos-backend.onrender.com) · [Reportar un bug](https://github.com/mateor32/pos-system/issues)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [Módulos](#-módulos)
- [Instalación Local](#-instalación-local)
- [Despliegue con Docker](#-despliegue-con-docker)
- [Variables de Entorno](#-variables-de-entorno)
- [API Reference](#-api-reference)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Tests](#-tests)
- [Credenciales por Defecto](#-credenciales-por-defecto)
- [Estructura del Proyecto](#-estructura-del-proyecto)

---

## ✨ Características

| Módulo                   | Descripción                                                     |
| ------------------------ | --------------------------------------------------------------- |
| 🔐 **Autenticación JWT** | Login seguro con tokens firmados, roles y permisos por endpoint |
| 📊 **Dashboard**         | KPIs en tiempo real, gráficas de ventas y alertas de stock bajo |
| 🛒 **Terminal POS**      | Carrito interactivo, búsqueda de productos, cobro y cambio      |
| 📦 **Inventario**        | CRUD de productos, ajuste de stock, historial de movimientos    |
| 🧾 **Ventas**            | Historial completo, filtros por fecha, detalle y cancelación    |
| 👥 **Clientes**          | Gestión de clientes con saldo de crédito y historial            |
| 💰 **Contabilidad**      | Registro de gastos, flujo de caja y resumen mensual             |
| ⚙️ **Configuración**     | Categorías, gestión de usuarios y datos del negocio             |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                        │
│              React 18 + TypeScript + TailwindCSS                 │
│          Zustand (auth/cart) · React Query · Recharts            │
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTPS / REST (JSON)
                             │  Authorization: Bearer <JWT>
┌────────────────────────────▼────────────────────────────────────┐
│                      BACKEND (Spring Boot 3.2)                   │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Controllers │  │   Services   │  │  Spring Security     │  │
│  │  REST API    │→ │  Business    │  │  JWT Filter + CORS   │  │
│  └──────────────┘  │  Logic       │  └──────────────────────┘  │
│                    └──────┬───────┘                              │
│                           │ Spring Data JPA / Hibernate          │
│  ┌────────────────────────▼─────────────────────────────────┐   │
│  │                   PostgreSQL 16                           │   │
│  │  users · products · categories · sales · sale_items      │   │
│  │  customers · expenses · stock_movements                   │   │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Diagrama de flujo de autenticación

```
Usuario          Frontend            Backend          DB
  │──── login ───▶│                    │               │
  │               │── POST /auth/login▶│               │
  │               │                   │── query user ─▶│
  │               │                   │◀─ user data ───│
  │               │                   │  bcrypt verify │
  │               │◀─── JWT Token ─────│               │
  │               │  (localStorage)    │               │
  │               │                   │               │
  │── request ───▶│                    │               │
  │               │── Bearer Token ───▶│               │
  │               │                   │ validate JWT   │
  │               │◀─── response ──────│               │
```

---

## 🛠️ Stack Tecnológico

### Backend

| Tecnología        | Versión      | Propósito                             |
| ----------------- | ------------ | ------------------------------------- |
| Java              | 17 (Temurin) | Lenguaje principal                    |
| Spring Boot       | 3.2.0        | Framework web                         |
| Spring Security   | 6.x          | Autenticación y autorización          |
| Spring Data JPA   | 3.2.0        | ORM y acceso a datos                  |
| Hibernate         | 6.3.1        | Implementación JPA                    |
| JJWT              | 0.12.3       | Generación y validación de tokens JWT |
| PostgreSQL Driver | 42.x         | Conector de base de datos             |
| Lombok            | latest       | Reducción de boilerplate              |
| Maven             | 3.9.6        | Gestión de dependencias y build       |

### Frontend

| Tecnología   | Versión | Propósito                    |
| ------------ | ------- | ---------------------------- |
| React        | 18.2    | UI framework                 |
| TypeScript   | 5.3     | Tipado estático              |
| Vite         | 5.x     | Bundler y dev server         |
| TailwindCSS  | 3.4     | Estilos utility-first        |
| React Query  | 5.17    | Server state management      |
| Zustand      | 4.4     | Client state (auth, carrito) |
| Recharts     | 2.10    | Gráficas y visualizaciones   |
| Axios        | 1.6     | HTTP client                  |
| React Router | 6.21    | Enrutamiento SPA             |

### Infraestructura

| Tecnología       | Uso                                            |
| ---------------- | ---------------------------------------------- |
| Docker + Compose | Contenedores locales multi-servicio            |
| GitHub Actions   | CI/CD: tests + build + push a ghcr.io          |
| Render.com       | Hosting backend + PostgreSQL en producción     |
| Vercel           | Hosting frontend estático                      |
| ghcr.io          | Container registry (GitHub Container Registry) |

---

## 📦 Módulos

| Ruta          | Módulo                                | Roles permitidos       |
| ------------- | ------------------------------------- | ---------------------- |
| `/`           | Dashboard — KPIs, gráficas, alertas   | Admin, Gerente, Cajero |
| `/pos`        | Terminal POS — carrito y cobro        | Admin, Gerente, Cajero |
| `/inventory`  | Inventario — productos y stock        | Admin, Gerente         |
| `/sales`      | Ventas — historial y cancelaciones    | Admin, Gerente         |
| `/customers`  | Clientes — CRUD y crédito             | Admin, Gerente, Cajero |
| `/accounting` | Contabilidad — gastos y flujo de caja | Admin, Gerente         |
| `/settings`   | Configuración — usuarios y categorías | Admin                  |

---

## 🚀 Instalación Local

### Prerrequisitos

- **Java 17+** — [Descargar Temurin](https://adoptium.net/)
- **Node.js 20+** — [Descargar](https://nodejs.org/)
- **PostgreSQL 16** — [Descargar](https://www.postgresql.org/download/)
- **Maven 3.9+** — [Descargar](https://maven.apache.org/download.cgi)

### 1. Clonar el repositorio

```bash
git clone https://github.com/mateor32/pos-system.git
cd pos-system
```

### 2. Crear la base de datos

```bash
psql -U postgres -f init-db.sql
```

Esto crea la base de datos `pos_db`, el usuario `pos_user` e inserta datos de prueba.

### 3. Arrancar el Backend

```bash
cd backend
mvn spring-boot:run
```

> API disponible en `http://localhost:8080`  
> Los datos de prueba se insertan automáticamente al primer arranque.

### 4. Arrancar el Frontend

```bash
cd frontend
npm install
npm run dev
```

> Aplicación disponible en `http://localhost:5173`

---

## 🐳 Despliegue con Docker

El modo más rápido — levanta PostgreSQL, backend y frontend en un solo comando:

```bash
docker compose up --build -d
```

| Servicio    | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:80   |
| Backend API | http://localhost:8080 |
| PostgreSQL  | localhost:5432        |

Para detener todos los servicios:

```bash
docker compose down
```

Para detener y eliminar los volúmenes (reiniciar la DB):

```bash
docker compose down -v
```

---

## ⚙️ Variables de Entorno

### Backend

| Variable                     | Descripción                          | Valor por defecto                         |
| ---------------------------- | ------------------------------------ | ----------------------------------------- |
| `SPRING_DATASOURCE_URL`      | URL JDBC de PostgreSQL               | `jdbc:postgresql://localhost:5432/pos_db` |
| `SPRING_DATASOURCE_USERNAME` | Usuario de la DB                     | `pos_user`                                |
| `SPRING_DATASOURCE_PASSWORD` | Contraseña de la DB                  | `pos_password`                            |
| `JWT_SECRET`                 | Clave secreta para firmar tokens JWT | `pos-system-super-secret-key-2024-...`    |
| `PORT`                       | Puerto del servidor                  | `8080`                                    |

### Frontend

| Variable       | Descripción                            |
| -------------- | -------------------------------------- |
| `VITE_API_URL` | URL base del backend (para producción) |

---

## 📡 API Reference

### Autenticación

```http
POST /api/auth/login
Content-Type: application/json

{ "username": "admin", "password": "admin123" }
```

**Respuesta:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "admin",
  "role": "ADMIN"
}
```

Todos los endpoints protegidos requieren:

```http
Authorization: Bearer <token>
```

### Endpoints principales

| Método   | Endpoint                 | Descripción         |
| -------- | ------------------------ | ------------------- |
| `POST`   | `/api/auth/login`        | Obtener token JWT   |
| `GET`    | `/api/products`          | Listar productos    |
| `POST`   | `/api/products`          | Crear producto      |
| `PUT`    | `/api/products/{id}`     | Actualizar producto |
| `DELETE` | `/api/products/{id}`     | Eliminar producto   |
| `GET`    | `/api/sales`             | Listar ventas       |
| `POST`   | `/api/sales`             | Registrar venta     |
| `PUT`    | `/api/sales/{id}/cancel` | Cancelar venta      |
| `GET`    | `/api/customers`         | Listar clientes     |
| `POST`   | `/api/customers`         | Crear cliente       |
| `GET`    | `/api/expenses`          | Listar gastos       |
| `POST`   | `/api/expenses`          | Registrar gasto     |
| `GET`    | `/api/dashboard`         | KPIs y estadísticas |
| `GET`    | `/api/categories`        | Listar categorías   |

---

## 🔄 CI/CD Pipeline

```
Push a main / PR
       │
       ▼
┌─────────────────────────────────────────────────┐
│              GitHub Actions                      │
│                                                  │
│  ┌───────────┐  ┌───────────┐  ┌─────────────┐ │
│  │ Backend   │  │ Frontend  │  │   Docker    │ │
│  │ Java 17   │  │ Node 24   │  │   Build &   │ │
│  │ Maven test│  │ tsc + vite│  │   Push ghcr │ │
│  └─────┬─────┘  └─────┬─────┘  └──────┬──────┘ │
│        └──────────────┴────────────────┘        │
│                       │                          │
│              ┌────────▼────────┐                │
│              │   ci-success    │                │
│              │ (all jobs pass) │                │
│              └─────────────────┘                │
└─────────────────────────────────────────────────┘
                       │
           Push a ghcr.io (solo en main)
    ghcr.io/mateor32/pos-backend:latest
    ghcr.io/mateor32/pos-frontend:latest
```

---

## 🧪 Tests

El proyecto incluye **28 tests unitarios** con JUnit 5 y Mockito:

```
backend/src/test/java/com/pos/service/
├── AuthServiceTest.java       # Tests de autenticación y JWT
├── CustomerServiceTest.java   # Tests de gestión de clientes
└── ProductServiceTest.java    # Tests de inventario y stock
```

**Ejecutar todos los tests:**

```bash
cd backend
mvn test
```

**Ver reporte HTML:**

```
backend/target/surefire-reports/
```

---

## 🔑 Credenciales por Defecto

> ⚠️ Cambiar estas credenciales antes de un despliegue en producción real.

| Usuario   | Contraseña   | Rol           | Acceso                        |
| --------- | ------------ | ------------- | ----------------------------- |
| `admin`   | `admin123`   | Administrador | Acceso total                  |
| `gerente` | `gerente123` | Gerente       | Sin configuración de usuarios |
| `cajero`  | `cajero123`  | Cajero        | Solo POS y clientes           |

---

## 📁 Estructura del Proyecto

```
pos-system/
├── .github/
│   └── workflows/
│       └── ci.yml              # Pipeline CI/CD (tests + Docker)
├── backend/
│   ├── Dockerfile              # Multi-stage: Maven → JRE 17
│   ├── pom.xml                 # Dependencias Maven
│   └── src/main/java/com/pos/
│       ├── PosApplication.java
│       ├── config/             # Security, JWT, CORS, DataInitializer
│       ├── controller/         # REST endpoints (7 controllers)
│       ├── dto/                # Request/Response DTOs
│       ├── entity/             # JPA entities (8 tablas)
│       ├── exception/          # GlobalExceptionHandler
│       ├── repository/         # JPA repositories con queries custom
│       └── service/            # Lógica de negocio (7 servicios)
├── frontend/
│   ├── Dockerfile              # Multi-stage: Node → Nginx
│   ├── nginx.conf              # Proxy /api → backend:8080
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── components/         # Layout, Sidebar, UI components
│       ├── pages/              # 8 páginas principales
│       ├── services/           # Axios API clients
│       ├── store/              # Zustand (auth, cart)
│       ├── types/              # TypeScript interfaces
│       └── utils/              # Formatters
├── docker-compose.yml          # PostgreSQL + Backend + Frontend
├── init-db.sql                 # Script de creación de DB
└── README.md
```

---

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

---

<div align="center">

Desarrollado por [mateor32](https://github.com/mateor32)

</div>
