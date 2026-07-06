# Dynamic-QR-Proposal-Generator

Este proyecto es una aplicación web Single Page (SPA) optimizada para dispositivos móviles (Mobile-First) y lista para ser alojada en **Vercel**. 

Permite a cualquier usuario crear propuestas personalizadas de tipo "Sí o No" (ej. "¿Quieres ser mi novia?"). El sistema genera un enlace único con los datos encriptados de forma segura en la URL junto con un código QR. Al abrir el enlace, el destinatario se enfrenta a un botón "No" que esquiva infinitamente cualquier intento de ser presionado.

## Características (PRD Implementado)

### 1. Arquitectura Serverless y Segura
Para garantizar velocidad, costo cero y privacidad, **no hay base de datos ni backend**. Toda la información se almacena encriptada en la URL.
- **Creación**: Los datos se codifican en Base64 con soporte UTF-8 (emojis, tildes) y se añaden como Query Parameter.
- **Lectura**: Al cargar, JavaScript lee, desencripta de manera segura y renderiza la interfaz. 

### 2. Modo Creador
- Interfaz elegante con diseño *Glassmorphism*.
- Inputs validados para Pregunta (ej: "¿Quieres ser mi novia?") y Mensaje de éxito.
- Generación instantánea de Link y **Código QR**.

### 3. Modo Destinatario (Juego)
- Muestra la pregunta principal y dos opciones: SÍ y NO.
- **Lógica Anti-Click Absoluto**: El botón "NO" es imposible de presionar.
  - En móviles: Se evade al disparar `touchstart`.
  - En PC: Se evade al `mouseenter`.
  - El botón se mueve con `Math.random()` respetando siempre los bordes del dispositivo.
- **Pantalla de Éxito**: Al presionar SÍ, se muestra el mensaje configurado con una animación y una opción para crear una propuesta propia (viralidad).

### 4. Ciberseguridad Aplicada
- **Anti-XSS**: Renderizado estricto usando `.textContent` para anular cualquier intento de Inyección de HTML/Scripts.
- **Codificación URL**: Implementada con esquemas seguros: `btoa(unescape(encodeURIComponent(...)))`.
- **Accesibilidad bloqueada por diseño**: El botón esquivador utiliza `tabindex="-1"` para evitar trampas con teclado.

## Despliegue en Vercel
Este repositorio está estructurado para ser desplegado instantáneamente en Vercel. 
Dado que es código frontend estático puro (`index.html`, `styles.css`, `script.js`), Vercel lo detectará y servirá a través de su CDN ultrarrápido global en el momento en que se haga un *push* a la rama `main`.
