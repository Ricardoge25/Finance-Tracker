-- 003_add_multitenancy.sql
-- Nota: la tabla `users` ya existía de una sesión anterior con esta estructura;
-- aquí solo se documenta su forma real + los cambios que sí se aplicaron en esta migración.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS user_id INTEGER NOT NULL
  REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS user_id INTEGER NOT NULL
  REFERENCES users(id) ON DELETE CASCADE;