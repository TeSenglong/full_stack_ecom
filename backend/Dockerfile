FROM eclipse-temurin:25-jdk-jammy AS build

WORKDIR /workspace

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw \
    && ./mvnw --batch-mode -DskipTests dependency:go-offline

COPY src src
RUN ./mvnw --batch-mode -DskipTests package

FROM eclipse-temurin:25-jre-jammy

RUN groupadd --system appuser \
    && useradd --system --gid appuser --no-create-home appuser

WORKDIR /app

COPY --from=build --chown=appuser:appuser \
    /workspace/target/backend-0.0.1-SNAPSHOT.jar app.jar

USER appuser

EXPOSE 8080

ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70.0 -XX:+UseSerialGC"

ENTRYPOINT ["java", "-jar", "app.jar"]
