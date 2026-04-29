# ══════════════════════════════════════════════
# ETAPA 1 — BUILD
# Usa la imagen oficial de Maven con JDK 17.
# Aquí compilamos y empaquetamos el proyecto.
# ══════════════════════════════════════════════
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero solo el pom.xml y descargamos dependencias.
# Docker guarda esta capa en caché, así que si no cambia el pom.xml
# no vuelve a descargar internet en cada build (enorme ahorro de tiempo).
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Ahora copiamos el código fuente y compilamos
COPY src ./src
RUN mvn package -DskipTests -B

# ══════════════════════════════════════════════
# ETAPA 2 — RUNTIME
# Imagen mucho más pequeña: solo JRE, sin Maven ni fuentes.
# El artefacto .jar que generó la etapa 1 se copia aquí.
# ══════════════════════════════════════════════
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copiamos solo el .jar generado
COPY --from=build /app/target/*.jar app.jar

# Exponemos el puerto 8080 (informativo, no abre el puerto solo)
EXPOSE 8080

# Variables de entorno con valores por defecto.
# Se sobreescriben desde docker-compose o al correr el contenedor.
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/pos_db \
    SPRING_DATASOURCE_USERNAME=pos_user \
    SPRING_DATASOURCE_PASSWORD=pos_password \
    JWT_SECRET=pos-system-super-secret-key-2024-must-be-256-bits-long-enough \
    JWT_EXPIRATION=86400000

# Comando de inicio
ENTRYPOINT ["java", "-jar", "app.jar"]
