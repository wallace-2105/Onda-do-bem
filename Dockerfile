# ==========================================
# Etapa 1: Build da aplicação (Java 21 JDK)
# ==========================================
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /app

# Copia arquivos do Gradle Wrapper do backend
COPY backend/gradlew backend/build.gradle.kts backend/settings.gradle.kts ./
COPY backend/gradle ./gradle

# Garante permissão de execução do wrapper
RUN chmod +x gradlew

# Pré-carrega dependências
RUN ./gradlew dependencies --no-daemon || true

# Copia o código fonte do backend e compila o jar
COPY backend/src ./src
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

# Otimizações de JVM para o plano Free do Render (512MB RAM) e ativação do perfil Supabase:
ENTRYPOINT ["java", "-XX:+UseSerialGC", "-Xss512k", "-XX:MaxRAMPercentage=75.0", "-Dspring.profiles.active=supabase", "-jar", "app.jar"]

