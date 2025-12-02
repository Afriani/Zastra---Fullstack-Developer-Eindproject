# Zastra - Installation and Setup

#### This provides step-by-step instructions to run the Zastra backend and frontend side-by-side in IntelliJ (or from CLI/Docker). It includes the previous backend setup instructions plus cleas steps to add the frontend module and create a compound Run/Debug configuration named "Zastra Full Stack" so you can start both together in one click.

---

## Table of Contents

1. About Zastra
2. Requirements
3. Step-by-Step Installation
4. Test Users
5. Testing the API with Postman
6. API Overview
7. Troubleshooting
8. Quick Start Summary

---

 1. About Zastra
---
**Zastra** is a full-stack application with:

- Backend: Spring Boot (multi-datasource: zastra_db + media_db)
- Frontend: JavaScript framework (frontend module in the repo)
- SQL DDL and DML scripts are stored in backend resources:
C:\Users\Roy\IdeaProjects\Zastra\backend\src\main\resources
---

# 2. Requirements
---
Make sure the following software is installed:

**System**

| Software          | Purpose                    | Download                                           |
|-------------------|----------------------------|----------------------------------------------------|
| **Java 17+**      | Runs the application       | [Adoptium](https://adoptium.net)                   |
| **Maven**         | Dependency management      | [Maven](https://maven.apache.org/install.html)     |
| **PostgreSQL**    | Database engine            | [PostgreSQL](https://www.postgresql.org/download/) |
| **Postman**       | API testing interface      | [Postman](https://www.postman.com/downloads/)      |
| **Git**           | Code version control       | [Git](https://git-scm.com/)                        |
| **IntelliJ IDEA** | Run and Debug instructions | [IntelliJ](https://blog.jetbrains.com/idea/2025/11/spring-boot-4/)                   |

**Files present in repo (important)**
backend/src/main/resources/schema-zastra.sql
backend/src/main/resources/data-zastra.sql
backend/src/main/resources/schema-media.sql
backend/src/main/resources/data-media.sql

---

# 3. Step-by-step Installation
---
Below are two recommended approaches. Pick A (automatic seeding from app) or B (manual import using psql). Also included: instructions to create the IntelliJ compound Run/Debug configuration named "Zastra Full Stack".

**Most important things to do BEFORE running the app**

1. Ensure PostgreSQL is installed and running.
2. Create the two databases and matching DB users (or configure connection properties to your existing DB users).
3. Decide how to import the data:
   * If you want the Spring initializer to run DDL/DML automatically at startup, replace data dumps with INSERT-style SQL (pg_dump --inserts) or ensure the SQL files contain plain INSERTs. ResourceDatabasePopulator cannot reliably run pg_dump COPY/LO blocks.
   * Otherwise, import the provided SQL using psql (recommended if you want to keep the current dump format).
4. Ensure the application uses the correct profile (e.g., dev) that points to the DBs in application-dev.yml.

**Option A (Recommended if you want a 1-click app start with database seeding by Spring)**
1. Re-export data as INSERT statements (on the machine where the DB was created):
```bash
pg_dump --data-only --inserts -U <pg_user> -d zastra_db -f data-zastra-inserts.sql
```
2. Replace backend/src/main/resources/data-zastra.sql with the new file (inspect it first).
3. Confirm schema-zastra.sql is in resources (schema file should be plain CREATE TABLE statements without ownership statements that require superuser).
4. Confirm your Spring Boot properties use spring.jpa.hibernate.ddl-auto=none (or validate) so Hibernate doesn't try to change schema.
5. Start the app (see IntelliJ or CLI steps below) — the MultiDataSourceInitializer (if configured) will run schema and data SQL from resources.

**Option B (Recommended if you want to import the existing pg_dump with COPY/LO)**
1. Create DBs & users (run as postgres superuser):
```bash 
  psql -U postgres -c "CREATE DATABASE zastra_db;"
  psql -U postgres -c "CREATE DATABASE media_db;"
  psql -U postgres -c "CREATE USER zastra_user WITH PASSWORD 'zastra_password';"
  psql -U postgres -c "CREATE USER media_user  WITH PASSWORD 'media_password';"
  psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE zastra_db TO zastra_user;"
  psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE media_db TO media_user;"
```
2. Import schema and data using psql (psql understands COPY and pg large-object commands):
```bash 
  psql -U zastra_user -d zastra_db -f schema-zastra.sql
  psql -U zastra_user -d zastra_db -f data-zastra.sql
  psql -U media_user  -d media_db  -f schema-media.sql
  psql -U media_user  -d media_db  -f data-media.sql
```
3. Then run the Spring Boot app. The app will connect to the already-populated DBs.

**Backend configuration / application-dev.yml example**

Check and make sure this is already in backend/src/main/resources/application-dev.yml (adjust credentials & ports):
```bash 
  spring:
    profiles: dev

    zastra:
      datasource:
        url: jdbc:postgresql://localhost:5432/zastra_db
        username: zastra_user
        password: change_me
        driver-class-name: org.postgresql.Driver
        ddl-auto: none

    media:
      datasource:
        url: jdbc:postgresql://localhost:5432/media_db
        username: media_user
        password: media_secret
        driver-class-name: org.postgresql.Driver
        ddl-auto: none

  # Hibernate: do not alter schema if using sql scripts
  spring.jpa:
    hibernate:
      ddl-auto: none
```
Make sure your datasource config classes read the properties shown above.

**Build & Run (CLI)**

Backend (Maven):
```bash 
  cd backend
  mvn clean package
  # Run with profile dev
  mvn spring-boot:run -Dspring-boot.run.profiles=dev
  # OR
  java -jar target/zastra-backend.jar --spring.profiles.active=dev
```
Frontend:
```bash 
  cd frontend
  npm install
  npm run start   # or `yarn` / `yarn start`
```
Note: mvn clean package packages the app but does not change your DB contents.

**Run both in IntelliJ: Create “Zastra Full Stack” compound**

1. Create individual run configurations:
    * Backend (Spring Boot / Application): set working dir to backend, Program args: --spring.profiles.active=dev (or set Env var SPRING_PROFILES_ACTIVE=dev). Confirm VM & classpath are correct.
    * Frontend (npm/yarn): Tools -> External Tools or use an npm Run Configuration pointing to start.
2. Create a Compound run configuration:
   * Run -> Edit Configurations -> click + -> Compound
   * Name: Zastra Full Stack
   * Add Backend and Frontend run configurations to the compound.
3. Start the compound. IntelliJ will start both processes. Use Run window to monitor logs.

**Important:** Ensure backend and frontend ports don't conflict. Backend default, e.g., 8080. Frontend dev server default, e.g., 3000. If you use proxies in frontend, confirm proxy target matches backend port.


### If you successfully download: 
    * schema-zastra.sql,
    * schema-media.sql, 
    * data-zastra.sql,
    * data-media.sql**
the application automatically creates these users on first startup:

| **first name** | **last name** | **email**                      | **password**     | **role**    |
|----------------|---------------|--------------------------------|------------------|-------------|
| **Roy**        | **Anderson**  | **roy@example.com**            | CitizenPass123!  | **Citizen** |
| **Alice**      | **Smith**     | **alice.smith@example.com**    | CitizenPass123!  | **Citizen** |
| **Bob**        | **Johnson**   | **bob.johnson@example.com**    | CitizenPass123!  | **Citizen** |
| **Eva**        | **Green**     | **eva.green@zastra.com**       | OfficerPass123!! | *Officer**  |
| **Oscar**      | **Polman**    | **oscar.polman@zastra.com**    | OfficerPass123!  | **Officer** 
| **Lindaria**   | **Purba**     | **lindaria.purba@ezastra.com** | AdminPass123!    | **citizen** |


---

# 4. Test Users
--
Important: The repo data file contains bcrypt password hashes — those are not reversible. Either provide the docent with plaintext passwords used to create those hashes or create a demo user with a known password.

**Quick demo user SQL (replace <BCRYPT_HASH> with an actual hash)**
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
    '<BCRYPT_HASH>',
    'ADMIN',
    now(),
    true, true, true, true,
    '1', '00000', 'Demo Street', '1990-01-01',
    'other', 'DEMOTEST0001', '+0000000000',
    'DemoCity', 'DemoProvince', '/images/default/male.png',
    NULL, NULL, NULL
);

-- ensure sequence is set to avoid collisions
SELECT setval('public.users_id_seq', GREATEST((SELECT COALESCE(MAX(id),0) FROM public.users), 999), true);
```

How to generate the bcrypt hash for the demo password:

Java (run in a small main class or inside project):
```bash
  import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
    public class BcryptGen {
    public static void main(String[] args) {
      BCryptPasswordEncoder enc = new BCryptPasswordEncoder(12);
      System.out.println(enc.encode("Password123!"));
  }
}
```
---

# 5. Testing the API with Postman
---
1. Start backend (profile dev). Backend base URL default: http://localhost:8080.
2. Common endpoints to test:
   * POST /api/auth/login
   * Body (JSON): { "username": "demo@zastra.local", "password": "Password123!" }
   * Expected: JWT or session depending on your auth setup.
   * POST /api/auth/register (if present) — create new user.
   * GET /api/users/me — test with Authorization header Bearer <token> (if JWT).
3. Example Postman steps:
   * Create request to POST /api/auth/login
   * Body -> raw -> JSON -> { "username": "demo@zastra.local", "password": "Password123!" }
   * Send -> capture token (if returned) and add to subsequent requests' Authorization header.

Include sample Postman collection (optional) in repo if you want to automate tests.

---
# 6. API Overview
---
1. Auth / registration
   * POST /api/auth/login
        1. Body (application/json): LoginRequest
            Example:
            ```bash
              { "email": "demo@zastra.local", "password": "Password123!" }
            ```
        2. Returns: ApiResponse (token/session)
   * POST /api/auth/register
        1. Body: RegisterRequest (see required fields in schema; includes many user fields)
   * POST /api/auth/forgot-password
        1. Body: { "email": "..." } (string map)
   * POST /api/auth/reset-password
                  Body: ResetPasswordRequest: { "token": "...", "newPassword": "..." }
   * GET /api/auth/verify?token= — verify email
   * OAuth endpoints:
     1. GET /api/auth/google and GET /api/auth/google/callback?code=...
     2. GET /api/auth/facebook and GET /api/auth/facebook/callback?code=...

2. Users:
   * GET /api/users — list users (admin)
   * GET /api/users/{id} — get user
   * PUT /api/users/{id} — update
3. Media:
   * GET /api/media/{id} — retrieve media
   * POST /api/media — upload media (multipart)

For more APIs Overview you could check on: C:\Users\Roy\IdeaProjects\Zastra\api-docs.pdf

---
# 7. Troubleshooting
---
Problems & fixes:

1. DB connection refused / could not connect:
   * Verify PostgreSQL is running and port (5432) is open.
   * Verify DB url, username, password in application-dev.yml match PostgreSQL users.
   * Try psql -h localhost -U zastra_user -d zastra_db to confirm connectivity.


2. SQL import fails with COPY or lo_create errors when running through Spring:
    * Reason: ResourceDatabasePopulator over JDBC cannot process pg_dump COPY ... FROM stdin or large object (lo_create/lowrite) sequences.
    * Fix: Import using psql (see Option B) OR re-export dumps with --inserts to generate plain INSERT statements and use Option A.


3. Login fails with "bad credentials":
    * Ensure the stored password is bcrypt and the plaintext being used by the docent matches the original password that produced the hash.
    * If unsure, create a demo user with a known password using the demo SQL above.


4. Port in use:
    * Change server.port in application-dev.yml or kill process listening on that port (Windows: use netstat -ano & taskkill /PID <pid> /F).


5. IntelliJ run config doesn’t start frontend:
    * Confirm the frontend run configuration is set to run the correct npm or yarn command and correct working directory (frontend folder).
    * For npm: set npm executable and start script.


6. Hibernate schema changes when you don't want them:
    * Ensure spring.jpa.hibernate.ddl-auto is set to none or validate in dev properties. If update is set, Hibernate may alter schema.


7. Large object / media not found after import:
    * If you used a partial data import (e.g., skipped LO import), media LOs might be missing. Use full pg_dump + psql import if you need LOs.
---

# 8. Quick Start Summary
---
1. Install JDK, Maven, Node.js, and PostgreSQL.


2. Create databases & users:
```bash
   psql -U postgres -c "CREATE DATABASE zastra_db;"
````   
```bash
   psql -U postgres -c "CREATE DATABASE media_db;"
```   
   
```bash
   psql -U postgres -c "CREATE USER zastra_user WITH PASSWORD 'zastra_password';"
```
```bash
   psql -U postgres -c "CREATE USER media_user  WITH PASSWORD 'media_password';"
```   
```bash
   psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE zastra_db TO zastra_user;"
```

```bash  
   psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE media_db TO media_user;"
```


3. Import DB data:
   * Recommended: use psql to import the provided SQL files:
    ```bash
    psql -U zastra_user -d zastra_db -f schema-zastra.sql
    ```
   
    ```bash
   psql -U zastra_user -d zastra_db -f data-zastra.sql
   ```
   
    ```bash
   psql -U media_user  -d media_db  -f schema-media.sql
   ```

    ```bash
   psql -U media_user  -d media_db  -f data-media.sql
   ```
   * OR: replace data-zastra.sql with a --inserts export and let Spring run the scripts at startup.


4. Check backend/src/main/resources/application-dev.yml with DB credentials and ensure ddl-auto: none.


5. Build and run:
```bash
  cd backend
  mvn clean package
  mvn spring-boot:run -Dspring-boot.run.profiles=dev

# then
  cd ../frontend
  npm install
  npm run start
```


6. (IntelliJ) Create Run configurations for Backend and Frontend, then create a Compound named Zastra Full Stack and add both configs — run the compound.


7. Use Postman to POST to /api/auth/login with provided test credentials or the demo user you inserted.

---
