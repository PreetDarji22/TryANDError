# StackIt Database Setup

This folder contains the database schema for the **StackIt** application, configured for PostgreSQL.

## Prerequisites
- PostgreSQL installed and running.
- A database client (like pgAdmin, DBeaver, or psql CLI) installed.

## Setup Instructions

1. **Create the Database**
   Log into your PostgreSQL instance and create a new database for StackIt:
   ```sql
   CREATE DATABASE stackit;
   ```

2. **Run the Schema Script**
   Connect to the `stackit` database and execute the `schema.sql` file.

   Using `psql` from your terminal:
   ```bash
   psql -U your_postgres_user -d stackit -f schema.sql
   ```
   *(Replace `your_postgres_user` with your actual PostgreSQL username)*

3. **Run the Seed Script (Optional but Recommended)**
   To insert dummy data (users, questions, answers, tags, etc.) for testing, run the `seed.sql` script:
   ```bash
   psql -U your_postgres_user -d stackit -f seed.sql
   ```

4. **Verify Tables and Data**
   Once the scripts run successfully, you should see the following tables created and populated:
   - `users`
   - `questions`
   - `tags`
   - `question_tags`
   - `answers`
   - `votes`
   - `comments`
   - `notifications`

## ORM Integration
If you later decide to use an ORM (like Prisma, TypeORM, or Sequelize) in your backend, you can introspect this existing database schema to automatically generate your ORM models.
