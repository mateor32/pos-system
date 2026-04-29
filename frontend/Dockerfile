# ══════════════════════════════════════════════
# ETAPA 1 — BUILD
# Node.js compila TypeScript y empaqueta React con Vite.
# ══════════════════════════════════════════════
FROM node:20-alpine AS build

WORKDIR /app

# Igual que el backend: copiamos package.json primero
# para que Docker cachee la capa de dependencias.
COPY package*.json ./
RUN npm ci

# Copiamos el resto del código y construimos
COPY . .
RUN npm run build

# ══════════════════════════════════════════════
# ETAPA 2 — RUNTIME
# Nginx ultra-liviano para servir los archivos estáticos
# que generó Vite en /app/dist
# ══════════════════════════════════════════════
FROM nginx:alpine

# Eliminamos la config default de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiamos nuestra config que incluye el proxy hacia el backend
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copiamos el build de React
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
