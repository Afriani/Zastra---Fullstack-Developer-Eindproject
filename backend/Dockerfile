# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:17-jre
WORKDIR /app

# Install Nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Copy the jar and the nginx config
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
COPY nginx.conf /etc/nginx/nginx.conf

# Expose the port Render expects
EXPOSE 8080

# ✅ Start Nginx on 8080 and Java on 8081
# Nginx will listen on 8080 and "talk" to Java on 8081
CMD nginx -g "daemon off;" & java -jar app.jar --server.port=8081