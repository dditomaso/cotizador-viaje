# 🇧🇷 Cotizador de Viajes Inteligente con IA - Break Tienda de Viajes

Este es un proyecto completo de arquitectura moderna que implementa un Asistente Virtual Comercial inteligente (RAG) utilizando IA para guiar a los usuarios en la cotización y reserva de paquetes turísticos a Brasil y la costa Argentina.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** Angular 21, Signals (Manejo de estado reactivo eficiente), Native Federation (Arquitectura de Microfrontends).
- **Backend:** NestJS (TypeScript), Google Generative AI (Modelo `gemini-2.5-flash` y `gemini-embedding-001`).
- **Base de Datos Vectorial:** Supabase / PostgreSQL con la extensión `pgvector` para almacenamiento e indexación de embeddings de texto.

## 🧠 Arquitectura RAG (Retrieval-Augmented Generation)

1. **Sincronización Semántica:** El sistema procesa documentos y fragmentos informativos en formato de texto y genera vectores matemáticos de 3072 dimensiones.
2. **Búsqueda por Similitud:** Cuando el usuario consulta de forma natural, el backend convierte la pregunta en un vector y realiza una búsqueda de coseno mediante una función RPC en PostgreSQL para extraer el contexto más relevante.
3. **Agente Comercial con Memoria:** Se inyecta el contexto junto con el historial de chat (basado en sesiones temporales sin requerir login) en el modelo de lenguaje de Google, logrando respuestas ultra-concisas estructuradas con viñetas y un atajo lógico que detecta intenciones de precios y despliega botones interactivos de redirección en el frontend.

## ⚙️ Configuración del Entorno (.env)

Para correr el proyecto backend, es necesario configurar un archivo `.env` con las siguientes variables:
```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_KEY=tu_service_role_key
GEMINI_API_KEY=tu_api_key_de_google
```

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## 🚀 Guía de Instalación y Despliegue Local

Seguí estos pasos para clonar, configurar y ejecutar este ecosistema en tu máquina local.

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com

# Instalar dependencias en el Backend
npm install

# Instalar dependencias en el Frontend (Shell y Microfrontends)
npm install
```

### 2. Configurar la Base de Datos Vectorial (Supabase)
Entrá al **SQL Editor** de tu proyecto en Supabase y ejecutá el siguiente script para inicializar la extensión de vectores, la tabla de fragmentos y la tabla de historial temporal de chat:

```sql
-- Habilitar extensión vectorial
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla de almacenamiento RAG
CREATE TABLE IF NOT EXISTS fragmentos_pdf (
    id SERIAL PRIMARY KEY,
    pdf_nombre VARCHAR(255) NOT NULL,
    numero_pagina INT NOT NULL,
    texto_fragmento TEXT NOT NULL,
    vector_embedding vector(3072), -- Optimizada para el modelo gemini-embedding-001
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para el historial temporal de chat (Mapeo por sesiones sin requerir login)
CREATE TABLE IF NOT EXISTS historial_chat (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  rol VARCHAR(50) NOT NULL,
  contenido TEXT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Función RPC para calcular la similitud del coseno entre vectores
CREATE OR REPLACE FUNCTION buscar_fragmentos(
  query_embedding vector,
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id int,
  texto_fragmento text,
  pdf_nombre varchar,
  similitud float
)
LANGUAGE plpgsql AS \[ BEGIN   RETURN QUERY   SELECT     fragmentos_pdf.id,     fragmentos_pdf.texto_fragmento,     fragmentos_pdf.pdf_nombre,     (1 - (fragmentos_pdf.vector_embedding <=> query_embedding))::float AS similitud   FROM fragmentos_pdf   WHERE 1 - (fragmentos_pdf.vector_embedding <=> query_embedding) > match_threshold   ORDER BY fragmentos_pdf.vector_embedding <=> query_embedding ASC   LIMIT match_count; END; \];
```

### 3. Configurar Variables de Entorno
1. Dirigite a la carpeta del backend.
2. Duplicá el archivo `.env.example` y renombralo a `.env`.
3. Completá las variables con tus credenciales de Supabase y tu API Key gratuita de Google Gemini.

### 4. Ejecutar el Proyecto
```bash
# Iniciar el Backend (NestJS)
npm run start:dev

# Iniciar el Frontend (Angular 21 Native Federation)
npm run start
```
