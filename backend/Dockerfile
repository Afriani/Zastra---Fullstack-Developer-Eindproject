# Stage 1: Build Java app
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Run Java app + Nginx
FROM eclipse-temurin:17-jre

# Install nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Copy jar
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

# Start both Nginx and Spring Boot
CMD service nginx start && java -jar app.jar --server.port=8080