# ==========================================
# Etapa 1: Build da aplicação (Java 21 JDK)
# ==========================================
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /app

# Copia dependências do Gradle Wrapper primeiro para cache
COPY gradlew build.gradle.kts settings.gradle.kts ./
COPY gradle ./gradle

# Garante permissão de execução do wrapper
RUN chmod +x gradlew

# Pré-carrega dependências
RUN ./gradlew dependencies --no-daemon || true

# Copia o código fonte e gera o jar executável
COPY src ./src
RUN ./gradlew bootJar --no-daemon -x test

# ==========================================
# Etapa 2: Runtime enxuto (Java 21 JRE)
# ==========================================
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Usuário sem privilégios de root por segurança
RUN useradd -m -u 1001 springuser
USER 1001

# Copia apenas o artefato final compilado
COPY --from=builder /app/build/libs/api-0.0.1-SNAPSHOT.jar app.jar

# Render define a variável PORT dinamicamente (padrão 8080)
ENV PORT=8080
EXPOSE 8080

# Otimizações de JVM para o plano Free do Render (512MB RAM):
# -XX:+UseSerialGC: Consumo mínimo de memória para GC
# -XX:MaxRAMPercentage=75.0: Deixa margem para SO e Metaspace (~380MB max heap)
# -Xss512k: Reduz overhead de memória por thread
ENTRYPOINT ["java", "-XX:+UseSerialGC", "-Xss512k", "-XX:MaxRAMPercentage=75.0", "-Dspring.profiles.active=supabase", "-jar", "app.jar"]

