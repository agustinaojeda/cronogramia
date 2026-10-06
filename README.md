# Cronogramia

![Status](https://img.shields.io/badge/Status-Completado-brightgreen?style=for-the-badge&logo=github)

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Groq_API-F34F29?style=for-the-badge&logo=openai&logoColor=white" alt="Groq API" />
  <img src="https://img.shields.io/badge/Google_Calendar-4285F4?style=for-the-badge&logo=googlecalendar&logoColor=white" alt="Google Calendar" />
</p>

**Cronogramia** es una aplicación web moderna que utiliza Inteligencia Artificial para extraer automáticamente eventos, fechas y horarios a partir de texto plano o archivos PDF (programas de materias, minutas de reunión, anuncios o correos) y sincronizarlos al instante con **Google Calendar** o exportarlos en formato **.ICS**.

---

## Características Principales

- **Extracción Inteligente con IA:** Procesamiento de lenguaje natural mediante la API de Groq para identificar títulos, descripciones y fechas a partir de fuentes desestructuradas.
- **Soporte para PDF y Texto Plano:** Carga directa de programas universitarios o documentos en PDF, además de la opción de pegar texto copiado.
- **Categorización Automática:** Opción de definir la materia o categoría para anteponerla automáticamente en los títulos de los eventos.
- **Gestión y Edición de Horarios:** Asignación inteligente de horarios por defecto con edición interactiva y modal de ajuste si el documento no especifica horas.
- **Sincronización con Google Calendar:** Integración mediante Google OAuth2 para añadir los eventos detectados a tu calendario con un solo clic.
- **Exportación a Formato .ICS:** Descarga de archivos de calendario compatibles con Apple Calendar, Outlook y otros clientes.
- **Interfaz Limpia y Responsiva:** Diseño SaaS minimalista en tema claro construido con React, Tailwind CSS y Lucide Icons.

---

## Tecnologías Utilizadas

### Frontend
- **React** (Vite)
- **Tailwind CSS** (Estilizado responsivo y moderno)
- **Lucide React** (Iconografía)
- **Axios** (Peticiones HTTP)

### Backend
- **Node.js** & **Express**
- **Groq API / Llama 3** (Extracción de eventos mediante IA)
- **PDF-Parse** (Extracción de texto desde archivos PDF)
- **Multer** (Procesamiento de archivos en memoria)
- **Googleapis** (Autenticación OAuth2 y sincronización con Google Calendar API)
- **ICS** (Generación de archivos de calendario `.ics`)

---

## Instalación y Configuración Local

### Prerrequisitos
- **Node.js** (v18 o superior)
- Una clave de API de **Groq** ([groq.com](https://groq.com))
- Credenciales de cliente OAuth2 en **Google Cloud Console**

---

### 1. Clonar el repositorio
```bash
git clone [https://github.com/tu-usuario/cronogramia.git](https://github.com/tu-usuario/cronogramia.git)
cd cronogramia
```

### 2. Configurar el Backend (server)
1. Ve a la carpeta del servidor e instala las dependencias:
```bash
cd server
npm install
```
2. Crea un archivo .env en la carpeta server basado en la estructura .env.example
3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

### 3. Configurar el Frontend (client)
1. Abre una nueva terminal, ve a la carpeta del cliente e instala las dependencias:
```bash
cd client
npm install
```
2. Inicia la aplicación en modo desarrollo:
```bash
npm run dev
```
3. Abre tu navegador en http://localhost:5173.