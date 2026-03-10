# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre
WORKDIR /app
# ✅ Copy the specific jar from the build stage
COPY --from=build /app/target/zastra-0.0.1-SNAPSHOT.jar app.jar

# ✅ Use the PORT environment variable provided by Render
ENV PORT=8080
EXPOSE 8080

# ✅ Start the app and force the port
ENTRYPOINT ["java", "-jar", "app.jar", "--server.port=8080"]