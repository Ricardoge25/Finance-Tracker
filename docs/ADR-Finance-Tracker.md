# Finance Tracker - Architecture Decision Record (ADR)

## Objetivo

Construir una aplicación Full Stack moderna para la gestión de finanzas
personales con fines de aprendizaje profesional y portafolio.

## Objetivos de aprendizaje

-   Comprender el ecosistema moderno de JavaScript/TypeScript.
-   Aprender **por qué** existe cada tecnología antes de utilizarla.
-   Construir una aplicación con arquitectura profesional.
-   Comparar continuamente el ecosistema Node.js con Python/Django.
-   Desarrollar criterio arquitectónico para entrevistas técnicas.

------------------------------------------------------------------------

# Stack Tecnológico

## Frontend

-   Next.js
-   React
-   TypeScript

## Backend

-   Node.js
-   Express
-   TypeScript

## Base de datos

-   PostgreSQL
-   Prisma ORM

## Infraestructura

-   Docker
-   Docker Compose
-   Git
-   GitHub

------------------------------------------------------------------------

# Arquitectura

Se utilizará un **Monolito Modular**.

No se implementarán microservicios inicialmente. La aplicación se
diseñará para poder evolucionar hacia ellos si el crecimiento del
producto lo requiere.

Estructura inicial:

``` text
finance-tracker/
│
├── frontend/
├── backend/
├── docker-compose.yml
├── README.md
├── .gitignore
└── docs/
```

------------------------------------------------------------------------

# Módulos

-   Auth
-   Users
-   Accounts
-   Transactions
-   Budgets
-   Goals
-   Dashboard
-   AI

------------------------------------------------------------------------

# Entidades

-   User
-   Account
-   Transaction
-   Budget
-   Category
-   SavingGoal

------------------------------------------------------------------------

# Metodología

Antes de usar una tecnología responderemos siempre:

1.  ¿Qué hace?
2.  ¿Por qué existe?
3.  ¿Qué problema resuelve?
4.  ¿Qué ocurriría si no la utilizáramos?

No se copiarán comandos sin comprenderlos.

------------------------------------------------------------------------

# Roadmap

## Sprint 0

-   Arquitectura
-   Diseño del producto
-   Conceptos fundamentales

## Sprint 1

-   Setup del proyecto
-   Git
-   npm
-   package.json
-   TypeScript
-   Docker

## Sprint 2

-   Backend con Express
-   Prisma
-   PostgreSQL

## Sprint 3

-   Frontend con Next.js
-   React
-   Consumo de API

## Sprint 4

-   Funcionalidades de negocio

## Sprint 5

-   Testing
-   Optimización
-   Docker
-   Despliegue
-   Preparación para entrevistas

------------------------------------------------------------------------

# Filosofía

No buscamos únicamente terminar un proyecto.

Buscamos comprender profundamente el funcionamiento del ecosistema para
poder diseñar, justificar y defender decisiones técnicas en proyectos
reales y entrevistas.
