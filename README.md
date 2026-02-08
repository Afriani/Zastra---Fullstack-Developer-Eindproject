# Zastra - Installation and Setup

#### This provides step-by-step instructions to run the **Zastra** backend and frontend side-by-side in IntelliJ IDEA (or from CLI).It includes database setup, backend/frontend configuration, and instructions to create a compound Run/Debug configuration named **"Zastra Full Stack"** so you can start both with one click.

---

## Table of Contents

1. [About Zastra](#1-about-zastra)
2. [Requirements](#2-requirements)
3. [Quick Start Summary](#3-quick-start-summary)
4. [Step-by-Step Installation](#4-step-by-step-installation)
5. [Test Users](#5-test-users)
6. [Testing the API with Postman](#6-testing-the-api-with-postman)
7. [API Overview](#7-api-overview)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. About Zastra

**Zastra** is a full-stack application with:

- ***Backend:*** Spring Boot (multi-datasource: `zastra_db` + `media_db`)
- ***Frontend:*** JavaScript framework (React/Vue/Angular - frontend module in the repo)
- **Database:** PostgreSQL with pre-seeded data
- ***SQL scripts:*** Stored in `/db` folder (NOT in `src/main/resources`)
---

## 2. Requirements

Make sure the following software is installed:

### System

| Software          | Purpose                    | Download                                                                               |
|-------------------|----------------------------|----------------------------------------------------------------------------------------|
| **Java 17+**      | Runs the application       | [Oracle](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) |
| **Maven**         | Dependency management      | [Maven](https://maven.apache.org/install.html)                                         |
| **PostgreSQL**    | Database engine            | [PostgreSQL](https://www.postgresql.org/download/)                                     |
| **Postman**       | API testing interface      | [Postman](https://www.postman.com/downloads/)                                          |
| **Git**           | Code version control       | [Git](https://git-scm.com/)                                                            |
| **IntelliJ IDEA** | Run and Debug instructions | [IntelliJ](https://blog.jetbrains.com/idea/2025/11/spring-boot-4/)                     |

---

## 3. Quick Start Summary

**For users who want to get started immediately:**

### Step 1: Clone the repository
```bash
  git clone <your-repo-url>
  cd Zastra
```

### Step 2: Create databases and users
```bash
    psql -U postgres -f init-databases.sql
```
This creates both zastra_db and media_db with their respective users.

### Step 3: Import database schema and data
```bash
    psql -U zastra_user -d zastra_db -f db/schema-zastra.sql
    psql -U zastra_user -d zastra_db -f db/data-zastra.sql
    psql -U media_user  -d media_db  -f db/schema-media.sql
    psql -U media_user  -d media_db  -f db/data-media.sql
```

### Step 4: Start the backend
```bash
  cd backend
  mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Step 5: Start the frontend (in a new terminal)
```bash
  cd frontend
  npm install
  npm start
```

### Step 6: Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
---

## 4. Step-by-step Installation

### 4.1 Prerequisites
1. Ensure PostgreSQL is installed and running
```bash
  # Check if PostgreSQL is running
    psql --version

  # Start PostgreSQL (if not running)
  # Windows: Start via Services or pgAdmin
  # macOS: brew services start postgresql
  # Linux: sudo systemctl start postgresql
```
2. Verify Java and Maven
```bash
  java -version    # Should show Java 17+
  mvn -version     # Should show Maven 3.8+
```

3. Verify Node.js
```bash
  node -v          # Should show v18+
  npm -v
```
### 4.2 Database Setup
### Option A: Automated Setup (Recommended)
**Step 1: Create databases and users**
```bash
  psql -U postgres -f init-databases.sql
```
**Step 2: Import schema and data using psql**
```bash
  psql -U zastra_user -d zastra_db -f db/schema-zastra.sql
  psql -U zastra_user -d zastra_db -f db/data-zastra.sql
  psql -U media_user  -d media_db  -f db/schema-media.sql
  psql -U media_user  -d media_db  -f db/data-media.sql
```
Why use psql instead of Spring Boot?
- The SQL files contain PostgreSQL-specific commands (COPY ... FROM stdin, lo_create, large objects)
- Spring Boot's ResourceDatabasePopulator cannot execute these commands
- psql is the native PostgreSQL client and handles all dump formats correctly

### Option B: Manual Setup (Alternative)
If you prefer to create databases manually:

```bash 
  # Connect to PostgreSQL
    psql -U postgres

  # Create databases
    CREATE DATABASE zastra_db;
    CREATE DATABASE media_db;

  # Create users
    CREATE USER zastra_user WITH PASSWORD 'change_me';
    CREATE USER media_user WITH PASSWORD 'media_secret';

  # Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE zastra_db TO zastra_user;
    GRANT ALL PRIVILEGES ON DATABASE media_db TO media_user;

  # Exit
    \q
```
Then import the SQL files as shown in Option A, Step 2.

### 4.3 Backend Configuration

Check backend/src/main/resources/application.yml:

```yaml
  spring:
  application:
    name: Zastra

  profiles:
    active: dev

  # Disable default DataSource auto-config
  autoconfigure:
    exclude:
      - org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration

  datasource:
    zastra:
      url: jdbc:postgresql://localhost:5432/zastra_db
      username: zastra_user
      password: change_me
      driver-class-name: org.postgresql.Driver
      hikari:
        maximum-pool-size: 20
        minimum-idle: 5
        connection-timeout: 30000

    media:
      url: jdbc:postgresql://localhost:5432/media_db
      username: media_user
      password: media_secret
      driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: none  # IMPORTANT: Do not let Hibernate modify schema
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

  server:
    port: 8080
```
## Important:

- ddl-auto: none prevents Hibernate from modifying your database schema
- Passwords should match those in init-databases.sql
- Setup voor beoordeling:
  De benodigde API keys voor Google en Facebook login zijn te vinden in de bijgevoegde map config-secrets/credentials.txt (alleen in de ZIP-versie). Kopieer deze naar je environment variables of application.yml om de OAuth-functies te testen. Anders, je kan jouw OAuthGoogle code en Facebook Clien ID zelf maken via Google Cloud console and Meta for Developer en volgens zijn instructies om jou Client_ID te maken en CLIENT_PASSWORD te genereren.


### 4.4 Running the Application
#### CLI Method

Backend:
```bash 
  cd backend
  mvn clean install
  mvn spring-boot:run -Dspring-boot.run.profiles=dev
```
Frontend:
```bash 
  cd frontend
  npm install
  npm start
```

#### IntelliJ IDEA Method

**Step 1: Create Backend Run Configuration**
1. Open IntelliJ IDEA
2. Go to Run → Edit Configurations 
3. Click + → Spring Boot 
4. Configure:
   - Name: Zastra Backend
   - Main class: Your @SpringBootApplication class (e.g., com.zastra.ZastraApplication)
   - Working directory: PROJECT_DIR/backend
   - Program arguments: --spring.profiles.active=dev
   - Use classpath of module: backend
5. Click Apply

**Step 2: Create Frontend Run Configuration**
1. Go to Run → Edit Configurations
2. Click + → npm
3. Configure:
   - Name: Zastra Frontend
   - Package.json: <project-root>/frontend/package.json
   - Command: run
   - Scripts: start
4. Click Apply

**Step 3: Create Compound Configuration**
1. Go to Run → Edit Configurations
2. Click + → Compound
3. Configure:
   - Name: Zastra Full Stack
   - Click + and add:
     - Zastra Backend
     - Zastra Frontend
4. Click Apply → OK

**Step 4: Run**

Click the Run button next to "Zastra Full Stack" — both backend and frontend will start together!

---

# 5. Test Users

After successfully importing the database, the following test users are available:

| **first name** | **last name** | **email**                      | **password**    | **role**    |
|----------------|---------------|--------------------------------|-----------------|-------------|
| **Roy**        | **Anderson**  | **roy@example.com**            | CitizenPass123! | **Citizen** |
| **Alice**      | **Smith**     | **alice.smith@example.com**    | CitizenPass123! | **Citizen** |
| **Bob**        | **Johnson**   | **bob.johnson@example.com**    | CitizenPass123! | **Citizen** |
| **Eva**        | **Green**     | **eva.green@zastra.com**       | EvaPassword123  | **Officer** |
| **Oscar**      | **Polman**    | **oscar.polman@zastra.com**    | OfficerPass123! | **Officer** |
| **Lindaria**   | **Purba**     | **lindaria.purba@ezastra.com** | AdminPass123!   | **Admin**   |


### Note: 

Passwords are stored as bcrypt hashes in the database. The plaintext passwords above are provided for testing purposes only.

---
## Creating Additional Test Users

If you need to create a custom demo user:

```bash
  INSERT INTO public.users (
  id, created_at, email, enabled, first_name, last_name, password, user_role,
  updated_at, account_non_expired, account_non_locked, credentials_non_expired,
  email_verified, house_number, postal_code, street_name, date_of_birth,
  gender, national_id, phone_number, city, province, avatar_url, last_login,
  google_id, facebook_id
) VALUES (
  999,
  now(),
  'demo@zastra.local',
  true,
  'Demo',
  'User',
  '<BCRYPT_HASH>',  -- Replace with actual hash
  'ADMIN',
  now(),
  true, true, true, true,
  '1', '00000', 'Demo Street', '1990-01-01',
  'other', 'DEMOTEST0001', '+0000000000',
  'DemoCity', 'DemoProvince', '/images/default/male.png',
  NULL, NULL, NULL
);

-- Update sequence to avoid ID conflicts
SELECT setval('public.users_id_seq', GREATEST((SELECT COALESCE(MAX(id),0) FROM public.users), 999), true);
```

### Generate bcrypt hash in Java:

```bash
  import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

  public class BcryptGen {
    public static void main(String[] args) {
      BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
      System.out.println(encoder.encode("YourPassword123!"));
    }
  }
```
---

# 6. Testing the API with Postman

### 6.1.Login Test
1. Start the backend (default: http://localhost:8080)
2. Create a new POST request in Postman:
   - URL: http://localhost:8080/api/auth/login
   - Method: POST
   - Headers: Content-Type: application/json
   - Body (raw JSON):
   ```bash
      {
        "email": "roy@example.com",
        "password": "CitizenPass123!"
      }
   ```
3. Send the request
4. Expected response: JWT token or session cookie

### 6.2 Authenticated Request Test
1. Copy the JWT token from the login response
2. Create a new GET request:
   - URL: http://localhost:8080/api/users/me
   - Method: GET
   - Headers:
     - Authorization: Bearer <your-jwt-token>
3. Send the request
4. Expected response: Current user details

---
# 7. API Overview
### 7.1 Authentication Endpoints

| **Method** | **Endpoints**                   | **Description**             | **Body**                                 |
|------------|---------------------------------|-----------------------------|------------------------------------------|
| **POST**   | **/api/auth/login**             | **User login**              | { "email": "...", "password": "..." }    |
| **POST**   | **/api/auth/register**          | **User registration**       | RegisterRequest (see schema)             |
| **POST**   | **/api/auth/forgot-password**   | **Request password reset**  | { "email": "..." }                       |
| **POST**   | **/api/auth/reset-password**    | **Reset password**          | { "token": "...", "newPassword": "..." } |
| **GET**    | **/api/auth/verify?token=...**  | **Verify email**            | -                                        |
| **GET**    | **/api/auth/google**            | **Google OAuth login**      | -                                        |
| **GET**    | **/api/auth/google/callback**   | **Google OAuth callback**   | -                                        |
| **GET**    | **/api/auth/facebook**          | **Facebook OAuth login**    | -                                        |
| **GET**    | **/api/auth/facebook/callback** | **Facebook OAuth callback** | -                                        |

### 7.2 User Endpoints
| **Method** | **Endpoints**       | **Description**       | **Auth Required** |
|------------|---------------------|-----------------------|-------------------|
| **GET**    | **/api/users**      | **List all users**    | Admin             |
| **GET**    | **/api/users/{id}** | **Get user by ID**    | Yes               |
| **PUT**    | **/api/users/{id}** | **Update user**       | Yes               |
| **GET**    | **/api/users/me**   | **Get current user**  | Yes               |

### 7.3 Media Endpoints
| **Method** | **Endpoints**       | **Description**      | **Auth Required** |
|------------|---------------------|----------------------|-------------------|
| **GET**    | **/api/media/{id}** | **Get media by ID**  | Yes               |
| **POST**   | **/api/media**      | **Upload media**     | Yes               |

#### For complete API documentation, see: api-docs.pdf or Open-API.pdf in the project root.

---

# 8. Troubleshooting

### 8.1 Database Connection Issues

**Problem:** Connection refused or could not connect to server

**Solutions:**
- Verify PostgreSQL is running:
```bash
  # Windows
  services.msc → PostgreSQL service should be "Running"

  # macOS
  brew services list

  # Linux
  sudo systemctl status postgresql
```
- Check port 5432 is not blocked by firewall
- Test connection manually:
```bash
  psql -h localhost -U zastra_user -d zastra_db
```
- Verify credentials in application.yml match init-databases.sql

---

### 8.2 SQL Import Errors

**Problem:** COPY ... FROM stdin or lo_create errors when running through Spring

**Cause:** Spring Boot's ResourceDatabasePopulator cannot process PostgreSQL dump formats

**Solution:** Always use psql to import the SQL files:
```bash
  psql -U zastra_user -d zastra_db -f db/schema-zastra.sql
  psql -U zastra_user -d zastra_db -f db/data-zastra.sql
```
---

### 8.3 "Relation does not exist" Error
**Problem:** ERROR: relation "users" does not exist

**Cause:** Database schema was not imported

**Solution:**
1. Verify databases exist:
```bash
  psql -U postgres -l | grep -E "zastra_db|media_db"
```
2. Re-import schema:
```bash
  psql -U zastra_user -d zastra_db -f db/schema-zastra.sql
```
---

### 8.4 "Connection is closed" Error

**Problem:** java.sql.SQLException: Connection is closed

**Causes:**
- Database doesn't exist
- User doesn't have proper permissions
- Wrong credentials in application.yml

**Solutions:**
1. Run init-databases.sql if you haven't:
```bash
  psql -U postgres -f init-databases.sql
```

2. Verify databases exist:
```bash
  psql -U postgres -l
```

3. Check credentials match between *application.yml* and *init-databases.sql*

---

### 8.5 Login Fails with "Bad Credentials"
**Problem:** Login returns 401 Unauthorized

**Causes:**
- Wrong password
- Bcrypt hash mismatch
- User not in database

**Solutions:**
1. Verify user exists:
```bash
  psql -U zastra_user -d zastra_db -c "SELECT email, enabled FROM users WHERE email='roy@example.com';"
```
2. Use exact passwords from Test Users section
3. Create a new test user with known password (see Section 5)

---

### 8.6 Port Already in Use
**Problem:** Port 8080 is already in use

**Solutions:**
- Change port in application.yml:
```yaml
    server:
      port: 8081
```
- Kill process using the port
```bash
  # Windows
    netstat -ano | findstr :8080
    taskkill /PID <pid> /F
 
  # macOS/Linux
    lsof -ti:8080 | xargs kill -9
```
---

### 8.7 Frontend Won't Start
**Problem:** npm start fails or frontend doesn't load

**Solutions:**

1. Delete node_modules and reinstall:
```bash
  cd frontend
  rm -rf node_modules package-lock.json
  npm install
  npm start
```

2. Check Node.js version:
```bash
  node -v  # Should be 18+
```

3. Verify backend is running on correct port (check proxy settings in *package.json*)
---

### 8.8 Hibernate Schema Changes

**Problem:** Hibernate modifies database schema unexpectedly

**Cause:** ddl-auto is set to update or create

**Solution:** Set to none in application.yml:
```yaml
  spring:
  jpa:
    hibernate:
      ddl-auto: none
```
---

### 8.9 Large Objects / Media Not Found
**Problem:** Media files return 404 or "large object not found"

**Cause:** Large objects (LOBs) were not imported

**Solution:** Re-import data files using psql:
```bash
  psql -U media_user -d media_db -f db/data-media.sql
```
---

### 8.10 IntelliJ Run Configuration Issues
**Problem:** Compound configuration doesn't start both services

**Solutions:**
1. Verify individual configs work separately first
2. Check working directories are correct:
   - Backend: $PROJECT_DIR$/backend
   - Frontend: $PROJECT_DIR$/frontend
3. Ensure --spring.profiles.active=dev is in backend Program Arguments
4. For frontend, verify package.json path is correct

---

End of README

## 4. WHAT TO DO NOW

### Step-by-step actions:

1. **Create the `/db` folder** in your project root:
```bash
    mkdir db
```
2. Move the SQL files from backend/src/main/resources/ to /db/:
```bash
  # Windows (PowerShell)
    Move-Item backend\src\main\resources\schema-zastra.sql db\
    Move-Item backend\src\main\resources\data-zastra.sql db\
    Move-Item backend\src\main\resources\schema-media.sql db\
    Move-Item backend\src\main\resources\data-media.sql db\
```
```bash
  # macOS/Linux
  mv backend/src/main/resources/schema-zastra.sql db/
  mv backend/src/main/resources/data-zastra.sql db/
  mv backend/src/main/resources/schema-media.sql db/
  mv backend/src/main/resources/data-media.sql db/
```
3. Replace your .gitignore with the updated version above

4. Replace your README.md with the updated version above

5. Test the setup:
```bash
  # Drop existing DBs (optional - for clean test)
    psql -U postgres -c "DROP DATABASE IF EXISTS zastra_db;"
    psql -U postgres -c "DROP DATABASE IF EXISTS media_db;"

  # Create fresh
    psql -U postgres -f init-databases.sql

  # Import data
    psql -U zastra_user -d zastra_db -f db/schema-zastra.sql
    psql -U zastra_user -d zastra_db -f db/data-zastra.sql
    psql -U media_user -d media_db -f db/schema-media.sql
    psql -U media_user -d media_db -f db/data-media.sql

  # Start backend
    cd backend
    mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

6. Commit everything
```bash
  git add .
  git commit -m "Restructure project: move SQL to /db folder, update README and .gitignore"
  git push
```
---